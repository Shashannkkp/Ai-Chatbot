import dns from "node:dns";

if (process.platform === "win32") {
  dns.setServers([
    "8.8.8.8",
    "8.8.4.4",
  ]);

  console.log("Custom DNS servers configured for Windows");
}