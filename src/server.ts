import { createServer, Server, ServerResponse } from "http";
import url from "url";
import { findOffers } from "./scripts/findOffers";
const cache = require("memory-cache");
const schedule = require("node-schedule");
const { exec } = require("child_process");

const PORT = 4200 || process.env.PORT;

const server: Server = createServer(async (request, response: ServerResponse) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  const parsedUrl = url.parse(request.url, true);
  if (parsedUrl.pathname.startsWith("/offers/") && parsedUrl.pathname.length > 8) {
    let numberRegex = /^\d+$/;
    const limitRecords =
      typeof parsedUrl.query.limit === "string"
        ? parsedUrl.query.limit.match(numberRegex)
          ? parseInt(parsedUrl.query.limit)
          : 1
        : parsedUrl.query.limit.join("").match(numberRegex)
        ? parseInt(parsedUrl.query.limit.join(""))
        : 1;
    const parameters = {
      searchValue: parsedUrl.pathname.split("/")[2],
      limitRecords: limitRecords,
    };

    // Caching
    const cacheKey = JSON.stringify(parameters); // use parameters as cache key
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      // if data is in cache, send cached data
      response.end(cachedData);
    } else {
      // if data is not in cache, fetch data and cache it
      const scrappedResults = await findOffers(parameters.searchValue, parameters.limitRecords);
      const responseData = JSON.stringify(scrappedResults);
      cache.put(cacheKey, responseData); // put data in cache
      // schedule revalidation
      let expiryDate = new Date();
      schedule.scheduleJob(`${expiryDate.getSeconds()} */1 * * * *`, async () => {
        cache.del(cacheKey); // Delete this record from cache
        cache.put(cacheKey, await findOffers(parameters.searchValue, parameters.limitRecords));
      });
      response.end(responseData);
    }
  } else {
    response.end("Hello World!\n");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  schedule.scheduleJob("* * 9 * * 1-5", () => {
    exec("npm run scrap:offers -- -s 'Javascript Developer' -l 30");
  });
});

// Function to get the future date
function getFutureDate(hours: number) {
  let expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + hours);
  return expiryDate;
}
