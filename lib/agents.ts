export type Category = "REBALANCING"|"GRID_TRADING"|"YIELD_OPTIMIZATION"|"HEALTH_FACTOR";
export type Agent = {
 id:string; name:string; category:Category; description:string;
 trust:number; risk:number; performance:number; availability:number;
 price:string; capabilities:string[];
};
export const agents:Agent[] = [
 {id:"orbitra",name:"ORBITRA",category:"REBALANCING",description:"Autonomous PancakeSwap LP range intelligence and rebalancing.",trust:96,risk:28,performance:18.4,availability:99.9,price:"0.8% performance fee",capabilities:["Range Radar","IL analysis","LP rebalance"]},
 {id:"krypton",name:"KRYPTON",category:"GRID_TRADING",description:"Risk-scoped automated grid strategy intelligence.",trust:91,risk:46,performance:14.2,availability:99.4,price:"$0.12 / execution",capabilities:["Grid analysis","Order management","Risk limits"]},
 {id:"solvyn",name:"SOLVYN",category:"YIELD_OPTIMIZATION",description:"Risk-adjusted yield discovery across supported protocols.",trust:94,risk:33,performance:21.7,availability:99.8,price:"$2 / optimization",capabilities:["Yield Reality Score","APR comparison","Capital routing"]},
 {id:"aegis-9",name:"AEGIS-9",category:"HEALTH_FACTOR",description:"Continuous lending health monitoring and liquidation prevention.",trust:98,risk:12,performance:99.1,availability:100,price:"$0.08 / day",capabilities:["Health monitoring","Liquidation simulation","Emergency actions"]}
];
