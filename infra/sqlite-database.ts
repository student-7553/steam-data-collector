import { Database, open } from "sqlite";
import sqlite3 from "sqlite3";
import { SteamApp } from "./steam-api";
import { databaseUrl } from "../config";

export const baseDbName = "game";
export const steamTagDbName = "steamTag";
export const steamGameDbName = "steamGame";
export const failedSteamGameDbName = "failedSteamGame";

export interface FailedSteamGame {
  steam_id: number;
  createdDate: number;
}

export interface BaseGame {
  id: number;
  steam_id: number;
  igdb_id: number;
}

export interface SteamTag {
  steam_id: number;
  tag: string[];
  createdDate: number;
}

export interface SteamTagRecord {
  steam_id: number;
  tag: string;
  createdDate: number;
}

export interface SteamAppRecord {
  name: string;
  steam_appid: number;
  releaseDateMill?: number;
  isReleased: number;
  totalRecommendation: number;
  metacriticScore: number;
  priceUSD: number;
  createdAt: number;
  rawJson: string | null;
}

class SqliteDatabase {
  db: Database | null;

  constructor() {
    this.db = null;
  }

  public async connectDb() {
    return this.connect();
  }

  public async getRecentGames(
    offset: number,
    limit: number
  ): Promise<BaseGame[]> {
    const result = await this.db!.all(
      `SELECT * FROM ${baseDbName} ORDER BY steam_id desc LIMIT ${limit} OFFSET ${offset}`
    );
    return result;
  }

  public async getAllBaseGames(): Promise<BaseGame[]> {
    const result = await this.db!.all(`SELECT * FROM ${baseDbName}`);
    return result;
  }

  public async getSteamGames(
    size: number,
    offset: number
  ): Promise<SteamApp[]> {
    const results = await this.db!.all(
      `SELECT * FROM ${steamGameDbName} limit ? offset ?`,
      [size, offset]
    );
    const steamApps = results.map((record) => this.recordToSteamApp(record));
    return steamApps;
  }

  public async getSteamGamesFromDateRange(
    from: number,
    to: number
  ): Promise<SteamApp[]> {
    const result = await this.db!.all(
      `SELECT * FROM ${steamGameDbName} where releaseDateMill > ? and releaseDateMill < ?`,
      from,
      to
    );
    return result;
  }

  public async getAllFailedSteamGames(): Promise<FailedSteamGame[]> {
    const result = await this.db!.all(`SELECT * FROM ${failedSteamGameDbName}`);
    return result;
  }

  public async getSteamTagsByIds(ids: number[]): Promise<SteamTag[]> {
    const idsString = ids.join(",");
    const results: SteamTagRecord[] = await this.db!.all(
      `SELECT * FROM ${steamTagDbName} where steam_id IN (${idsString})`
    );
    const steamTags = results.map((record) => this.recordToSteamTag(record));
    return steamTags;
  }

  public async getAllSteamTags(): Promise<SteamTag[]> {
    const results = await this.db!.all(`SELECT * FROM ${steamTagDbName}`);
    const steamTags = results.map((record) => this.recordToSteamTag(record));
    return steamTags;
  }

  public async getSteamAppsByIds(ids: number[]): Promise<SteamApp[]> {
    const idsString = ids.join(",");
    const results: SteamAppRecord[] = await this.db!.all(
      `SELECT * FROM ${steamGameDbName} where steam_appid IN (${idsString})`
    );

    const steamApps = results.map((record) => this.recordToSteamApp(record));
    return steamApps;
  }

  public async rawInsertToDb(dbName: string, values: string[]) {
    const prepedSql = `INSERT INTO ${dbName} VALUES ${values.join(",")}`;
    await this.db!.run(prepedSql);
  }

  public async insertToDb(dbName: string, values: string[]) {
    const questionMarks = values.map(() => "?");
    const prepedSql = `INSERT INTO '${dbName}' VALUES (${questionMarks.join(
      ","
    )})`;
    await this.db!.run(prepedSql, values);
  }

  public async insertSteamTag(steamTag: SteamTag): Promise<void> {
    const record = this.steamTagToRecord(steamTag);
    const values: string[] = Object.values(record);
    await this.insertToDb(steamTagDbName, values);
    return;
  }

  public async insertCustomRawData(
    tableName: string,
    data: object
  ): Promise<void> {
    const values: string[] = Object.values(data);
    await this.insertToDb(tableName, values);
    return;
  }

  public async insertSteamApp(steamApp: SteamApp): Promise<void> {
    const record = this.steamAppToRecord(steamApp);
    const values: string[] = Object.values(record);

    await this.insertToDb(steamGameDbName, values);
    return;
  }

  public async ensureBaseTables() {
    if (!this.db) {
      return;
    }
    await this.db.exec(
      `CREATE TABLE IF NOT EXISTS ${baseDbName} (
           id INTEGER PRIMARY KEY,
           steam_id INTEGER,
           igdb_id INTEGER
         );`
    );
    await this.db.exec(
      `CREATE TABLE IF NOT EXISTS ${steamTagDbName} (
          steam_id INTEGER PRIMARY KEY,
          tag TEXT,
          createdDate INTEGER
         );`
    );

    await this.db.exec(
      `CREATE TABLE IF NOT EXISTS ${steamGameDbName} (
        name TEXT,
        steam_appid INTEGER PRIMARY KEY,
        releaseDateMill INTEGER,
        isReleased INTEGER,
        totalRecommendation INTEGER,
        metacriticScore INTEGER,
        priceUSD INTEGER,
        createdAt INTEGER,
        rawJson TEXT
      );`
    );

    await this.db.exec(
      `CREATE TABLE IF NOT EXISTS ${failedSteamGameDbName} (
          steam_id INTEGER PRIMARY KEY,
          createdDate INTEGER
         );`
    );
  }

  public async ensureTagDistributionTable(tableName: string) {
    if (!this.db) {
      return;
    }
    await this.db.exec(
      `CREATE TABLE IF NOT EXISTS '${tableName}' (
           tag TEXT,
           gameCount INTEGER,
           recommendationCount INTEGER,
           averageUSDPrice INTEGER
         );`
    );
  }

  private steamTagToRecord(steamTag: SteamTag): SteamTagRecord {
    const stringTags = this.stringifyAndEscape(steamTag.tag);
    const tagRecord: SteamTagRecord = {
      steam_id: steamTag.steam_id,
      tag: stringTags,
      createdDate: steamTag.createdDate,
    };
    return tagRecord;
  }

  private recordToSteamTag(record: SteamTagRecord): SteamTag {
    const tag: SteamTag = {
      steam_id: record.steam_id,
      tag: JSON.parse(record.tag),
      createdDate: record.createdDate,
    };
    return tag;
  }

  private recordToSteamApp(steamAppRecord: SteamAppRecord): SteamApp {
    const steamGame: SteamApp = {
      name: steamAppRecord.name,
      steam_appid: steamAppRecord.steam_appid,
      releaseDateMill: steamAppRecord.releaseDateMill,
      isReleased: steamAppRecord.isReleased,
      totalRecommendation: steamAppRecord.totalRecommendation,
      metacriticScore: steamAppRecord.metacriticScore,
      priceUSD: steamAppRecord.priceUSD,
      createdAt: steamAppRecord.createdAt,
      rawJson: steamAppRecord.rawJson
        ? JSON.parse(steamAppRecord.rawJson)
        : null,
    };
    return steamGame;
  }

  private steamAppToRecord(steamGame: SteamApp): SteamAppRecord {
    const rawJsonString = this.stringifyAndEscape(steamGame.rawJson);

    const steamGameRecord: SteamAppRecord = {
      name: this.escapeString(steamGame.name),
      steam_appid: steamGame.steam_appid,
      releaseDateMill: steamGame.releaseDateMill,
      isReleased: steamGame.isReleased,
      totalRecommendation: steamGame.totalRecommendation,
      metacriticScore: steamGame.metacriticScore,
      priceUSD: steamGame.priceUSD,
      createdAt: steamGame.createdAt,
      rawJson: rawJsonString,
    };
    return steamGameRecord;
  }

  private async connect() {
    return new Promise<void>(async (resolve) => {
      this.db = await open({
        filename: databaseUrl,
        driver: sqlite3.Database,
      });
      resolve();
    });
  }

  private stringifyAndEscape(object: object): string {
    return this.escapeString(JSON.stringify(object));
  }

  private escapeString(string: string): string {
    return string?.replaceAll("'", "''");
  }
}
export default SqliteDatabase;
