// Debug SDK registerAgent internals using Function.prototype.toString()
import { ERC8004Agent, EVMWalletProvider } from "@bnbagent/sdk";

const WALLET_ADDR = "0x4AFe676E519989C14DA36498939F0151A85B9Cf0";
const PASS = process.env.WALLET_PASSWORD || "";
const URL = "https://aethra-five-beta.vercel.app/api/orbitra";
const WKA = URL + "/.well-known/agent-card.json";

const w = new EVMWalletProvider({ password: PASS, address: WALLET_ADDR });
const agent = new ERC8004Agent({ network: "bsc-testnet", wallet_provider: w, walletProvider: w });

console.log("=== Register Agent Instance Properties ======");
console.log("Own keys:", Object.keys(agent).sort());
const proto = Object.getPrototypeOf(agent);
console.log("Proto methods:", Object.getOwnPropertyNames(proto).sort());

// Print registerAgent source
console.log("\n=== registerAgent.toString() — lines around 1990-2010 of chunk-TKWQT3DN ===\n");
try {
  const src = proto.registerAgent.toString();
  const lines = src.split("\n");
  console.log("Total lines in registerAgent source:", lines.length);
  // Print all lines (may be minified so long lines)
  if (lines.length < 200) {
    let i = 0;
    for (const line of lines) {
      console.log(String(i).padStart(3, "0") + ": " + line.substring(0, 400));
      i++;
    }
  } else {
    // Long: just first 200 lines
    for (let i = 0; i < 200 && i < lines.length; i++) {
      console.log(String(i).padStart(3, "0") + ": " + lines[i].substring(0, 400));
    }
    console.log("... (truncated)");
  }
} catch (e) {
  console.log("Can't stringify:", e.message);
  // Try native require to get string
  try {
    const registerAgentStr = "" + proto.registerAgent;
    console.log("Source length:", registerAgentStr.length);
    // Find interesting parts around keywords
    const kws = ["parseAgentUri", "name field", "registerAgent", "contract", "registry", "network", "wallet"];
    for (const kw of kws) {
      const idx = registerAgentStr.indexOf(kw);
      if (idx >= 0) {
        console.log(`Found '${kw}' at index ${idx}: ...`);
        console.log("  ... " + registerAgentStr.substring(Math.max(0, idx - 100), idx + 200) + " ...\n");
      }
    }
  } catch (e2) { console.log("Alt stringify failed:", e2.message); }
}

console.log("\n=== Check instance for internal contract/provider fields ===");
const allProps = [];
(function w(o, prefix="", depth=0) {
  if (depth > 3) return;
  if (!o || typeof o !== "object") return;
  for (const k of Object.keys(o)) {
    const path = prefix ? prefix + "." + k : k;
    allProps.push(path + " [typeof=" + typeof o[k] + "]");
    if (o[k] && typeof o[k] === "object") {
      w(o[k], path, depth + 1);
    }
  }
})(agent);
console.log("All nested instance props:", allProps.slice(0, 50).join("\n  "));

console.log("\n=== Agent constructor source to see fields set ===");
try {
  const conSrc = ERC8004Agent.prototype.constructor.toString();
  console.log("Constructor lines:", conSrc.split("\n").length);
  const idx1 = conSrc.indexOf("this.");
  if (idx1 >= 0) console.log("Around 'this.':", conSrc.substring(idx1, idx1 + 800));
} catch (e) { console.log("Constructor stringify error:", e.message); }
