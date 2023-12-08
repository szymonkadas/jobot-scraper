import { Bot } from "../bot/bot";
import getCurrentDateAsUUID from "../utils/getCurrentDateAsUUID";

export default async function findOffers(searchValue: string, limitRecords: number) {
  const fileSystem = require("fs");
  const csvWriter = require("csv-writer");
  console.log("Scrapping...");
  const fileID = getCurrentDateAsUUID();
  const bot = new Bot({ searchValue, limitRecords });
  const result = await bot.scrapFirstService();
  // finished scraping part:
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
  return result;
}
