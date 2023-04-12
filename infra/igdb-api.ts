import fetch from "node-fetch";

const clientId = "";
const accessToken = "";

export const gamesUrl = "https://api.igdb.com/v4/games/";
export const websiteUrl = "https://api.igdb.com/v4/websites/";

export interface IGDB_Game {
  id: number;
  age_ratings: number[];
  artworks: string;
  category: number;
  created_at: number;
  first_release_date: number;
  game_modes: number[];
  genres: number[];
  name: string;
  platforms: number[];
  release_dates: number[];
  screenshots: number[];
  slug: string;
  themes: number[];
  updated_at: number;
  url: string;
  version_parent: number;
  version_title: string;
  checksum: string;
  language_supports: number[];
  websites?: number[];
}

export interface IGDB_website {
  id: number;
  category: number;
  game: number;
  trusted: boolean;
  url: string;
  checksum: string;
}

class IGDB_API {
  public async getGames(body: string): Promise<IGDB_Game[]> {
    return this.fetchData(gamesUrl, body);
  }

  public async getWebsites(body: string): Promise<IGDB_website[]> {
    return this.fetchData(websiteUrl, body);
  }

  private async fetchData(url: string, body: string): Promise<any> {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${accessToken}`,
      },
      body: body,
    });

    return response.json();
  }
}
export default IGDB_API;
