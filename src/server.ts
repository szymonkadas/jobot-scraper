import { createServer, Server, ServerResponse } from "http";
import url from "url";
import { findOffers } from "./scripts/findOffers";
const schedule = require("node-schedule");
const { exec } = require("child_process");

const PORT = 4200 || process.env.PORT;

const server: Server = createServer(async (request, response: ServerResponse) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  const parsedUrl = url.parse(request.url, true);
  if (parsedUrl.pathname === "/offers" && parsedUrl.query.search_value !== undefined) {
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
      searchValue:
        typeof parsedUrl.query.search_value === "string"
          ? parsedUrl.query.search_value
          : parsedUrl.query.search_value.join(" "),
      limitRecords: limitRecords,
    };
    const scrappedResults = await findOffers(parameters.searchValue, parameters.limitRecords);
    response.end(JSON.stringify(scrappedResults));
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
