import { ERC8004Agent, EVMWalletProvider } from "@bnbagent/sdk";

const WALLET_ADDR = "0x4AFe676E519989C14DA36498939F0151A85B9Cf0";
const PASS = process.env.WALLET_PASSWORD || "";
const AGENT_ID = "0x8d0";

function bigIntReplacer(key, value) {
  return typeof value === "bigint" ? value.toString() + "n" : value;
}
function safeStringify(obj) {
  return JSON.stringify(obj, bigIntReplacer, 2);
}

if (!PASS) { console.error("No WALLET_PASSWORD"); process.exit(1); }

(async () => {
  const wallet = new EVMWalletProvider({ password: PASS, address: WALLET_ADDR });
  const agent = await ERC8004Agent.create({
    walletProvider: wallet,
    network: "bsc-testnet",
    debug: true,
  });
  const ci = agent.contractInterface;

  console.log("=== getAgentInfo(" + AGENT_ID + ") ===");
  try {
    const info = await ci.getAgentInfo(AGENT_ID);
    console.log(safeStringify(info));
  } catch (e) {
    console.error("ERR:", e.message);
    if (e.stack) console.error(e.stack.split("\n").slice(0, 3).join("\n"));
  }

  console.log("\n=== getMetadata(" + AGENT_ID + ") ===");
  try {
    const md = await ci.getMetadata(AGENT_ID);
    console.log(safeStringify(md));
  } catch (e) {
    console.error("ERR:", e.message);
  }
})().catch(e => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
