import { getServices } from "../services/getServices";
import getInfra from "../infra/getInfrastructure";
import { BaseGame, SteamTag } from "../infra/sqlite-database";
import { addDays, isBefore } from "date-fns";
import { chunk } from "lodash";
import { DAYS_TILL_STALE, SCRAPE_PARALLEL_REQUESTS } from "../config";
import throttledQueue from "throttled-queue";

const throttle = throttledQueue(1, 500);

const services = getServices();
const infra = getInfra();
const currentDate = new Date();

async function initSteamTagDatabase(
  baseGames: BaseGame[],
  hardReset: boolean = false,
) {
  const { steamService } = services;
  await infra.sqliteDatbase.connectDb();

  const ids = baseGames.map((game) => game.steam_id);
  const steamTags = await infra.sqliteDatbase.getSteamTagsByIds(ids);

  const mappedSteamTags: Map<number, SteamTag> = new Map();
  steamTags.forEach((tag) => {
    mappedSteamTags.set(tag.steam_id, tag);
  });

  const filteredBaseGames = hardReset
    ? baseGames
    : baseGames.filter((game) => {
        return !checkIfAlreadyInit(game.steam_id, mappedSteamTags);
      });

  const chunkedGames = chunk(filteredBaseGames, SCRAPE_PARALLEL_REQUESTS);
  let index = 0;

  for (const batchGames of chunkedGames) {
    const steamTagsPromises = batchGames.map((game) => {
      return new Promise<{ tags: string[]; steamId: number }>(
        async (resolve, reject) => {
          try {
            const tags = await steamService.scrapeTagsFromAppId(game.steam_id);
            resolve({
              tags: tags,
              steamId: game.steam_id,
            });
          } catch (error) {
            reject(error);
          }
        },
      );
    });

    const results = await throttle(() => {
      return Promise.allSettled(steamTagsPromises);
    }).catch((error) => {
      console.error(error);
    });

    if (!results) {
      continue;
    }

    for (const singleResult of results) {
      if (singleResult.status === "fulfilled" && singleResult.value) {
        const steamTag: SteamTag = {
          steam_id: singleResult.value.steamId,
          tag: singleResult.value.tags,
          createdDate: currentDate.getTime(),
        };
        try {
          await infra.sqliteDatbase.insertSteamTag(steamTag);
        } catch (error) {
          console.log(`Something went wrong on insert [${error}]`);
        }
      }

      index++;
      console.log(`Index [${index}] out of [${filteredBaseGames.length}]`);
    }
  }
}

function checkIfAlreadyInit(
  steamId: number,
  mappedSteamTags: Map<number, SteamTag>,
) {
  if (mappedSteamTags.has(steamId)) {
    const steamTag = mappedSteamTags.get(steamId)!;
    const staleDate = addDays(new Date(steamTag.createdDate), DAYS_TILL_STALE);
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
  initSteamTagDatabase(reversedAllBaseGames, false);
}

run();
