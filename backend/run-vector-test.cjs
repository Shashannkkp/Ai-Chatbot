const dns = require("node:dns");

// Use Google's public DNS for MongoDB SRV lookups.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log("Using Google DNS for MongoDB connection...");

// Import the existing test only after configuring DNS.
import("./test-vector-search.js").catch((error) => {
  console.error("Test runner failed:", error);
  process.exitCode = 1;
});