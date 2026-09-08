import { ERC8004Agent, EVMWalletProvider } from "@bnbagent/sdk";

const WALLET_ADDR = "0x4AFe676E519989C14DA36498939F0151A85B9Cf0";
const PASS = process.env.WALLET_PASSWORD || "";
const URL = "https://aethra-five-beta.vercel.app/api/orbitra";
const WKA = URL + "/.well-known/agent-card.json";

function bigIntReplacer(key, value) {
  return typeof value === "bigint" ? value.toString() + "n" : value;
}

function safeStringify(obj) {
  return JSON.stringify(obj, bigIntReplacer, 2);
}

if (!PASS) {
  console.error("ERROR: WALLET_PASSWORD env var is required");
  process.exit(1);
}

(async () => {
  const wallet = new EVMWalletProvider({ password: PASS, address: WALLET_ADDR });
  const agent = await ERC8004Agent.create({
    walletProvider: wallet,
    network: "bsc-testnet",
    debug: true,
  });

  const d1 = {
    name: "ORBITRA",
    services: [{ name: "A2A", endpoint: WKA, version: "0.3.0" }],
  };
  const agentUri =
    "data:application/json;base64," +
    Buffer.from(JSON.stringify(d1), "utf-8").toString("base64");

  const metadata = [];

  console.log("========================================");
  console.log("REGISTERING AGENT ON BSC TESTNET");
  console.log("========================================");
  console.log("Wallet:", WALLET_ADDR);
  console.log("Agent Name:", d1.name);
  console.log("Agent URI (prefix):", agentUri.substring(0, 60) + "...");
  console.log("Metadata shape: [] (empty array, iterable)");
  console.log("Gas: MegaFuel paymaster (sponsored)");
  console.log("----------------------------------------");
  console.log("Sending transaction...\n");

  let result;
  try {
    result = await agent.contractInterface.registerAgent(agentUri, metadata);
  } catch (e) {
    const msg = e.message || "";
    console.error("\n----------------------------------------");
    console.error("SDK THREW after potential TX broadcast!");
    console.error("Error:", msg.substring(0, 200));
    if (msg.includes("BigInt") || msg.includes("serialize")) {
      console.error(
        "\nNOTE: This is likely just a BigInt serialization bug in the SDK result printer."
      );
      console.error(
        "The transaction MAY have already been broadcast on-chain. Check nonce below."
      );
    }
    console.error("----------------------------------------\n");
    throw e;
  }

  console.log("✅ TRANSACTION CONFIRMED ON-CHAIN!");
  console.log("----------------------------------------");
  console.log("Transaction Hash:", result.transactionHash);
  console.log("Agent ID:", result.agentId ?? "(deriving from logs...)");

  if (result.receipt) {
    console.log("\n--- Transaction Receipt ---");
    console.log("Block Number:", result.receipt.blockNumber?.toString() ?? "N/A");
    console.log("Block Hash:", result.receipt.blockHash ?? "N/A");
    console.log("Gas Used:", result.receipt.gasUsed?.toString() ?? "N/A");
    console.log("Status:", result.receipt.status === 1 ? "SUCCESS (1)" : result.receipt.status ?? "N/A");
    console.log("Logs:", result.receipt.logs?.length ?? 0, "entries");
  }

  console.log("\n--- Full Result (BigInt-safe JSON) ---");
  console.log(safeStringify(result));

  console.log("\n========================================");
  console.log("REGISTRATION COMPLETE");
  console.log("========================================");
  console.log("View on BSC Scan:");
  console.log(
    "  https://testnet.bscscan.com/tx/" + (result.transactionHash || "")
  );
  if (result.agentId) {
    console.log("Agent ID (ERC-8004):", result.agentId);
  }
  console.log("========================================");
})().catch((e) => {
  console.error("\n\n========================================");
  console.error("FATAL ERROR (but TX may still have succeeded!)");
  console.error("========================================");
  console.error("Message:", e.message);
  if (e.cause) {
    console.error("Cause:", e.cause.message || String(e.cause));
  }
  console.error("Stack (first 8 lines):");
  console.error((e.stack || "").split("\n").slice(0, 8).join("\n"));
  console.error("========================================");
  console.error(
    "ACTION: If you saw 'Making RPC request: eth_sendRawTransaction' above,"
  );
  console.error(
    "        the TX IS ALREADY ON-CHAIN. Check BSC Scan for the wallet address."
  );
  console.error("  https://testnet.bscscan.com/address/" + WALLET_ADDR);
  console.error("========================================");
  process.exit(1);
});
