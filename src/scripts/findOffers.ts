import { Bot } from "../bot/bot";
import getCurrentDateAsUUID from "../utils/getCurrentDateAsUUID";
const fileSystem = require("fs");
const findOffers = async () => {
  console.log("Scrapping...");
  const fileID = getCurrentDateAsUUID();
  const bot = new Bot();
  const result = await bot.scrapFirstService();
  console.log(`${result.length} offers found`);
  fileSystem.writeFile(
    `./scrap-results/${fileID}.json`,
    JSON.stringify(result),
    (error) => error && console.log(error)
  );
};
findOffers();
