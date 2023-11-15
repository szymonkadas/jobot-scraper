import { Browser, Page } from "puppeteer";
// jak doprowadzić do require i mieć typy?
const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(stealthPlugin());
interface ScrapperOptions {
  searchValue: string;
  maxRecords: number;
}

interface OptionalScrapperOptions {
  searchValue?: string;
  maxRecords?: number;
}

export default class Scrapper {
  public searchValue: string;
  public maxRecords: number;
  public browser: Browser;
  public page: Page;
  public scrapedData: Object;
  public html: string;
  // Scrapper should be a set of methods that you could use for navigating through scrapped website.
  constructor({ searchValue, maxRecords }: ScrapperOptions) {
    this.changeConfig({ searchValue, maxRecords });
  }

  changeConfig = ({ searchValue, maxRecords }: OptionalScrapperOptions) => {
    this.searchValue = searchValue !== undefined ? searchValue : this.searchValue;
    this.maxRecords = maxRecords !== undefined ? maxRecords : this.maxRecords;
  };

  launch = async () => {
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
  };

  navigate = async (navTo: string) => {
    await this.page.goto(navTo);
  };

  scrape = async (properties: string[]) => {
    this.html = await this.page.content();
    const searchValue = this.searchValue;
    const maxRecords = this.maxRecords;
    const data = await this.page.evaluate(
      (searchValue, maxRecords, properties) => {
        const foundElements = Array.from(document.querySelectorAll(searchValue)).slice(0, maxRecords);
        return foundElements.map((element) => {
          const result = {};
          properties.forEach((property) => {
            result[property] = element[property];
          });
          return result;
        });
      },
      searchValue,
      maxRecords,
      properties
    );
    this.scrapedData = data;
  };

  getData = () => {
    return this.scrapedData;
  };

  close = async () => {
    await this.browser.close();
  };
}
