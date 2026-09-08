import { ERC8004Agent, EVMWalletProvider } from "@bnbagent/sdk";
import { bytesToHex, hexToBytes, keccak256, toBytes, encodePacked } from "viem";

const WALLET_ADDR = "0x4AFe676E519989C14DA36498939F0151A85B9Cf0";
const PASS = process.env.WALLET_PASSWORD || "";

function bigIntReplacer(key, value) {
  return typeof value === "bigint" ? value.toString() + "n" : value;
}
function safeStringify(obj) {
  return JSON.stringify(obj, bigIntReplacer, 2);
}

function padToBytes32(addr) {
  let h = addr.toLowerCase().replace("0x", "");
  while (h.length < 64) h = "0" + h;
  return "0x" + h;
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
    debug: false,
  });

  console.log("========================================");
  console.log("CHECKING EXISTING AGENT REGISTRATIONS");
  console.log("========================================");
  console.log("Owner wallet:", WALLET_ADDR);
  console.log("");

  const ci = agent.contractInterface;
  const walletBytes32 = padToBytes32(WALLET_ADDR);

  console.log("=== Method 1: Try common agentId patterns ===\n");

  const candidateIds = [];

  candidateIds.push(["WALLET_ADDR (as bytes32)", walletBytes32]);
  candidateIds.push(["WALLET_ADDR (as address)", WALLET_ADDR]);

  for (let nonce = 0; nonce <= 6; nonce++) {
    try {
      const packed = encodePacked(
        ["address", "uint256"],
        [WALLET_ADDR, BigInt(nonce)]
      );
      const id = keccak256(packed);
      candidateIds.push([`keccak256(owner,nonce=${nonce})`, id]);
    } catch (e) {}
  }

  for (let i = 0n; i <= 10n; i++) {
    candidateIds.push([`uint256(${i})`, "0x" + i.toString(16).padStart(64, "0")]);
  }

  let found = null;

  for (const [label, id] of candidateIds) {
    process.stdout.write("  " + label.padEnd(34) + " → ");
    try {
      const info = await ci.getAgentInfo(id);
      if (info && info.agentUri && info.agentUri.length > 2) {
        console.log("✅ FOUND!");
        found = { agentId: id, label, info };
        break;
      } else {
        console.log("empty");
      }
    } catch (e) {
      console.log("err: " + (e.message?.substring(0, 40) || e));
    }
  }

  if (found) {
    console.log("\n========================================");
    console.log("✅ RECOVERED AGENT REGISTRATION!");
    console.log("========================================");
    console.log("Matched pattern:", found.label);
    console.log("Agent ID:", found.agentId);
    console.log("URI (truncated):", (found.info.agentUri || "").substring(0, 100) + "...");
    console.log("Full info:");
    console.log(safeStringify(found.info));

    try {
      const md = await ci.getMetadata(found.agentId);
      console.log("\nMetadata:", safeStringify(md));
    } catch (e) {
      console.log("\nMetadata fetch err:", e.message);
    }

    console.log("\n========================================");
    console.log("BSC Scan: https://testnet.bscscan.com/address/" + WALLET_ADDR);
    console.log("========================================");
    process.exit(0);
  }

  console.log("\n=== Method 2: Try getAgentInfo on all TX nonces ===\n");
  console.log("(Trying direct contract calls with alternate signatures)\n");

  try {
    const contractAddress = ci.address || "0x8004A818BFB912233c491871b3d84c89A494BD9e";
    console.log("ERC-8004 Registry:", contractAddress);
    console.log("\nPlease visit BSC Scan directly:");
    console.log("  Wallet TXs: https://testnet.bscscan.com/address/" + WALLET_ADDR);
    console.log("  Registry:   https://testnet.bscscan.com/address/" + contractAddress);
    console.log("\nLook for the latest 'register' transaction events (AgentRegistered)");
  } catch (e) {}

  console.log("\n=== Method 3: Register NEW clean agent (nonce-based IDs ===\n");
  console.log("If not found above, the 5+ earlier TXs registered these nonce-derived IDs.");
  console.log("Re-run with debug=true above to see events from logs.");
  process.exit(2);
})().catch((e) => {
  console.error("FATAL:", e.message);
  if (e.stack) console.error(e.stack.split("\n").slice(0, 5).join("\n"));
  process.exit(1);
});
