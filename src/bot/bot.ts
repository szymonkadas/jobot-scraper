import PracujScrapper from "./scrapper/PracujScrapper";
import { OptionalScrapperOptions, ScrapperOptions } from "./scrapper/scrapper";
export interface JobOffer {
  title: string;
  description: string;
  company: string;
  salaryFrom: string;
  salaryTo: string;
  currency: string;
  offerURL: string;
  technologies: string[];
  addedAt: string;
}
export class Bot {
  private searchValue: string;
  private limitRecords: number;

  constructor({ searchValue, limitRecords }: ScrapperOptions) {
    this.changeConfig({ searchValue, limitRecords });
  }

  changeConfig = ({ searchValue, limitRecords }: OptionalScrapperOptions) => {
    this.searchValue = searchValue !== undefined ? searchValue : this.searchValue;
    this.limitRecords = limitRecords !== undefined ? limitRecords : this.limitRecords;
  };

  scrapFirstService = () => PracujScrapper({ searchValue: this.searchValue, limitRecords: this.limitRecords });
}
