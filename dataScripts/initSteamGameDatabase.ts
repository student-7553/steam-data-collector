import { getServices } from "../services/getServices";
import getInfra from "../infra/getInfrastructure";
import { BaseGame, FailedSteamGame } from "../infra/sqlite-database";
import { addDays, isBefore } from "date-fns";
import { SteamApp } from "../infra/steam-api";
import { chunk } from "lodash";
import { DAYS_TILL_STALE, STEAM_API_PARALLEL_REQUESTS } from "../config";
import throttledQueue from "throttled-queue";

const throttle = throttledQueue(1, 1500);

const infra = getInfra();
const services = getServices();

const currentDate = new Date();

async function initSteamGameDatabase(baseGames: BaseGame[]) {
  try {
    const { steamService } = services;

    const ids = baseGames.map((game) => game.steam_id);
    const steamGames = await infra.sqliteDatbase.getSteamAppsByIds(ids);

    const failedSteamGames = await infra.sqliteDatbase.getAllFailedSteamGames();

    const mappedSteamGame: Map<number, SteamApp> = new Map();
    for (const steamGame of steamGames) {
      mappedSteamGame.set(steamGame.steam_appid, steamGame);
    }

    const mappedFailedSteamGame: Map<number, FailedSteamGame> = new Map();
    for (const failedSteamGame of failedSteamGames) {
      mappedFailedSteamGame.set(failedSteamGame.steam_id, failedSteamGame);
    }

    const filteredBaseGames = baseGames.filter((game) => {
      return !checkIfAlreadyInit(
        game.steam_id,
        mappedSteamGame,
        mappedFailedSteamGame,
      );
    });
    const chunkedGames = chunk(filteredBaseGames, STEAM_API_PARALLEL_REQUESTS);

    let index = 0;
    for (const batchGames of chunkedGames) {
      const steamAppPromises = batchGames.map((game) => {
        return infra.steamApi.getGame(game.steam_id);
      });

      const results = await throttle(() => {
        return Promise.allSettled(steamAppPromises);
      });

      for (const singleResult of results) {
        if (singleResult.status === "fulfilled" && singleResult.value) {
          const steamApp = singleResult.value;
          try {
            await infra.sqliteDatbase.insertSteamApp(steamApp);
          } catch (error) {
            console.log(`Something went wrong on insert [${error}]`);
          }
        }
        index++;
        console.log(`Index [${index}] out of [${chunkedGames.length}]`);
      }
    }
  } catch (error) {
    console.log("caught error...........", error);
  }
}

function checkIfAlreadyInit(
  steamId: number,
  mappedSteamGame: Map<number, SteamApp>,
  mappedFailedGame: Map<number, FailedSteamGame>,
) {
  if (mappedSteamGame.has(steamId)) {
    const steamGame = mappedSteamGame.get(steamId)!;
    const staleDate = addDays(new Date(steamGame.createdAt), DAYS_TILL_STALE);
    if (isBefore(currentDate, staleDate)) {
      return true;
    }
  }
  if (mappedFailedGame.has(steamId)) {
    const failedSteamGame = mappedFailedGame.get(steamId)!;
    const staleDate = addDays(
      new Date(failedSteamGame.createdDate),
      DAYS_TILL_STALE,
    );
    if (isBefore(currentDate, staleDate)) {
      return true;
    }
  }
  return false;
}

async function run() {
  await infra.sqliteDatbase.connectDb();
  const allBaseGames = await infra.sqliteDatbase.getAllBaseGames();
  const reversedAllBaseGames = allBaseGames.reverse();
  initSteamGameDatabase(reversedAllBaseGames);
}

run();
