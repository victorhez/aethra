// Debug SDK generateAgentUri return type and build CORRECT string URI
import { ERC8004Agent, EVMWalletProvider, AgentEndpoint } from "@bnbagent/sdk";

const WALLET_ADDR = "0x4AFe676E519989C14DA36498939F0151A85B9Cf0";
const PASS = process.env.WALLET_PASSWORD || "";
const ENDPOINT_NO_BACKTICKS = "https://aethra-five-beta.vercel.app/api/orbitra";

// 1. Wallet
const w = new EVMWalletProvider({ password: PASS, address: WALLET_ADDR });
console.log("wallet constructed, address=", w.address);

// 2. Agent constructor (same naming as previous successful run)
const agent = new ERC8004Agent({
  network: "bsc-testnet",
  wallet_provider: w,
  walletProvider: w,
});
console.log("agent constructed");

// 3. AgentEndpoint — pass NO backticks (string URL only, pure)
console.log("\n=== AgentEndpoint with clean URL ===");
const epClean = AgentEndpoint.a2a(ENDPOINT_NO_BACKTICKS, "0.3.0");
console.log("epClean.toDict() =", JSON.stringify(epClean.toDict()));
console.log("epClean keys =", Object.keys(epClean));
console.log("typeof epClean.endpoint =", typeof epClean.endpoint, "; value =", epClean.endpoint);

// 4. generateAgentUri — what does it ACTUALLY return?
console.log("\n=== generateAgentUri: actual return type ===");
let ret;
try {
  ret = agent.generateAgentUri({
    name: "ORBITRA",
    description: "ORBITRA Agent on ÆTHRA Marketplace",
    endpoints: [epClean],
  });
  console.log("ret type:", typeof ret);
  if (ret && typeof ret === "object") {
    console.log("ret keys:", Object.keys(ret));
    console.log("ret JSON:", JSON.stringify(ret, null, 2).substring(0, 600));
    // Check if any value is a string that starts with data: or http
    for (const k of Object.keys(ret)) {
      const v = ret[k];
      if (typeof v === "string") {
        console.log(`  ret.${k} first 100: ${v.substring(0,100)}`);
      }
    }
  } else if (typeof ret === "string") {
    console.log("ret string, first 500 chars:", ret.substring(0, 500));
  }
} catch (e) {
  console.log("FAIL:", e.message);
  // 5. FALLBACK: build manual STRING URI that is parseable by ERC8004Agent.parseAgentUri
  console.log("\n=== Fallback: manually build a STRING agentUri that parseAgentUri accepts ===");
}

// 6. Test: what does parseAgentUri() actually accept? Let's try many forms
const candidateUris = [];

// Candidate 1: data:application/json;base64,...
const agentInfoStr = JSON.stringify({
  name: "ORBITRA",
  version: "1.0.0",
  endpoints: [{ name: "A2A", endpoint: ENDPOINT_NO_BACKTICKS + "/.well-known/agent-card.json" }],
});
const b64 = Buffer.from(agentInfoStr, "utf-8").toString("base64");
candidateUris.push(["data:application/json;base64," + b64, "data:application/json base64"]);

// Candidate 2: plain https endpoint URL (registerAgent may accept it directly)
candidateUris.push([ENDPOINT_NO_BACKTICKS, "plain endpoint URL"]);

// Candidate 3: https + .well-known/agent-card.json
candidateUris.push([ENDPOINT_NO_BACKTICKS + "/.well-known/agent-card.json", "well-known agent-card URL"]);

// Candidate 4: did:
candidateUris.push(["did:web:aethra-five-beta.vercel.app", "did:web"]);

console.log("\n=== Testing ERC8004Agent.parseAgentUri with candidate STRING URIs ===");
for (const [uri, label] of candidateUris) {
  try {
    const parsed = ERC8004Agent.parseAgentUri(uri);
    console.log(`✅ ${label}: parsed OK, type=${typeof parsed}, keys=${parsed ? Object.keys(parsed).slice(0,5).join(',') : 'null'}`);
  } catch (e) {
    console.log(`❌ ${label}: ${e.message.substring(0, 120)}`);
  }
}
