import { JobOffer } from "../bot";
import Scrapper from "./scrapper";

export default async function PracujScrapper() {
  const scrapperInstance = new Scrapper({ searchValue: "frontend", maxRecords: 4 });
  const searchbarSelector = ".core_fhefgxl";
  const searchButtonSelector = ".core_s1cjjpc4 .core_b1fqykql";
  const sortButtonSelector = ".listing_l1b5wr8p";
  const mostSuitableSortSelector = ".listing_onyjmg2:nth-of-type(2)";
  const paycheckRangeSelector = ".core_sm237sg";
  const offersSelector = "[data-test='section-offers'] div .core_n194fgoq:not(.c1s2myew *)";

  await scrapperInstance.launch();
  await scrapperInstance.navigate("https://it.pracuj.pl/");
  try {
    // accept only necessary cookies
    await scrapperInstance.click("[data-test='button-customizeCookie']");
    await scrapperInstance.click("[data-test='button-submit']");
  } catch (e) {
    console.log("no need to accept cookies");
  }
  //offers setup
  await scrapperInstance.type(searchbarSelector);
  await scrapperInstance.click(searchButtonSelector);
  await scrapperInstance.click(sortButtonSelector);
  await scrapperInstance.click(mostSuitableSortSelector);
  await scrapperInstance.click(paycheckRangeSelector, 5000);
  await scrapperInstance.click(searchButtonSelector);
  await scrapperInstance.scrape(offersSelector, ["href"], true, true);

  const links = await scrapperInstance.getData();
  const results: JobOffer[] = [];
  const processLink = async (offerURL) => {
    await scrapperInstance.navigate(offerURL);
    const titleSelector = "[data-scroll-id='job-title']";
    const descriptionSelector =
      ".offer-viewzxQhTZ > :not(.offer-view8N6um9, .offer-viewsBrte4, [data-test='section-technologies'])";
    const companySelector = "[data-scroll-id='employer-name']";
    const salaryToSelector = "[data-test='text-earningAmountValueTo']";
    const salaryFromSelector = "[data-test='text-earningAmountValueFrom']";
    const osSelector = "[data-test='item-operating-system'] image";
    const technologiesSelector = "[data-test='section-technologies'] .offer-viewEX0Eq-";

    const title = await scrapperInstance.scrape(titleSelector, ["innerText"]);
    const description = await scrapperInstance.scrape(descriptionSelector, ["innerText"]);
    // slice to chop off "About the company"
    const company = await scrapperInstance.scrape(companySelector, ["innerText"]).then((data) => data.slice(0, -17));
    const [salaryTo, currency] = (await scrapperInstance.scrape(salaryToSelector, ["innerText"])).split(" ");
    let salaryFrom: string;
    try {
      // choppin' off "-"
      salaryFrom = (await scrapperInstance.scrape(salaryFromSelector, ["innerText"])).slice(0, -1);
    } catch (e) {
      salaryFrom = salaryTo;
    }

    const operationalSystems: string[] = await scrapperInstance
      .scrape(osSelector, ["alt"], false, true, true)
      .then((data) => data.split(scrapperInstance.dataDivider));

    const technologies = await scrapperInstance.scrape(technologiesSelector, ["innerText"]).then((data) =>
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

  for (const link of links.split(scrapperInstance.dataDivider)) {
    await processLink(link);
  }

  await scrapperInstance.close();
  return results;
}
