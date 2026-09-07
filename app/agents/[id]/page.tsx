import {notFound} from "next/navigation";
import {Nav} from "@/components/Nav";
import {agents} from "@/lib/agents";
import Link from "next/link";
export default async function AgentPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const agent=agents.find(a=>a.id===id); if(!agent) notFound();
 return <><Nav/><main className="max-w-5xl mx-auto px-6 py-12">
 <div className="card p-8"><div className="text-cyan-300 text-sm tracking-widest">{agent.category.replace("_"," ")}</div>
 <h1 className="text-5xl font-bold mt-3">{agent.name}</h1><p className="text-slate-400 text-lg mt-4">{agent.description}</p>
 <div className="grid md:grid-cols-4 gap-4 mt-8">{[["Trust",agent.trust+"/100"],["Risk",agent.risk+"/100"],["Performance",agent.performance+"%"],["Availability",agent.availability+"%"]].map(([k,v])=><div key={k} className="rounded-xl bg-white/5 p-4"><span className="text-slate-500">{k}</span><b className="block text-xl mt-2">{v}</b></div>)}</div>
 <h2 className="text-xl font-semibold mt-8">Agent DNA</h2><div className="flex flex-wrap gap-3 mt-3">{agent.capabilities.map(c=><span key={c} className="rounded-full bg-cyan-400/10 text-cyan-200 px-4 py-2">{c}</span>)}</div>
 <div className="flex gap-4 mt-10"><Link href={`/mirror?agent=${agent.id}`} className="bg-white text-black px-5 py-3 rounded-xl font-semibold">Run Agent Mirror</Link><Link href="/autonomy" className="border border-white/20 px-5 py-3 rounded-xl">Configure Autonomy</Link></div>
 </div></main></>
}
