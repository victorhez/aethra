// Debug contractInterface.registerAgent signature
import { ERC8004Agent, EVMWalletProvider } from "@bnbagent/sdk";

const WALLET_ADDR = "0x4AFe676E519989C14DA36498939F0151A85B9Cf0";
const PASS = process.env.WALLET_PASSWORD || "";
const URL = "https://aethra-five-beta.vercel.app/api/orbitra";
const WKA = URL + "/.well-known/agent-card.json";

if (!PASS) { console.error("No WALLET_PASSWORD"); process.exit(1); }

(async () => {
  const wallet = new EVMWalletProvider({ password: PASS, address: WALLET_ADDR });
  const agent = await ERC8004Agent.create({
    walletProvider: wallet,
    network: "bsc-testnet",
    debug: true,
  });

  console.log("=== contractInterface.registerAgent.toString() ===\n");
  const ci = agent.contractInterface;
  try {
    const src = ci.registerAgent.toString();
    const lines = src.split("\n");
    console.log("Lines:", lines.length);
    let i = 0;
    for (const l of lines) {
      console.log(String(i).padStart(2,"0") + ": " + l.substring(0, 400));
      i++;
    }
  } catch (e) {
    console.log("registerAgent stringify fail:", e.message);
    try {
      const src = "" + ci.registerAgent;
      // Find metadata usage
      for (const keyword of ["metadata", "iterable", "skipPaymaster", "gas", "value", "args"]) {
        const idx = src.indexOf(keyword);
        if (idx >= 0) console.log("FOUND '" + keyword + "' at " + idx + ":\n  ... " +
          src.substring(Math.max(0, idx - 100), idx + 200) + " ...\n");
      }
    } catch (e2) { console.log("Alt stringify fail:", e2.message); }
  }

  // Also try injectBuiltWith (if relevant)
  console.log("\n=== methods on contractInterface ===");
  console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(ci))
    .filter(k => k !== "constructor")
    .join(", "));

  // Also, run different SHAPES for metadata arg to find iterable shape
  const d1 = {
    name: "ORBITRA",
    services: [{ name: "A2A", endpoint: WKA, version: "0.3.0" }],
  };
  const uri = "data:application/json;base64," +
    Buffer.from(JSON.stringify(d1), "utf-8").toString("base64");

  console.log("\n=== Trying various metadata SHAPES to find iterable one ===\n");
  const metadatas = [
    ["[] empty array", []],
    ["{} empty obj", {}],
    ["null", null],
    ["undefined", undefined],
    ["[[k,v]] entries 2d array", [["skipPaymaster", true]]],
    ["[true] singleton bool", [true]],
    ["[{skipPaymaster:true}] obj in array", [{ skipPaymaster: true, skip_paymaster: true }]],
    ["NO arg (omit)", "__OMIT__"],
    ["3 args: uri, null, {skipPaymaster}", "__3ARGS__"],
    ["metadata = Map", new Map([["skipPaymaster", true]])],
    ["metadata = Set", new Set()],
  ];

  for (const [label, meta] of metadatas) {
    process.stdout.write(String(metadatas.indexOf([label,meta]) + 1) + ". " + label.padEnd(40) + " → ");
    try {
      let res;
      if (meta === "__OMIT__") {
        res = await ci.registerAgent(uri);
      } else if (meta === "__3ARGS__") {
        res = await ci.registerAgent(uri, null, { skipPaymaster: true });
      } else {
        res = await ci.registerAgent(uri, meta);
      }
      console.log("✅ SUCCESS");
      console.log(JSON.stringify(res, null, 2).substring(0, 800));
      process.exit(0);
    } catch (e) {
      const msg = e.message.substring(0, 120);
      if (msg.includes("metadata is not iterable")) {
        console.log("❌ NOT ITERABLE");
      } else if (msg.includes("paymaster") || msg.includes("gas") || msg.includes("nonce")) {
        console.log("✅ ITERABLE OK — now got DIFF error: " + msg);
      } else {
        console.log("❌ DIFF error: " + msg);
      }
    }
  }
})().catch(e => {
  console.error("UNCAUGHT:", e.message);
  if (e.stack) console.error(e.stack.split("\n").slice(0,6).join("\n"));
  process.exit(99);
});
