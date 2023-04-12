import { IGDB_Game, IGDB_website } from "../infra/igdb-api";
import Infrastructure from "../infra/infrastructure";

const MAX_LIMIT = 500;
const STEAM_WEBSITE_CATEGORY = 13;

export default class IgdbService {
  constructor(public infra: Infrastructure) {}
  async getRecentGames(from: number, to: number): Promise<IGDB_Game[]> {
    const requestBody = `fields *;where first_release_date >= ${from} & first_release_date <= ${to};sort date asc;`;
    const games = await this.getAllGamesFromApi(requestBody);
    return games;
  }

  async getSteamWebsiteFromWebsiteIds(
    websites: number[]
  ): Promise<IGDB_website[]> {
    const ids = websites.join(",");
    const requestBody = `  
        fields *;
        where id = (
            ${ids}
        ) & category = ${STEAM_WEBSITE_CATEGORY};`;
    const gameWebsites: IGDB_website[] = await this.getAllWebsites(requestBody);

    return gameWebsites.filter(
      (gameWebsite) => gameWebsite.category === STEAM_WEBSITE_CATEGORY
    );
  }

  extractWebsiteIds(games: IGDB_Game[]) {
    let websiteIds: number[] = [];
    for (const game of games) {
      if (game.websites && game.websites.length > 0) {
        websiteIds = websiteIds.concat(game.websites);
      }
    }
    return websiteIds;
  }

  private async getAllGamesFromApi(body: string): Promise<IGDB_Game[]> {
    let games: IGDB_Game[] = [];
    let offset = 0;
    while (true) {
      const mergedBody = body + `limit ${MAX_LIMIT};offset ${offset};`;
      const gamesBatch: IGDB_Game[] = await this.infra.igdbApi.getGames(
        mergedBody
      );
      games = games.concat(gamesBatch);
      if (!body || body.length !== MAX_LIMIT) {
        break;
      } else {
        offset = offset + MAX_LIMIT;
      }
    }

    return games;
  }
  private async getAllWebsites(body: string): Promise<IGDB_website[]> {
    let gameWebsites: IGDB_website[] = [];
    let offset = 0;
    while (true) {
      const mergedBody = body + `limit ${MAX_LIMIT};offset ${offset};`;
      const websitesBatch: IGDB_website[] =
        await this.infra.igdbApi.getWebsites(mergedBody);
      gameWebsites = gameWebsites.concat(websitesBatch);
      if (!body || body.length !== MAX_LIMIT) {
        break;
      } else {
        offset = offset + MAX_LIMIT;
      }
    }
    return gameWebsites;
  }
}
