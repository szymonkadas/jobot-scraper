import PracujScrapper from "./scrapper/PracujScrapper";
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
  // Logic should be encapsulated in bot class body
  scrapFirstService = PracujScrapper;
}
