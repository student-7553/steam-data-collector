import getInfra from "../infra/getInfrastructure";
import { addYears, isAfter, isBefore } from "date-fns";
import { SteamApp } from "../infra/steam-api";

const infra = getInfra();

const fromDate = new Date("2020-04-08");
const toDate = addYears(fromDate, 1);

const tableName = "2020_4__2021_4";

interface PreData {
  tag: string;
  gameCount: number;
  recommendationCount: number;
  averageUSDPrice: number;
}

function mapSingleGame(
  data: { [tag: string]: PreData },
  steamGame: SteamApp,
  tags: string[]
) {
  for (const singleTag of tags) {
    if (!data[singleTag]) {
      data[singleTag] = {
        tag: singleTag,
        gameCount: 1,
        recommendationCount: steamGame.totalRecommendation,
        averageUSDPrice: steamGame.priceUSD,
      };
    }
    const newGameCount = data[singleTag].gameCount + 1;
    data[singleTag] = {
      tag: singleTag,
      gameCount: newGameCount,
      recommendationCount:
        data[singleTag].recommendationCount + steamGame.totalRecommendation,
      averageUSDPrice:
        (data[singleTag].averageUSDPrice * data[singleTag].gameCount +
          steamGame.priceUSD) /
        newGameCount,
    };
  }
}

async function mapData(
  steamGames: SteamApp[],
  mappedTags: { [steam_id: string]: string[] }
) {
  const data: { [tag: string]: PreData } = {};
  for (const singleSteamGame of steamGames) {
    if (!singleSteamGame.isReleased || !singleSteamGame.releaseDateMill) {
      continue;
    }
    if (
      isAfter(singleSteamGame.releaseDateMill, toDate) ||
      isBefore(singleSteamGame.releaseDateMill, fromDate)
    ) {
      continue;
    }
    if (!mappedTags[singleSteamGame.steam_appid]) {
      continue;
    }

    const tags = mappedTags[singleSteamGame.steam_appid];
    mapSingleGame(data, singleSteamGame, tags);
  }

  const { sqliteDatbase } = infra;
  for (const [_key, singleData] of Object.entries(data)) {
    await sqliteDatbase.insertCustomRawData(tableName, singleData);
  }
}

async function run() {
  await infra.sqliteDatbase.connectDb();
  await infra.sqliteDatbase.ensureTagDistributionTable(tableName);

  const mappedTags: { [steam_id: string]: string[] } = {};
  const tags = await infra.sqliteDatbase.getAllSteamTags();
  for (const tag of tags) {
    mappedTags[tag.steam_id] = tag.tag;
  }

  const steamGames = await infra.sqliteDatbase.getSteamGamesFromDateRange(
    fromDate.getTime(),
    toDate.getTime()
  );
  await mapData(steamGames, mappedTags);
}

run();
