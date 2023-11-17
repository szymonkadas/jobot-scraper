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
  public scrapedData: string;
  public linkDivider: string = ";link-divider;";

  // Scrapper should be a set of methods that you could use for navigating through scrapped website.
  constructor({ searchValue, maxRecords }: ScrapperOptions) {
    this.changeConfig({ searchValue, maxRecords });
  }

  changeConfig = ({ searchValue, maxRecords }: OptionalScrapperOptions) => {
    this.searchValue = searchValue !== undefined ? searchValue : this.searchValue;
    this.maxRecords = maxRecords !== undefined ? maxRecords : this.maxRecords;
  };

  launch = async () => {
    this.browser = await puppeteer.launch({
      headless: false,
    });
    this.page = await this.browser.newPage();
  };

  // reactionTime = () => {
  //   return Math.max(482, Math.round(Math.random() * 1500));
  // };

  click = async (pathToElement: string, timeout = 10000) => {
    // for unknown reasons without try catch node is detached from document.
    try {
      await this.page.click(pathToElement);
    } catch (e) {
      // Like this should be enought, but it has to be within try catch...
      await this.page.waitForSelector(pathToElement, { timeout: timeout });
      await this.page.click(pathToElement);
    }
  };

  type = async (pathToElement: string, text?: string) => {
    await this.page.waitForSelector(pathToElement);
    await this.page.type(pathToElement, text ? text : this.searchValue);
    await this.page.keyboard.press("Enter");
  };

  navigate = async (navTo: string) => {
    await this.page.goto(navTo, { waitUntil: "domcontentloaded", timeout: 3000 });
  };

  scrape = async (scrapePath: string, properties: string[]) => {
    const data = await this.page.evaluate(
      (scrapePath, maxRecords, properties, linkDivider) => {
        const foundElements = Array.from(document.querySelectorAll(scrapePath)).slice(0, maxRecords);
        return foundElements.map((element) => {
          return properties.map((property) => {
            return element[property];
          });
        });
      },
      scrapePath,
      this.maxRecords,
      properties,
      this.linkDivider
    );

    this.scrapedData = data.join(this.linkDivider);
    return data.join(this.linkDivider);
  };

  getData = () => {
    return this.scrapedData;
  };

  close = async () => {
    await this.browser.close();
  };
}
