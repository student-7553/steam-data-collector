import fetch from "node-fetch";
import { parse } from "node-html-parser";

const TAG_CLASS = ".app_tag";

export const STEAM_APP_URL = "https://store.steampowered.com/app/";

class HTML_SCRAPPER {
  async scrapeTagsFromAppId(appId: number) {
    const response = await fetch(STEAM_APP_URL + appId);
    if (response.status !== 200) {
      console.error("Failed at scrapeTagsFromAppId / ", response.status);
      throw new Error(
        "Failed fetch on scrapeTagsFromAppId/" + STEAM_APP_URL + appId,
      );
    }

    const htmlText = await response.text();
    const root = parse(htmlText);
    const tagNodes = root.querySelectorAll(TAG_CLASS);
    if (!tagNodes || tagNodes.length === 0) {
      return [];
    }
    const tags = tagNodes.map((node) => node.text.trim());
    return tags;
  }
}
export default HTML_SCRAPPER;
