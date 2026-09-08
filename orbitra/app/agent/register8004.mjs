// CORRECT WORKING SDK USAGE:
// 1. await ERC8004Agent.create() — static factory populates contractInterface
// 2. agentUri as a DATA URI with `services` array (parseAgentUri outputs services[])
// 3. registerAgent(uriString, metadataObjOrOpts)
import { ERC8004Agent, EVMWalletProvider } from "@bnbagent/sdk";

const WALLET_ADDR = "0x4AFe676E519989C14DA36498939F0151A85B9Cf0";
const PASS = process.env.WALLET_PASSWORD || "";
const URL = "https://aethra-five-beta.vercel.app/api/orbitra";
const WKA = URL + "/.well-known/agent-card.json";

if (!PASS) { console.error("Set WALLET_PASSWORD"); process.exit(1); }

(async () => {
  // 1. Wallet
  console.log("[1/4] Unlock wallet...");
  const wallet = new EVMWalletProvider({ password: PASS, address: WALLET_ADDR });
  console.log("      OK:", wallet.address);

  // 2. Agent via ASYNC create() factory
  console.log("\n[2/4] ERC8004Agent.create() — connect to RPC, init contract interface...");
  const agent = await ERC8004Agent.create({
    walletProvider: wallet,
    network: "bsc-testnet",
    debug: true,
  });
  console.log("      OK — created. Instance keys:", Object.keys(agent).sort());
  console.log("      contractInterface?", typeof agent.contractInterface);
  console.log("      networkConfig?", typeof agent.networkConfig);
  console.log("      client?", typeof agent.client);
  if (agent.contractInterface) {
    const ciProto = Object.getPrototypeOf(agent.contractInterface);
    console.log("      contractInterface proto methods:",
      Object.getOwnPropertyNames(ciProto).filter(k => k !== "constructor").join(", "));
  }

  // 3. Build agent URI strings (CANDIDATES)
  // Key learning: inside registerAgent(), parsed object is read as agentData.services
  // So the base64 JSON MUST contain: services array, name field
  console.log("\n[3/4] Build candidate URIs (services array inside json)");
  function makeJsonUri(obj) {
    return "data:application/json;base64," +
      Buffer.from(JSON.stringify(obj), "utf-8").toString("base64");
  }
  const candidates = [];

  // D1: services + name (exactly what SDK reads inside registerAgent)
  const d1 = {
    name: "ORBITRA",
    version: "1.0.0",
    description: "ORBITRA Agent on Aethra marketplace",
    author: "Aethra",
    wallet: WALLET_ADDR,
    services: [
      { name: "A2A", endpoint: WKA, version: "0.3.0" },
    ],
    chains: [{ chain_id: 97, network_name: "bsc-testnet" }],
  };
  candidates.push(["D1 services[]", makeJsonUri(d1)]);

  // D2: services[] + endpoints[] + name for redundancy
  const d2 = { ...d1,
    endpoints: [{ name: "A2A", endpoint: WKA, version: "0.3.0" }],
  };
  candidates.push(["D2 services+endpoints", makeJsonUri(d2)]);

  // D3: plain HTTPS well-known URL
  candidates.push(["D3 wellknown URL", WKA]);

  // Verify each parses
  for (const [label, uri] of candidates) {
    try {
      const parsed = ERC8004Agent.parseAgentUri(uri);
      console.log("      ✅ " + label + " parse OK. parsed.keys=" + Object.keys(parsed || {}).join(","));
      if (parsed && parsed.services) console.log("         parsed.services = " + JSON.stringify(parsed.services));
      if (parsed && parsed.endpoints) console.log("         parsed.endpoints = " + JSON.stringify(parsed.endpoints));
    } catch(e) {
      console.log("      ❌ " + label + ": " + e.message);
    }
  }

  // 4. Try registerAgent with each candidate
  console.log("\n[4/4] registerAgent attempts");
  let idx = 0;
  for (const [label, uri] of candidates) {
    idx++;
    process.stdout.write(String(idx) + ". [" + label + "] len=" + uri.length + " → ");
    try {
      // Second arg = metadata (per registerAgent source: async registerAgent(agentUri, metadata))
      // metadata may contain skipPaymaster OR the opts get passed through contractInterface
      const metadata = {
        skipPaymaster: true,
        skip_paymaster: true,
      };
      const res = await agent.registerAgent(uri, metadata);
      console.log("✅ SUCCESS");
      console.log("  typeof:", typeof res, "keys:", Object.keys(res || {}));
      console.log(JSON.stringify(res, null, 2).substring(0, 1500));

      const txHash = res?.transactionHash || res?.txHash || res?.tx?.hash ||
        res?.receipt?.transactionHash || res?.hash ||
        (typeof res === "string" && res.startsWith("0x") ? res : null);
      const agentId = res?.agentId ?? res?.tokenId ?? res?.agent_id ?? res?.id ?? null;

      if (txHash) {
        console.log("\n======================================================");
        console.log("✅✅✅ ERC-8004 REGISTERED ON-CHAIN ✅✅✅");
        console.log("======================================================");
        console.log("TX HASH :", txHash);
        console.log("BSCSCAN : https://testnet.bscscan.com/tx/" + txHash);
        if (agentId !== null && agentId !== undefined) console.log("AGENT ID:", agentId);
        console.log("Wallet  :", WALLET_ADDR);
      }
      process.exit(0);
    } catch (e) {
      console.log("❌ FAIL: " + e.message.substring(0, 200));
      if (e.stack) {
        console.log("   throw at: " + (e.stack.split("\n")[1] || "").trim().substring(0, 220));
      }
    }
  }
  console.log("\nAll attempts done.");
})().catch((e) => {
  console.error("\nFATAL:", e?.message || String(e));
  if (e?.stack) console.error(e.stack.split("\n").slice(0, 12).join("\n"));
  process.exit(99);
});
