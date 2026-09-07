import Link from "next/link";
import {Nav} from "@/components/Nav";
import {agents} from "@/lib/agents";
import {AgentCard} from "@/components/AgentCard";

export default function Home(){
 return <><Nav/><main className="max-w-7xl mx-auto px-6">
 <section className="py-24 text-center">
  <div className="text-cyan-300 tracking-[.3em] text-sm">THE AGENT INTELLIGENCE EXCHANGE</div>
  <h1 className="text-5xl md:text-7xl font-bold mt-6">Don't hire an agent.<br/><span className="text-cyan-300">Interrogate its future.</span></h1>
  <p className="max-w-2xl mx-auto text-slate-400 mt-7 text-lg">Discover, verify, simulate, compare and safely delegate authority to autonomous financial agents.</p>
  <div className="flex justify-center gap-4 mt-9">
   <Link href="/explore" className="bg-white text-black rounded-xl px-6 py-3 font-semibold">Explore Agents</Link>
   <Link href="/mirror" className="border border-white/20 rounded-xl px-6 py-3">Mirror an Agent</Link>
  </div>
 </section>
 <section className="grid md:grid-cols-4 gap-4 pb-12">
  {[["200K+","Agent Economy"],["4","Financial Categories"],["24/7","Autonomous Monitoring"],["1 Click","Permission Revocation"]].map(([n,l])=><div key={l} className="card p-6"><div className="text-3xl font-bold">{n}</div><div className="text-slate-400 mt-2">{l}</div></div>)}
 </section>
 <section className="pb-20"><div className="flex justify-between mb-6"><h2 className="text-3xl font-bold">Featured Intelligence</h2><Link href="/explore" className="text-cyan-300">View all →</Link></div>
 <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">{agents.map(a=><AgentCard key={a.id} agent={a}/>)}</div>
 </section>
 </main></>
}
