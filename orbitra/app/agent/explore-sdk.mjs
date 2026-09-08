// Explore the @bnbagent/sdk API to find correct usage for EVMWalletProvider + ERC8004Agent
import { EVMWalletProvider, ERC8004Agent, AgentEndpoint } from "@bnbagent/sdk";

console.log("=== EVMWalletProvider ===");
console.log("prototype methods:", Object.getOwnPropertyNames(EVMWalletProvider.prototype));
console.log("static:", Object.getOwnPropertyNames(EVMWalletProvider));

console.log("\n=== ERC8004Agent ===");
console.log("prototype methods:", Object.getOwnPropertyNames(ERC8004Agent.prototype));
console.log("static:", Object.getOwnPropertyNames(ERC8004Agent));

console.log("\n=== AgentEndpoint ===");
console.log("prototype:", Object.getOwnPropertyNames(AgentEndpoint.prototype));
console.log("static:", Object.getOwnPropertyNames(AgentEndpoint));
console.log("AgentEndpoint constructor length:", AgentEndpoint.length);

// Quick test: construct wallet with password + address
console.log("\n=== Trying to construct EVMWalletProvider ===");
try {
  const wallet = new EVMWalletProvider({
    password: process.env.WALLET_PASSWORD || "test",
    address: "0x4AFe676E519989C14DA36498939F0151A85B9Cf0",
  });
  console.log("Wallet constructed. Keys on instance:", Object.keys(wallet).slice(0,30).join(", "));
  console.log("Wallet methods via Object.getOwnPropertyNames(Object.getPrototypeOf(wallet)):", 
    Object.getOwnPropertyNames(Object.getPrototypeOf(wallet)).join(", "));
} catch (e) {
  console.log("Construct error:", e.message);
}
