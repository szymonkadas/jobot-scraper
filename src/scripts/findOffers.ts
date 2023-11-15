import Scrapper from "../bot/scrapper/scrapper";
const findOffers = async () => {
  console.log("Scrapping...");
  const ScrapperInstance = new Scrapper({ searchValue: ".main-content", maxRecords: 4 });
  await ScrapperInstance.launch();
  await ScrapperInstance.navigate("https://nofluffjobs.com/pl");
  await ScrapperInstance.scrape(["innerHTML", "innerText"]);
  const mak = await ScrapperInstance.getData();
  setTimeout(() => {
    console.log("10 offers found.");
  }, 3000);
};

findOffers();
