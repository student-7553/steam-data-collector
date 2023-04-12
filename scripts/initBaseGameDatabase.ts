import { getServices } from "../services/getServices";
import getInfra from "../infra/getInfrastructure";
import { chunk } from "lodash";
import { BaseGame } from "../infra/sqlite-database";

const services = getServices();
const infra = getInfra();

async function initGameDatabase() {
  const { steamService, dbService } = services;
  await infra.sqliteDatbase.connectDb();
  const allSteamGames = await steamService.getAllGamesFromApi();
  const allSavedBaseGames = await infra.sqliteDatbase.getAllBaseGames();
  const mappedAllSavedBaseGames: Map<number, BaseGame> = new Map<
    number,
    BaseGame
  >(allSavedBaseGames.map((baseGame) => [baseGame.id, baseGame]));
  const filteredAllSteamGames = allSteamGames.filter(
    (steamGame) => !mappedAllSavedBaseGames.has(steamGame.appid)
  );

  const chunkedGames = chunk(filteredAllSteamGames, 10000);
  for (const chunkedGame of chunkedGames) {
    const baseGames = chunkedGame.map((appList) =>
      steamService.createBaseGame(appList)
    );
    await dbService.insertAllBaseGames(baseGames);
  }
}

initGameDatabase();
