import { createServer, Server, ServerResponse } from "http";
import findOffers from "./scripts/findOffers";
const cache = require("memory-cache");
const schedule = require("node-schedule");
const { exec } = require("child_process");

export const PORT = 4200 || process.env.PORT;

export const server: Server = createServer(async (request, response: ServerResponse) => {
  // Parse the URL from the request
  const parsedUrl = new URL(request.url, `http://${request.headers.host}`);

  // Check if the URL matches the pattern '/offers/:searchValue'
  const pathMatch = parsedUrl.pathname.match(/^\/offers\/([^\/]+)$/);
  if (pathMatch) {
    // Caching
    const parameters = {
      // Extract the searchValue from the URL
      searchValue: pathMatch[1],
      // Set a default limit of 10, override if a valid limit is provided in the query
      limitRecords: parseInt(parsedUrl.searchParams.get("limit")) || 10,
      save: parseInt(parsedUrl.searchParams.get("json")) || true,
    };
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
      const expiryDate = new Date();
      schedule.scheduleJob(`${expiryDate.getSeconds()} ${expiryDate.getMinutes} */2 * * *`, async () => {
        cache.del(cacheKey); // Delete this record from cache
        cache.put(cacheKey, await findOffers(parameters.searchValue, parameters.limitRecords));
      });
      // return the offers
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(responseData);
    }
  } else {
    // Handle non-matching routes
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
