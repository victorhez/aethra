// Explore the actual SDK API pieces that matter
import { ERC8004Agent, EVMWalletProvider, AgentEndpoint } from "@bnbagent/sdk";

const WALLET_ADDR = "0x4AFe676E519989C14DA36498939F0151A85B9Cf0";
const PASS = process.env.WALLET_PASSWORD || "";

// 1. AgentEndpoint.a2a signature
console.log("=== AgentEndpoint.a2a('https://example.com', '0.3.0')");
try {
  const ep = AgentEndpoint.a2a("https://example.com", "0.3.0");
  console.log("  constructed. toDict:", JSON.stringify(ep.toDict(), null, 2));
  console.log("  has .endpoint property?", 'endpoint' in ep);
  console.log("  ep.endpoint =", ep.endpoint);
  console.log("  all keys on ep:", Object.keys(ep));
  const epDict = ep.toDict();
  console.log("  all keys on toDict:", Object.keys(epDict));
} catch(e) { console.log("  ERR:", e.message); }

// 2. ERC8004Agent.create() factory — what does it return? 
//    If wallet
console.log("\n=== ERC8004Agent.create({network, wallet_provider}) type?");
// construct the wallet without init first
console.log("  Constructing wallet for create()…");
const w = new EVMWalletProvider({ password: PASS, address: WALLET_ADDR });
console.log("  wallet.address =", w.address);

try {
  const agent2 = ERC8004Agent.create({
    network: "bsc-testnet",
    wallet_provider: w,
  });
  console.log("  create returned:", typeof agent2, agent2 ? Object.keys(agent2 || {}) : 'null');
  console.log("  agent2 network prop?", agent2 && 'network' in agent2);
  console.log("  agent2 walletAddress?", agent2 && agent2.walletAddress);
  console.log("  agent2.walletAddress()?", typeof (agent2?.walletAddress));
  
  // 3. generateAgentUri with 1/2 args — what is the shape?
  console.log("\n=== generateAgentUri — what arg shape does it want?");
  try {
    const uri1 = agent2.generateAgentUri({
      name: "test",
      description: "test",
      endpoints: [AgentEndpoint.a2a("https://example.com", "0.3.0")],
    });
    console.log("  uri1 SUCCESS, len=", uri1?.length || 0);
    console.log("  uri1 first 200:", uri1?.substring?.(0,200));
  } catch(e) {
    console.log("  FAIL 1 arg:", e.message);
    console.log("  stack first 3 lines:", e.stack?.split('\n').slice(0,3).join('\n'));
  }

  // Maybe generateAgentUri with 2 args
  try {
    const uri2 = agent2.generateAgentUri(
      { name: "test", description: "test", endpoints: [AgentEndpoint.a2a("https://example.com", "0.3.0")] },
      { }
    );
    console.log("  uri2 SUCCESS 2 args, len=", uri2?.length);
  } catch(e) {
    console.log("  FAIL 2 args:", e.message);
  }

  // Maybe with generateAgentUri({ name, endpoints })?
  console.log("\n=== Trying different endpoint shapes");
  // Maybe endpoints array with raw dict instead of AgentEndpoint instance
  try {
    const uri3 = agent2.generateAgentUri({
      name: "test",
      endpoints: [{ name: "A2A", endpoint: "https://example.com", version: "0.3.0" }],
    });
    console.log("  raw dict endpoints SUCCESS, len=", uri3?.length);
  } catch(e) {
    console.log("  raw dict FAIL:", e.message);
  }

  // Maybe it needs wallet_address explicitly passed explicitly
  try {
    const uri4 = agent2.generateAgentUri({
      name: "test",
      wallet_address: WALLET_ADDR,
      endpoints: [AgentEndpoint.a2a("https://example.com", "0.3.0")],
    });
    console.log("  with wallet_address SUCCESS, len=", uri4?.length);
  } catch(e) {
    console.log("  wallet_address FAIL:", e.message);
  }

} catch(e) {
  console.log("  ERC8004Agent.create FAIL:", e.message);
  console.log(e.stack?.split('\n').slice(0,3).join('\n'));
}
