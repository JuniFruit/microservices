import chokidar from "chokidar";
import path from "path";
import { healthController } from "../health/health.controller";

class AppListen {
  private isProduction: boolean = process.env.NODE_ENV === "production" ? true : false;
  private watcher: ReturnType<typeof chokidar.watch> | undefined;

  listen() {
    this.isProduction && this.watchApp();
    this.listenCmd();
  }

  private watchApp() {
    const filePath = path.join(__dirname + "/../" + "app.js");
    this.watcher = chokidar.watch(filePath, { persistent: true });
    this.watcher
      .on("error", err => {
        console.error(err);
      })
      .on("all", (e, path, stats) => {
        console.log("File changed");
      });
  }

  private listenCmd() {
    process.stdin
      .on("data", data => {
        const input = data.toString("utf-8").trimEnd();

        switch (input) {
          case "exit":
            console.log("Closing app...");
            process.exit();
          case "health":
            console.log("Check health");
            const code = healthController.checkHealth();
            return code;
        }
      })
      .on("error", err => {});
  }
}

export default new AppListen();
