import fetch from "node-fetch";
import { getServices } from "../services/getServices";
export interface SteamAppList {
  appid: number;
  name: string;
}

export interface RawSteamApp {
  name: string;
  steam_appid: number;
  price_overview: {
    currency: string;
    initial: number;
    final: number;
    discount_percent: number;
    initial_formatted: string;
    final_formatted: string;
  };
  metacritic: {
    score: number;
    url: string;
  };
  recommendations: {
    total: number;
  };
  release_date: {
    coming_soon: boolean;
    date: string;
  };
  is_free: boolean;
  [key: string]: any;
}

export interface SteamApp {
  name: string;
  steam_appid: number;
  releaseDateMill?: number;
  isReleased: number;
  totalRecommendation: number;
  metacriticScore: number;
  createdAt: number;
  priceUSD: number;
  rawJson: RawSteamApp;
}

interface AppSuccessfulResponseData {
  success: boolean;
  data?: RawSteamApp;
}

interface AppResponse {
  [statusCode: string]: AppSuccessfulResponseData;
}

const STEAM_APPLIST_URL =
  "https://api.steampowered.com/ISteamApps/GetAppList/v2/";

const STEAM_APP_DEFAIL_URL = "https://store.steampowered.com/api/appdetails";

class STEAM_API {
  public async getAllGamesFromApi(): Promise<SteamAppList[]> {
    interface AppListResponse {
      applist: {
        apps: SteamAppList[];
      };
    }
    const response: string = await this.fetchData(STEAM_APPLIST_URL, "GET");
    const responseParsed: AppListResponse = JSON.parse(response);
    if (
      !responseParsed ||
      !responseParsed.applist ||
      !responseParsed.applist.apps
    ) {
      return [];
    }
    return responseParsed.applist.apps;
  }

  public async getGame(appId: number): Promise<SteamApp | null> {
    try {
      const response = await this.fetchData(
        STEAM_APP_DEFAIL_URL + `?appids=${appId}&cc=us`,
        "GET",
      );

      const parsedResponse: AppResponse = JSON.parse(response);

      const responseData: AppSuccessfulResponseData = Object.values(
        parsedResponse ? parsedResponse : [{ success: false }],
      )[0];

      if (responseData.success !== true) {
        console.info("Failed at Steam getGame / ", parsedResponse);
        console.info(STEAM_APP_DEFAIL_URL + `?appids=${appId}`);

        if (
          responseData.success !== undefined &&
          responseData.success !== null
        ) {
          const { steamService } = getServices();
          console.info(`Logged ${appId} in failedSteamGames`);
          const currentDate = new Date();
          await steamService.insertFailedSteamGame({
            steam_id: appId,
            createdDate: currentDate.getTime(),
          });
        }
        return null;
      }

      const steamRawApp = responseData.data!;

      const dateMil = new Date(steamRawApp.release_date.date);

      const steamApp: SteamApp = {
        name: steamRawApp.name,
        steam_appid: steamRawApp.steam_appid,
        createdAt: new Date().getTime(),
        releaseDateMill: dateMil ? dateMil.getTime() : undefined,
        isReleased: getIsReleased(steamRawApp) ? 1 : 0,
        totalRecommendation: getTotalRecommendations(steamRawApp),
        metacriticScore: getMetacriticScore(steamRawApp),
        priceUSD: getPriceUSD(steamRawApp),
        rawJson: steamRawApp,
      };

      return steamApp;
    } catch (error) {
      console.info("Failed at Steam getGame / ", error);
      console.info(STEAM_APP_DEFAIL_URL + `?appids=${appId}`);
      return null;
    }

    function getTotalRecommendations(steamRawApp: RawSteamApp): number {
      if (!steamRawApp.recommendations || !steamRawApp.recommendations.total) {
        return 0;
      }
      return steamRawApp.recommendations.total;
    }

    function getMetacriticScore(steamRawApp: RawSteamApp): number {
      if (!steamRawApp.metacritic || !steamRawApp.metacritic.score) {
        return 0;
      }
      return steamRawApp.metacritic.score;
    }

    function getPriceUSD(steamRawApp: RawSteamApp): number {
      if (!steamRawApp.price_overview || !steamRawApp.price_overview.initial) {
        return 0;
      }
      return steamRawApp.price_overview.initial;
    }

    function getIsReleased(steamRawApp: RawSteamApp): boolean {
      const dateMil = new Date(steamRawApp.release_date.date);
      if (!dateMil || dateMil.getTime() > new Date().getTime()) {
        return false;
      }
      return true;
    }
  }

  private async fetchData(
    url: string,
    method: "GET" | "POST",
    body?: string,
  ): Promise<string> {
    const response = await fetch(url, {
      method: method,
      body: body,
    });
    return method === "POST" ? response.json() : response.text();
  }
}
export default STEAM_API;
