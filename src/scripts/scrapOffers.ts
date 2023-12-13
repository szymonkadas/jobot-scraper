import { ScrapperOptions } from "../bot/scrapper/scrapper";
import findOffers from "./findOffers";
const { Command } = require("commander");

interface programOptions extends ScrapperOptions {
  saveAsJSON: boolean;
}

// Getting args passed to script
const program = new Command();
program.option("-s, --searchValue <string>", "specifies phrase for search in services", "javascript-developer");
program.option("-l, --limitRecords <number>", "specifies how many offers to scrap (if possible)", "4");
program.option(
  "-d, --saveAsJson <boolean | undefined>",
  "specifies whether to save data in JSON if true, or CSV if false, or to none if not provided",
  "undefined"
);
program.parse(process.argv);
const options: programOptions = program.opts();

// finding offers
findOffers(options.searchValue, options.limitRecords, options.saveAsJSON);
