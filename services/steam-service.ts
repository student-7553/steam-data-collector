import Infrastructure from "../infra/infrastructure";
import { SteamApp, SteamAppList } from "../infra/steam-api";
import {
  BaseGame,
  FailedSteamGame,
  SteamTag,
  failedSteamGameDbName,
} from "../infra/sqlite-database";
import { objectToValues } from "../lib/valueHelper";

export default class SteamService {
  constructor(public infra: Infrastructure) {}
  async scrapeTagsFromAppId(appId: number) {
    return this.infra.htmlScrapper.scrapeTagsFromAppId(appId);
  }

  async getAllGamesFromApi(): Promise<SteamAppList[]> {
    return this.infra.steamApi.getAllGamesFromApi();
  }

  async insertFailedSteamGame(failedSteamGame: FailedSteamGame) {
    const valueString = objectToValues(failedSteamGame);
    await this.infra.sqliteDatbase.rawInsertToDb(failedSteamGameDbName, [
      valueString,
    ]);
  }

  createBaseGame(steamAppList: SteamAppList): BaseGame {
    return {
      id: steamAppList.appid,
      steam_id: steamAppList.appid,
      igdb_id: 0,
    };
  }
}
