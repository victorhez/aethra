// Find EXACTLY what registerAgent accepts for agentUri
import { ERC8004Agent, EVMWalletProvider, AgentEndpoint } from "@bnbagent/sdk";

const WALLET_ADDR = "0x4AFe676E519989C14DA36498939F0151A85B9Cf0";
const PASS = process.env.WALLET_PASSWORD || "";
const URL = "https://aethra-five-beta.vercel.app/api/orbitra";

const w = new EVMWalletProvider({ password: PASS, address: WALLET_ADDR });
const agent = new ERC8004Agent({ network: "bsc-testnet", wallet_provider: w, walletProvider: w });

function makeJsonUri(obj) {
  return "data:application/json;base64," +
    Buffer.from(JSON.stringify(obj), "utf-8").toString("base64");
}

const candidates = [];

// A. Plain URL variants
candidates.push(["A1 plain", URL]);
candidates.push(["A2 well-known", URL + "/.well-known/agent-card.json"]);
candidates.push(["A3 did:web", "did:web:aethra-five-beta.vercel.app"]);

// B1. Simple json
const b1 = {
  name: "ORBITRA",
  endpoints: [
    { name: "A2A", endpoint: URL + "/.well-known/agent-card.json" }
  ],
};
candidates.push(["B1 simple json", makeJsonUri(b1)]);

// B2. SDK AgentEndpoint.toDict()
const b2 = {
  name: "ORBITRA",
  version: "0.1.0",
  description: "ORBITRA Agent",
  endpoints: [AgentEndpoint.a2a(URL, "0.3.0").toDict()],
  wallet: WALLET_ADDR,
  chains: [{ chain_id: 97, network_name: "bsc-testnet" }],
};
candidates.push(["B2 SDK a2a.toDict()", makeJsonUri(b2)]);

// B3. Minimal uri + endpoints
const b3 = {
  uri: URL + "/.well-known/agent-card.json",
  endpoints: [
    { name: "A2A", endpoint: URL + "/.well-known/agent-card.json", version: "0.3.0" }
  ],
};
candidates.push(["B3 minimal", makeJsonUri(b3)]);

console.log("=== STEP 1: parse via static ERC8004Agent.parseAgentUri ===\n");
for (const [label, uri] of candidates) {
  try {
    const parsed = ERC8004Agent.parseAgentUri(uri);
    console.log("OK  " + label + "  len=" + uri.length);
    if (parsed && typeof parsed === "object") {
      console.log("    keys: " + Object.keys(parsed).slice(0, 10).join(", "));
      if (parsed.endpoints) {
        console.log("    endpoints: " + JSON.stringify(parsed.endpoints).slice(0, 240));
      }
    }
  } catch (e) {
    console.log("FAIL " + label + ": " + e.message);
  }
}

console.log("\n=== STEP 2: try registerAgent(string, {skipPaymaster:true}) for each ===\n");
let idx = 0;
for (const [label, uri] of candidates) {
  idx++;
  process.stdout.write(String(idx) + ". [" + label + "] ... ");
  try {
    const res = await agent.registerAgent(uri, { skipPaymaster: true });
    console.log("✅ SUCCESS");
    console.log("typeof result:", typeof res);
    if (res && typeof res === "object") {
      console.log("keys:", Object.keys(res));
      console.log(JSON.stringify(res, null, 2).substring(0, 1200));
    } else if (typeof res === "string") {
      console.log(res.substring(0, 200));
    } else {
      console.log("result:", res);
    }
    process.exit(0);
  } catch (e) {
    console.log("❌ FAIL");
    console.log("    msg: " + e.message);
    if (e.stack) {
      console.log("    stack[0-5]:");
      const lines = e.stack.split("\n").slice(0, 6);
      for (const l of lines) console.log("      " + l);
    }
    console.log();
  }
}

console.log("--- All attempts exhausted ---");
