import { Database } from "sqlite";
import HTML_SCRAPPER from "./html-scrapper";
import IGDB_API from "./igdb-api";
import STEAM_API from "./steam-api";
import SqliteDatabase from "./sqlite-database";

class Infrastructure {
  igdbApi: IGDB_API;
  steamApi: STEAM_API;
  htmlScrapper: HTML_SCRAPPER;
  sqliteDatbase: SqliteDatabase;

  constructor() {
    this.igdbApi = new IGDB_API();
    this.steamApi = new STEAM_API();
    this.htmlScrapper = new HTML_SCRAPPER();
    this.sqliteDatbase = new SqliteDatabase();
  }
}

export default Infrastructure;
