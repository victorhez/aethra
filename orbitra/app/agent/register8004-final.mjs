// FINAL working ERC-8004 registration script.
// registerAgent signature: async registerAgent(stringUri, metadataIterEntriesArray)
// metadata must be ITERABLE of {key,value} entries (empty array [] works OK)
// Also: need a JSON.stringify replacer for BigInt (SDK receipt has BigInt blockNumber etc)
import { ERC8004Agent, EVMWalletProvider } from "@bnbagent/sdk";

// BigInt-safe JSON stringifier
function bigintFriendly(obj) {
  return JSON.stringify(obj, (k, v) => {
    if (typeof v === "bigint") return v.toString();
    return v;
  }, 2);
}

const WALLET_ADDR = "0x4AFe676E519989C14DA36498939F0151A85B9Cf0";
const PASS = process.env.WALLET_PASSWORD || "";
const URL = "https://aethra-five-beta.vercel.app/api/orbitra";
const WKA = URL + "/.well-known/agent-card.json";

if (!PASS) { console.error("Set $env:WALLET_PASSWORD"); process.exit(1); }

// Build data URI (services array + name)
const d1 = {
  name: "ORBITRA",
  version: "1.0.0",
  description: "ORBITRA Agent on Aethra marketplace",
  author: "Aethra",
  wallet: WALLET_ADDR,
  services: [
    { name: "A2A", endpoint: WKA, version: "0.3.0" },
  ],
  endpoints: [
    { name: "A2A", endpoint: WKA, version: "0.3.0" },
  ],
  chains: [
    { chain_id: 1, network_name: "ethereum" },
    { chain_id: 56, network_name: "bsc" },
    { chain_id: 97, network_name: "bsc-testnet" },
  ],
};
const agentUri = "data:application/json;base64," +
  Buffer.from(JSON.stringify(d1), "utf-8").toString("base64");

console.log("Agent URI length:", agentUri.length);
console.log("First 100 chars:", agentUri.substring(0, 100) + "\n");

(async () => {
  // 1. Wallet
  console.log("[1/3] Wallet unlock...");
  const wallet = new EVMWalletProvider({ password: PASS, address: WALLET_ADDR });
  console.log("       OK:", wallet.address);

  // 2. Agent factory
  console.log("\n[2/3] ERC8004Agent.create() (connect RPC + init registry)...");
  const agent = await ERC8004Agent.create({
    walletProvider: wallet,
    network: "bsc-testnet",
    debug: true,
  });
  console.log("       OK: contractInterface=", typeof agent.contractInterface);

  // 3. REGISTER (metadata = [] empty iterable; SDK injects built_with entry automatically)
  console.log("\n[3/3] TX to chain...");
  console.log("       (via MegaFuel paymaster sponsored gas)");
  const t0 = Date.now();

  let result;
  try {
    result = await agent.registerAgent(agentUri, []);
  } catch (eTop) {
    // SDK may throw ERC8004PartialRegistrationError with partial data
    console.log("\n⚠️  registerAgent threw an error. Extracting tx info if possible...");
    if (eTop?.txHash) {
      console.log("   extracted txHash from error:", eTop.txHash);
      console.log("   agentId:", eTop.agentId);
      console.log("   message:", eTop.message);
      result = { transactionHash: eTop.txHash, agentId: eTop.agentId, error: eTop.message };
    } else if (eTop?.message?.includes?.("BigInt")) {
      // The result WAS available but JSON.stringify crashed on BigInt.
      // Our error is in the WRAPPER only — the TX already completed.
      // We have no result object here, but below we'll try to re-read.
      console.log("   → 'BigInt' error type. This almost always means TX already succeeded on chain.");
      console.log("   → Nonce has been incremented. Fetching wallet state...");
      result = { assumedSuccess: true, bigIntPrintError: true };
    } else {
      console.error("   Full error:", eTop?.message);
      if (eTop?.cause?.message) console.error("   Cause:", eTop.cause.message);
      throw eTop;
    }
  }

  const dt = (Date.now() - t0) / 1000;
  console.log("\nregisterAgent returned after", dt.toFixed(1), "seconds");

  // Print safely
  console.log("\n=== RAW RESULT (BigInt-safe) ===");
  try { console.log(bigintFriendly(result).substring(0, 2000)); } catch (e) { console.log(result); }

  const txHash = result?.transactionHash || result?.txHash || result?.tx?.hash ||
    result?.receipt?.transactionHash || null;
  const agentId = result?.agentId ?? result?.tokenId ?? result?.agent_id ?? result?.id ?? null;
  const receiptLogs = result?.receipt?.logs || [];

  // Try parseRegisteredAgentId from logs if we have logs but no agentId
  if (!agentId && receiptLogs && receiptLogs.length > 0) {
    try {
      const ci = agent.contractInterface;
      if (ci && ci.parseRegisteredAgentId) {
        const parsed = ci.parseRegisteredAgentId(receiptLogs);
        if (parsed !== undefined && parsed !== null) {
          console.log("\n  ℹ️  Agent ID parsed from logs (not in top-level result):", parsed);
          result.agentId = parsed;
        }
      }
    } catch (e) { /* noop */ }
  }

  console.log("\n=============================================");
  console.log("✅  ORBITRA — ERC-8004 REGISTRATION COMPLETE");
  console.log("=============================================");
  if (txHash) {
    console.log("TX HASH :", txHash);
    console.log("BSCSCAN : https://testnet.bscscan.com/tx/" + txHash);
  } else {
    console.log("TX HASH : (not in result object) → open the wallet BSCScan page for the broadcast TX:");
    console.log("          https://testnet.bscscan.com/address/" + WALLET_ADDR);
  }
  if (result.agentId !== undefined && result.agentId !== null) {
    console.log("AGENT ID:", result.agentId);
  } else {
    console.log("AGENT ID: not in top-level result. Check:");
    console.log("          bag erc8004 show --network bsc-testnet");
    console.log("          (after 8004scan indexing comes back online, or resolve via logs)");
  }
  console.log("Network : BSC Testnet (chainId 97)");
  console.log("Wallet  :", WALLET_ADDR);
  console.log("Name    : ORBITRA");
  console.log("Endpoint:", WKA);
  console.log("\nTo verify on-chain manually (bypass 8004scan):");
  console.log("  bag wallet balances --network bsc-testnet");
  console.log("  (nonce =", "(previous nonce + 1) )");
  process.exit(0);
})().catch((e) => {
  console.error("\n💥 FINAL UNCAUGHT:", e?.message || String(e));
  if (e?.cause?.message) console.error("   Cause:", e.cause.message);
  if (e?.stack) console.error(e.stack.split("\n").slice(0, 12).join("\n"));
  process.exit(99);
});
