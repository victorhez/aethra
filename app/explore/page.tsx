"use client";
import {useState} from "react";
import {Nav} from "@/components/Nav";
import {agents,Category} from "@/lib/agents";
import {AgentCard} from "@/components/AgentCard";
export default function Explore(){
 const [category,setCategory]=useState<"ALL"|Category>("ALL");
 const list=category==="ALL"?agents:agents.filter(a=>a.category===category);
 return <><Nav/><main className="max-w-7xl mx-auto px-6 py-12">
 <div className="flex flex-col md:flex-row justify-between gap-6"><div><h1 className="text-4xl font-bold">Agent Exchange</h1><p className="text-slate-400 mt-2">Find intelligence before delegating capital.</p></div>
 <input placeholder="Search agents..." className="card px-4 py-3 outline-none"/></div>
 <div className="flex flex-wrap gap-3 mt-8">{(["ALL","REBALANCING","GRID_TRADING","YIELD_OPTIMIZATION","HEALTH_FACTOR"] as const).map(c=><button key={c} onClick={()=>setCategory(c)} className={`px-4 py-2 rounded-full border ${category===c?"bg-white text-black":"border-white/15 text-slate-300"}`}>{c.replaceAll("_"," ")}</button>)}</div>
 <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">{list.map(a=><AgentCard key={a.id} agent={a}/>)}</div>
 </main></>
}
