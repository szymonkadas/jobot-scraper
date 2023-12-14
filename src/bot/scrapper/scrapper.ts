import { Browser, Page } from "puppeteer";
// jak doprowadzić do require i mieć typy?
const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(stealthPlugin());
export interface ScrapperOptions {
  searchValue: string;
  limitRecords: number;
}

export interface OptionalScrapperOptions {
  searchValue?: string;
  limitRecords?: number;
  linkDivider?: string;
}

export default class Scrapper {
  public searchValue: string;
  public limitRecords: number;
  public browser: Browser;
  public page: Page;
  public scrapedData: string;
  public dataDivider: string = ";data-divider;";

  // Scrapper should be a set of methods that you could use for navigating through scrapped website.
  constructor({ searchValue, limitRecords }: ScrapperOptions) {
    this.changeConfig({ searchValue, limitRecords });
  }

  changeConfig = ({ searchValue, limitRecords }: OptionalScrapperOptions) => {
    this.searchValue = searchValue !== undefined ? searchValue : this.searchValue;
    this.limitRecords = limitRecords !== undefined ? limitRecords : this.limitRecords;
  };

  launch = async () => {
    this.browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });
    await this.launchNewPage();
  };

  launchNewPage = async () => {
    this.page = await this.browser.newPage();
    await this.page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    await this.page.setViewport({ width: 1920, height: 1080 });
  };

  reactionTime = () => {
    return Math.max(682, Math.round(Math.random() * 1500));
  };

  applyReactionTime = async (sloppiness: number) => {
    await new Promise((resolve) => setTimeout(resolve, this.reactionTime() * sloppiness));
  };

  click = async (pathToElement: string, timeout = 120000) => {
    await this.page.waitForSelector(pathToElement, { timeout: timeout });
    await this.page.click(pathToElement);
  };

  type = async (pathToElement: string, text?: string) => {
    await this.page.waitForSelector(pathToElement, { timeout: 120000 });
    await this.page.type(pathToElement, text ? text : this.searchValue);
    await this.page.keyboard.press("Enter");
  };

  navigate = async (navTo: string) => {
    // await this.launchNewPage();
    await setTimeout(async () => {}, this.reactionTime() * 5);
    await this.page.goto(navTo, { timeout: 120000 });
  };

  scrape = async (
    scrapePath: string,
    properties: string[],
    limitRecords?: boolean,
    dataDivider?: boolean,
    optional?: boolean
  ) => {
    try {
      await this.scrollThroughPage(5);
      await this.page.waitForSelector(scrapePath, { timeout: 360000 });
    } catch (e) {
      if (optional) {
        return "";
      } else {
        throw e;
      }
    }
    const data = await this.page.evaluate(
      (scrapePath, limitRecords, properties) => {
        const foundElements = Array.from(document.querySelectorAll(scrapePath)).slice(0, limitRecords);
        return foundElements.map((element) => {
          return properties.map((property) => {
            return element[property] !== undefined ? element[property] : element.getAttribute(property);
          });
        });
      },
      scrapePath,
      limitRecords ? this.limitRecords : undefined,
      properties
    );

    this.scrapedData = data.join(dataDivider ? this.dataDivider : "");
    return this.scrapedData;
  };

  scrollThroughPage = async (maxScrolls) => {
    await this.page.evaluate(async (maxScrolls) => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 200;
        let scrolls = 0;
        const timer = setInterval(() => {
          var scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          scrolls++;

          // stop scrolling if reached the end or the maximum number of scrolls
          if (totalHeight >= scrollHeight - window.innerHeight || scrolls >= maxScrolls) {
            clearInterval(timer);
            resolve("Finished scrolling");
          }
        }, 200);
      });
    }, maxScrolls);
  };

  getData = () => {
    return this.scrapedData;
  };

  close = async () => {
    await this.browser.close();
  };
}
