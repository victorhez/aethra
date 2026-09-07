import Link from "next/link";
import {Agent} from "@/lib/agents";
export function AgentCard({agent}:{agent:Agent}) {
 return <Link href={`/agents/${agent.id}`} className="card block p-5 hover:border-cyan-400/60 transition">
   <div className="flex justify-between items-start"><div>
    <div className="text-xs tracking-widest text-cyan-300">{agent.category.replace("_"," ")}</div>
    <h3 className="text-2xl font-bold mt-2">{agent.name}</h3>
   </div><div className="text-green-300 text-sm">● LIVE</div></div>
   <p className="text-slate-400 mt-3 text-sm">{agent.description}</p>
   <div className="grid grid-cols-3 gap-3 mt-5 text-sm">
    <div><span className="text-slate-500">Trust</span><b className="block">{agent.trust}/100</b></div>
    <div><span className="text-slate-500">Risk</span><b className="block">{agent.risk}/100</b></div>
    <div><span className="text-slate-500">Score</span><b className="block">{agent.performance}</b></div>
   </div>
 </Link>
}
