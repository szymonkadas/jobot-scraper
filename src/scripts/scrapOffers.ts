import { ScrapperOptions } from "../bot/scrapper/scrapper";

import findOffers from "./findOffers";
const { Command } = require("commander");
// Getting args passed to script
const program = new Command();
program.option("-s, --searchValue <string>", "javascript-developer");
program.option("-l, --limitRecords <number>", "4");
program.parse(process.argv);
const options: ScrapperOptions = program.opts();
// finding offers
findOffers(options.searchValue, options.limitRecords);
