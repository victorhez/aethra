// Working candidates: data URIs that pass B3-style parse validation
// Key: include name field + endpoints with name/version
import { ERC8004Agent, EVMWalletProvider, AgentEndpoint } from "@bnbagent/sdk";

const WALLET_ADDR = "0x4AFe676E519989C14DA36498939F0151A85B9Cf0";
const PASS = process.env.WALLET_PASSWORD || "";
const URL = "https://aethra-five-beta.vercel.app/api/orbitra";
const WKA = URL + "/.well-known/agent-card.json";

const w = new EVMWalletProvider({ password: PASS, address: WALLET_ADDR });
const agent = new ERC8004Agent({ network: "bsc-testnet", wallet_provider: w, walletProvider: w });

function makeJsonUri(obj) {
  return "data:application/json;base64," +
    Buffer.from(JSON.stringify(obj), "utf-8").toString("base64");
}

const candidates = [];

// C1: B3 + add name + endpoint version
candidates.push(["C1 name+endpointVersion", makeJsonUri({
  name: "ORBITRA",
  version: "1.0.0",
  description: "ORBITRA Agent",
  uri: WKA,
  endpoints: [{ name: "A2A", endpoint: WKA, version: "0.3.0" }],
  wallet: WALLET_ADDR,
})]);

// C2: SDK AgentEndpoint.toDict() output + name
candidates.push(["C2 SDKa2a+name", makeJsonUri({
  name: "ORBITRA",
  endpoints: [AgentEndpoint.a2a(URL, "0.3.0").toDict()],
})]);

// C3: name + endpoints as array with full SDK endpoint shape
// AgentEndpoint instance had keys: name, endpoint, version, capabilities
const sdkEp = AgentEndpoint.a2a(URL, "0.3.0");
candidates.push(["C3 fullSDKep+walletChains", makeJsonUri({
  name: "ORBITRA",
  version: "1.0.0",
  description: "ORBITRA Agent on Aethra",
  author: "Aethra",
  license: "MIT",
  wallet: WALLET_ADDR,
  chains: [
    { chain_id: 1, network_name: "ethereum" },
    { chain_id: 56, network_name: "bsc" },
    { chain_id: 97, network_name: "bsc-testnet" },
  ],
  endpoints: [
    {
      name: sdkEp.name,
      endpoint: sdkEp.endpoint,
      version: sdkEp.version,
      capabilities: sdkEp.capabilities,
    }
  ],
  protocols: ["erc-8004", "a2a", "erc-8183"],
  pricing: {
    "erc-8183": "100000000000000000",
    "b402": "0.01 USD/request",
  },
  icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/>",
})]);

// C4: just name + endpoints (like B1 but endpoints have version field)
candidates.push(["C4 name+epVersion", makeJsonUri({
  name: "ORBITRA",
  endpoints: [{ name: "A2A", endpoint: WKA, version: "0.3.0" }],
})]);

// C5: include services[] key (some ERC-8004 specs use services instead of endpoints)
candidates.push(["C5 services+name", makeJsonUri({
  name: "ORBITRA",
  version: "1.0.0",
  services: [{ name: "A2A", endpoint: WKA, version: "0.3.0" }],
  endpoints: [{ name: "A2A", endpoint: WKA, version: "0.3.0" }],
  wallet: WALLET_ADDR,
})]);

// C6: just AgentEndpoint.toDict() + name + version + description (min spec)
candidates.push(["C6 SDKdictMini", makeJsonUri({
  name: "ORBITRA",
  version: "0.1.0",
  description: "ORBITRA Agent",
  endpoints: [AgentEndpoint.a2a(URL, "0.3.0").toDict()],
})]);

console.log("=== Running registerAgent for each candidate ===\n");
let idx = 0;
for (const [label, uri] of candidates) {
  idx++;
  // Static parse sanity
  try {
    ERC8004Agent.parseAgentUri(uri);
  } catch (e) {
    console.log(idx + ". [" + label + "] static parse FAIL: " + e.message + " → SKIP\n");
    continue;
  }

  process.stdout.write(idx + ". [" + label + "] len=" + uri.length + " → ");
  try {
    const res = await agent.registerAgent(uri, { skipPaymaster: true });
    console.log("✅ SUCCESS");
    console.log("typeof:", typeof res);
    if (res && typeof res === "object") {
      console.log("keys:", Object.keys(res));
      console.log(JSON.stringify(res, null, 2).substring(0, 1500));
    } else if (typeof res === "string") {
      console.log(res.substring(0, 200));
    } else {
      console.log(res);
    }
    process.exit(0);
  } catch (e) {
    console.log("❌ FAIL");
    console.log("    msg: " + e.message);
    if (e.stack) {
      const line = e.stack.split("\n")[1] || "";
      console.log("    throw at : " + line.trim());
    }
    console.log();
  }
}

console.log("--- All done ---");
