import { Bot } from "../bot/bot";
import { ScrapperOptions } from "../bot/scrapper/scrapper";
import getCurrentDateAsUUID from "../utils/getCurrentDateAsUUID";

const fileSystem = require("fs");
const csvWriter = require("csv-writer");
const { Command } = require("commander");

// Getting args passed to script
const program = new Command();
program.option("-s, --searchValue <string>", "javascript-developer");
program.option("-l, --limitRecords <number>", "4");
program.parse(process.argv);
const options: ScrapperOptions = program.opts();
// finding offers
export const findOffers = async (searchValue: string, limitRecords: number) => {
  console.log("Scrapping...");
  console.log(options);
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
};

findOffers(options.searchValue, options.limitRecords);
