"use client";
import {useState} from "react"; import {Nav} from "@/components/Nav"; import {agents} from "@/lib/agents";
export default function Mirror(){
 const [agent,setAgent]=useState(agents[0].id); const [capital,setCapital]=useState(10000); const [ran,setRan]=useState(false);
 const a=agents.find(x=>x.id===agent)!; const result=capital*(a.performance/100);
 return <><Nav/><main className="max-w-4xl mx-auto px-6 py-12"><h1 className="text-4xl font-bold">Agent Mirror <span className="text-cyan-300">🪞</span></h1><p className="text-slate-400 mt-2">A prototype counterfactual simulation interface.</p>
 <div className="card p-6 mt-8 grid gap-5">
 <label>Agent<select value={agent} onChange={e=>setAgent(e.target.value)} className="block w-full mt-2 bg-black/30 border border-white/10 rounded-xl p-3">{agents.map(x=><option value={x.id} key={x.id}>{x.name}</option>)}</select></label>
 <label>Capital<input type="number" value={capital} onChange={e=>setCapital(Number(e.target.value))} className="block w-full mt-2 bg-black/30 border border-white/10 rounded-xl p-3"/></label>
 <button onClick={()=>setRan(true)} className="bg-white text-black rounded-xl p-3 font-semibold">Run Mirror Simulation</button>
 </div>
 {ran&&<div className="grid md:grid-cols-4 gap-4 mt-6">{[["Estimated Return","$"+result.toLocaleString()],["Trust",a.trust+"/100"],["Risk",a.risk+"/100"],["Confidence","Prototype"]].map(([k,v])=><div key={k} className="card p-5"><div className="text-slate-500">{k}</div><b className="text-2xl block mt-2">{v}</b></div>)}</div>}
 </main></>
}
