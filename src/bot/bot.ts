import Scrapper from "../bot/scrapper/scrapper";
interface JobOffer {
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
  scrapFirstService = async () => {
    const ScrapperInstance = new Scrapper({ searchValue: "frontend", maxRecords: 4 });
    const searchbarSelector = ".core_fhefgxl";
    const searchButtonSelector = ".core_s1cjjpc4 .core_b1fqykql";
    const sortButtonSelector = ".listing_l1b5wr8p";
    const mostSuitableSortSelector = ".listing_onyjmg2:nth-of-type(2)";
    const paycheckRangeSelector = ".core_sm237sg";
    const offersSelector = "[data-test='section-offers'] div .core_n194fgoq:not(.c1s2myew *)";

    await ScrapperInstance.launch();
    await ScrapperInstance.navigate("https://it.pracuj.pl/");
    try {
      // accept only necessary cookies
      await ScrapperInstance.click("[data-test='button-customizeCookie']");
      await ScrapperInstance.click("[data-test='button-submit']");
    } catch (e) {
      console.log("no need to accept cookies");
    }
    //offers setup
    await ScrapperInstance.type(searchbarSelector);
    await ScrapperInstance.click(searchButtonSelector);
    await ScrapperInstance.click(sortButtonSelector);
    await ScrapperInstance.click(mostSuitableSortSelector);
    await ScrapperInstance.click(paycheckRangeSelector, 5000);
    await ScrapperInstance.click(searchButtonSelector);
    await ScrapperInstance.scrape(offersSelector, ["href"], true, true);

    const links = await ScrapperInstance.getData();
    const results: JobOffer[] = [];
    const processLink = async (offerURL) => {
      await ScrapperInstance.navigate(offerURL);
      const titleSelector = "[data-scroll-id='job-title']";
      const descriptionSelector =
        ".offer-viewzxQhTZ > :not(.offer-view8N6um9, .offer-viewsBrte4, [data-test='section-technologies'])";
      const companySelector = "[data-scroll-id='employer-name']";
      const salaryToSelector = "[data-test='text-earningAmountValueTo']";
      const salaryFromSelector = "[data-test='text-earningAmountValueFrom']";
      const osSelector = "[data-test='item-operating-system'] image";
      const technologiesSelector = "[data-test='section-technologies'] .offer-viewEX0Eq-";

      const title = await ScrapperInstance.scrape(titleSelector, ["innerText"]);
      const description = (await ScrapperInstance.scrape(descriptionSelector, ["innerText"]))
        .split("\n")
        .filter((val) => val !== "")
        .join(". ");
      // slice to chop off "About the company"
      const company = await ScrapperInstance.scrape(companySelector, ["innerText"]).then((data) => data.slice(0, -17));
      const [salaryTo, currency] = (await ScrapperInstance.scrape(salaryToSelector, ["innerText"])).split(" ");
      let salaryFrom: string;
      try {
        // choppin' off "-"
        salaryFrom = (await ScrapperInstance.scrape(salaryFromSelector, ["innerText"])).slice(0, -1);
      } catch (e) {
        salaryFrom = salaryTo;
      }
      const operationalSystems: string[] = await ScrapperInstance.scrape(osSelector, ["alt"], false, true, true).then(
        (data) => data.split(ScrapperInstance.dataDivider)
      );
      const technologies = await ScrapperInstance.scrape(technologiesSelector, ["innerText"]).then((data) =>
        data
          .split("\n")
          .concat(operationalSystems)
          .filter((word) => word !== "")
      );
      const data: JobOffer = await {
        title,
        description,
        company,
        salaryFrom,
        salaryTo,
        currency,
        offerURL,
        technologies,
        addedAt: "unknown",
      };

      results.push(await data);
    };

    for (const link of links.split(ScrapperInstance.dataDivider)) {
      await processLink(link);
    }

    await ScrapperInstance.close();
    return results;
  };
}
