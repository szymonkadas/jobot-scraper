const schedule = require("node-schedule");
const { exec } = require("child_process");
import { PORT, server } from "../server";

server.listen(PORT, () => {
  schedule.scheduleJob("* * 9 * * 1-5", () => {
    exec("npm run scrap:offers -- -s 'Javascript Developer' -l 30");
  });
});
