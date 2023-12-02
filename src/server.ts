import { createServer, Server, ServerResponse } from "http";
const schedule = require("node-schedule");
const { exec } = require("child_process");

const PORT = 4200 || process.env.PORT;

const server: Server = createServer((request, response: ServerResponse) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("Hello World!\n");
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  schedule.scheduleJob("* * 9 * * 1-5", () => {
    exec("npm run scrap:offers -- -s 'Javascript Developer' -l 30");
  });
});
