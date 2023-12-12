import { createServer } from "http";
import findOffers from "./scripts/findOffers";
const schedule = require("node-schedule");
const { exec } = require("child_process");

const PORT = 4200 || process.env.PORT;

const server = createServer(async (request, response) => {
  // Parse the URL from the request
  const parsedUrl = new URL(request.url, `http://${request.headers.host}`);

  // Check if the URL matches the pattern '/offers/:searchValue'
  const pathMatch = parsedUrl.pathname.match(/^\/offers\/([^\/]+)$/);
  if (pathMatch) {
    // Extract the searchValue from the URL
    const searchValue = pathMatch[1];

    // Set a default limit of 10, override if a valid limit is provided in the query
    const limit = parseInt(parsedUrl.searchParams.get("limit")) || 10;

    // Fetch and return the offers
    const scrappedResults = await findOffers(searchValue, limit);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(scrappedResults));
  } else {
    // Handle non-matching routes
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  schedule.scheduleJob("* * 9 * * 1-5", () => {
    exec("npm run scrap:offers -- -s 'Javascript Developer' -l 30");
  });
});
