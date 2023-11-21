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
const findOffers = async () => {
  console.log("Scrapping...");
  const ScrapperInstance = new Scrapper({ searchValue: "frontend", maxRecords: 4 });
  await ScrapperInstance.launch();
  await ScrapperInstance.navigate("https://it.pracuj.pl/");
  try {
    // accept only necessary cookies
    await ScrapperInstance.click("[data-test='button-customizeCookie']");
    await ScrapperInstance.click("[data-test='button-submit']");
  } catch (e) {
    console.log("no need to accept cookies");
  }
  // wpisuję w searchbarze searchvalue zapisane w configu.
  await ScrapperInstance.type(".core_fhefgxl");
  // klikam searcha
  await ScrapperInstance.click(".core_s1cjjpc4 .core_b1fqykql");
  // posortuj wedle najbardziej pasujących.
  await ScrapperInstance.click(".listing_l1b5wr8p");
  await ScrapperInstance.click(".listing_onyjmg2:nth-of-type(2)");
  // zaznaczam widełki!
  await ScrapperInstance.click(".core_sm237sg", 5000);
  // klikam searcha jeszcze raz.
  await ScrapperInstance.click(".core_s1cjjpc4 .core_b1fqykql");
  // zgromadź linki
  await ScrapperInstance.scrape(
    '[data-test="section-offers"] div .core_n194fgoq:not(.c1s2myew *)',
    ["href"],
    true,
    true
  );
  const links = await ScrapperInstance.getData();
  const dataArray = [];
  for (const link of links.split(ScrapperInstance.dataDivider)) {
    console.log(link);
    await setTimeout(async () => await ScrapperInstance.navigate(link), ScrapperInstance.reactionTime() * 5);
    let salaryFrom: string;
    const [salaryTo, currency] = (
      await ScrapperInstance.scrape("[data-test='text-earningAmountValueTo']", ["innerText"])
    ).split(" ");
    const operationalSystems = await ScrapperInstance.scrape("[data-test='item-operating-system'] image", ["alt"]);
    try {
      salaryFrom = (await ScrapperInstance.scrape("[data-test='text-earningAmountValueFrom']", ["innerText"])).slice(
        0,
        -1
      );
    } catch (e) {
      salaryFrom = salaryTo;
    }
    const data: JobOffer = await {
      title: await ScrapperInstance.scrape("[data-scroll-id='job-title']", ["innerText"]),
      description: await ScrapperInstance.scrape(
        ".offer-viewzxQhTZ > :not(.offer-view8N6um9, .offer-viewsBrte4, [data-test='section-technologies'])",
        ["innerText"]
      ),
      company: await ScrapperInstance.scrape("[data-scroll-id='employer-name']", ["innerText"]).then((data) =>
        // chopping off "About the company".
        data.slice(0, -17)
      ),
      salaryFrom: salaryFrom,
      salaryTo: salaryTo,
      currency: currency,
      offerURL: link,
      technologies: `${await ScrapperInstance.scrape("[data-test='section-technologies'] .offer-viewEX0Eq-", [
        "innerText",
      ])}\n${operationalSystems}`
        .split("\n")
        .filter((word) => word !== ""),
      addedAt: "https://it.pracuj.pl",
    };
    await dataArray.push(await data);
    console.log(data.salaryFrom);
    await setTimeout(() => {}, ScrapperInstance.reactionTime() * 5);
  }

  // await ScrapperInstance.close();
  setTimeout(() => {
    console.log(`${links.split(ScrapperInstance.dataDivider).length} offers found`);
  }, 3000);
};

findOffers();

// przenieś potem ten kod do funkcji scrap first service.

// TODO: new linesy zmienić na spacje, pola z tylko spacją usunąć.
