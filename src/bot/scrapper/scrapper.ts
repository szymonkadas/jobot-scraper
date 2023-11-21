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
  linkDivider?: string;
}

export default class Scrapper {
  public searchValue: string;
  public maxRecords: number;
  public browser: Browser;
  public page: Page;
  public scrapedData: string;
  public dataDivider: string = ";data-divider;";

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
    // await this.launchNewPage();
    await setTimeout(async () => {}, this.reactionTime() * 5);
    await this.page.goto(navTo, { timeout: 6000 });
  };

  scrape = async (
    scrapePath: string,
    properties: string[],
    maxRecords?: boolean,
    dataDivider?: boolean,
    optional?: false
  ) => {
    try {
      this.scrollThroughPage(20);
      await this.page.waitForSelector(scrapePath, { timeout: 10000 });
    } catch (e) {
      if (optional) {
        return "";
      } else {
        throw e;
      }
    }
    await setTimeout(async () => {}, this.reactionTime() * 5);
    const data = await this.page.evaluate(
      (scrapePath, maxRecords, properties) => {
        const foundElements = Array.from(document.querySelectorAll(scrapePath)).slice(0, maxRecords);
        return foundElements.map((element) => {
          return properties.map((property) => {
            return element[property] !== undefined ? element[property] : element.getAttribute(property);
          });
        });
      },
      scrapePath,
      maxRecords ? this.maxRecords : undefined,
      properties
    );

    this.scrapedData = data.join(dataDivider ? this.dataDivider : "");
    return this.scrapedData;
  };

  scrollThroughPage = async (maxScrolls) => {
    await this.page.evaluate(async (maxScrolls) => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
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
        }, 100);
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
