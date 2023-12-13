import { Bot } from "../bot/bot";
import getCurrentDateAsUUID from "../utils/getCurrentDateAsUUID";

interface programOptions extends ScrapperOptions {
  saveAsJSON: boolean;
}

const fileSystem = require("fs");
const csvWriter = require("csv-writer");
const { Command } = require("commander");

// Getting args passed to script
const program = new Command();
program.option("-s, --searchValue <string>", "specifies phrase for search in services", "javascript-developer");
program.option("-l, --limitRecords <number>", "specifies how many offers to scrap (if possible)", "4");
program.option("-d, --saveDataAsJson <boolean>", "specifies whether to save data in JSON if true, or CSV if false.", "true");
program.parse(process.argv);
const options: ScrapperOptions & {
  saveDataAsJson: boolean;
} = program.opts();
// finding offers
const findOffers = async (searchValue: string, limitRecords: number, saveDataAsJson = true) => {
  console.log("Scrapping...");
  const fileID = getCurrentDateAsUUID();
  const bot = new Bot({ searchValue, limitRecords });
  const result = await bot.scrapFirstService();
  // finished scraping part:
  console.log(`${result.length} offers found`);
  const savePath = `./scrap-results/${fileID}`;
  if (saveDataAsJson) {
    // save to JSON file
    fileSystem.writeFile(`${savePath}.json`, JSON.stringify(result), (error) => error && console.log(error));
  } else {
    // save to CSV file
    const headers = Object.keys(result[0]).map((key) => ({ id: key, title: key }));
    const csvObject = csvWriter.createObjectCsvWriter({
      path: `${savePath}.csv`,
      header: headers,
    });
    csvObject.wri;
    csvObject.writeRecords(result).catch((error) => console.log(error));
  }
};

findOffers(options.searchValue, options.limitRecords, options.saveDataAsJson);
