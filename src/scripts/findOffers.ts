import { Bot } from "../bot/bot";
const findOffers = async () => {
  console.log("Scrapping...");
  const bot = new Bot();
  const result = await bot.scrapFirstService();
  setTimeout(() => {
    console.log(`${result.length} offers found`);
    console.log(result);
  }, 3000);
};

findOffers();

// przenieś potem ten kod do funkcji scrap first service.

// TODO: new linesy zmienić na spacje, pola z tylko spacją usunąć.
