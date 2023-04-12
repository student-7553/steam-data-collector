import Infrastructure from "../infra/infrastructure";
import IgdbService from "./igdb-service";
import SteamService from "./steam-service";
import DbService from "./db-service";

export class Services {
  igdbService: IgdbService;
  steamService: SteamService;
  dbService: DbService;

  constructor(infra: Infrastructure) {
    this.igdbService = new IgdbService(infra);
    this.steamService = new SteamService(infra);
    this.dbService = new DbService(infra);
  }
}
