"use client";
import {useState} from "react"; import {Nav} from "@/components/Nav"; import {agents} from "@/lib/agents";
export default function Arena(){
 const [selected,setSelected]=useState(["orbitra","solvyn"]); const toggle=(id:string)=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):s.length<3?[...s,id]:s);
 return <><Nav/><main className="max-w-5xl mx-auto px-6 py-12"><h1 className="text-4xl font-bold">Agent Arena ⚔️</h1><p className="text-slate-400 mt-2">Same market. Same conditions. Compare intelligence.</p>
 <div className="grid md:grid-cols-4 gap-4 mt-8">{agents.map(a=><button key={a.id} onClick={()=>toggle(a.id)} className={`card p-5 text-left ${selected.includes(a.id)?"border-cyan-400":"opacity-60"}`}><b>{a.name}</b><div className="text-sm text-slate-400 mt-2">{a.category}</div></button>)}</div>
 <div className="card p-6 mt-8"><h2 className="text-xl font-semibold">Arena Results</h2>{agents.filter(a=>selected.includes(a.id)).sort((a,b)=>b.performance-a.performance).map((a,i)=><div className="flex justify-between border-b border-white/10 py-5" key={a.id}><span>#{i+1} {a.name}</span><span className="text-cyan-300">Score {a.performance}</span></div>)}</div>
 </main></>
}
