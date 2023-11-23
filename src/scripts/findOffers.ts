import { Bot } from "../bot/bot";
import getCurrentDateAsUUID from "../utils/getCurrentDateAsUUID";
const fileSystem = require("fs");
const csvWriter = require("csv-writer");

const findOffers = async () => {
  console.log("Scrapping...");
  const fileID = getCurrentDateAsUUID();
  const bot = new Bot();
  const result = await bot.scrapFirstService();

  setTimeout(() => {
    console.log(`${result.length} offers found`);
    const savePath = `./scrap-results/${fileID}`;
    // save to JSON file
    fileSystem.writeFile(`${savePath}.json`, JSON.stringify(result), (error) => error && console.log(error));
    // save to CSV file
    const headers = Object.keys(result[0]).map((key) => ({ id: key, title: key }));
    const csvObject = csvWriter.createObjectCsvWriter({
      path: `${savePath}.csv`,
      header: headers,
    });
    csvObject.wri;
    csvObject.writeRecords(result).catch((error) => console.log(error));
  }, 3000);
};
findOffers();
