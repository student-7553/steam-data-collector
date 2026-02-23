import Infrastructure from "../infra/infrastructure";
import { BaseGame, baseDbName } from "../infra/sqlite-database";
import { objectToValues } from "../lib/valueHelper";

export default class DbService {
  constructor(public infra: Infrastructure) {}

  async insertAllBaseGames(baseGames: BaseGame[]) {
    const massValuesString = baseGames.map((game) => {
      return objectToValues(game);
    });
    await this.infra.sqliteDatbase.rawInsertToDb(baseDbName, massValuesString);
  }

  async *generatorAllSteamGames(size: number = 1000) {
    let offset = 0;
    while (true) {
      const steamGames = await this.infra.sqliteDatbase.getSteamGames(
        size,
        offset,
      );
      if (!steamGames || steamGames.length === 0) {
        break;
      }
      yield steamGames;
      offset = offset + size;
    }
  }
}
