import Scrapper from "../bot/scrapper/scrapper";
const findOffers = async () => {
  console.log("Scrapping...");
  const ScrapperInstance = new Scrapper({ searchValue: "frontend", maxRecords: 4 });
  await ScrapperInstance.launch();
  await ScrapperInstance.navigate("https://www.pracuj.pl/");
  try {
    // accept only necessary cookies
    await ScrapperInstance.click("[data-test='button-customizeCookie']");
    await ScrapperInstance.click("[data-test='button-submit']");
  } catch (e) {
    console.log("no need to accept cookies");
  }
  // zaznaczam it
  await ScrapperInstance.click('[data-test="tab-item-it"]');
  // wpisuję w searchbarze searchvalue zapisane w configu.
  await ScrapperInstance.type(".core_fhefgxl");
  // klikam searcha
  await ScrapperInstance.click('[data-test="section-search-with-filters-it"] > .core_b1fqykql');
  // zaznaczam widełki! Potrzebny jest full screen, inaczej trzeba będzie dodać odpowiednie kroki.
  try {
    await ScrapperInstance.click(".core_sm237sg", 5000);
  } catch (e) {
    await ScrapperInstance.click(".b95l1wx .core_brjyyp .core_b1fqykql");
  }
  // klikam searcha jeszcze raz.
  await ScrapperInstance.click(".core_s1cjjpc4 .core_b1fqykql");
  // posortuj wedle najbardziej pasujących.
  try {
    await ScrapperInstance.click(".listing_lkjndla", 5000);
    await ScrapperInstance.click(".listing_covfkjq > .listing_o1bn1ih4:nth-of-type(2)", 5000);
  } catch (e) {
    await ScrapperInstance.click(".listing_l1b5wr8p");
    await ScrapperInstance.click(".listing_onyjmg2:nth-of-type(2)");
  }

  // zgromadź linki
  await ScrapperInstance.scrape('[data-test="section-offers"] div .core_n194fgoq', ["href"]);
  // scrap location of description: ".offer-viewzxQhTZ"; Chociaż może lepiej rozbić i zrobić z tego porządniejszego jsona?
  const links = await ScrapperInstance.getData();
  await links.split(ScrapperInstance.linkDivider).forEach((link) => {
    ScrapperInstance.navigate(link);
    // logika brania rzeczy joł joł
  });
  setTimeout(() => {
    console.log(`${links.split(ScrapperInstance.linkDivider).length} offers found`);
  }, 3000);
};

findOffers();

// przenieś potem ten kod do funkcji scrap first service.

/*
  const links = await ScrapperInstance.scrape('[data-test="section-offers"] div .listing-it_n194fgoq', ["href"]);
  // scrap location of description: ".offer-viewzxQhTZ"; Chociaż może lepiej rozbić i zrobić z tego porządniejszego jsona?
  await links.forEach((link) => {
    console.log(link);
  });
*/
