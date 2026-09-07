"use client";
import {useState} from "react"; import {Nav} from "@/components/Nav";
export default function Autonomy(){
 const [cap,setCap]=useState(500); const [hours,setHours]=useState(24); const [active,setActive]=useState(false);
 return <><Nav/><main className="max-w-3xl mx-auto px-6 py-12"><h1 className="text-4xl font-bold">Autonomy Vault 🔐</h1><p className="text-slate-400 mt-2">Configure authority before delegation.</p>
 <div className="card p-7 mt-8 space-y-7"><label>Spend Cap: <b>${cap}</b><input type="range" min="50" max="5000" step="50" value={cap} onChange={e=>setCap(+e.target.value)} className="block w-full mt-3"/></label>
 <label>Session Expiry<select value={hours} onChange={e=>setHours(+e.target.value)} className="block mt-2 bg-black/30 border border-white/10 rounded-xl p-3"><option value="1">1 hour</option><option value="24">24 hours</option><option value="168">7 days</option></select></label>
 <div><div className="font-semibold">Contract Scope</div><div className="text-slate-400 mt-2">✓ PancakeSwap &nbsp; ✓ Venus &nbsp; ✗ Unrestricted access</div></div>
 <button onClick={()=>setActive(!active)} className={`rounded-xl px-5 py-3 font-semibold ${active?"bg-red-500":"bg-white text-black"}`}>{active?"REVOKE SESSION":"CREATE SESSION (DEMO)"}</button>
 <p className="text-xs text-slate-500">Blockchain signing is intentionally not faked here. Connect the actual Altana SDK and wallet credentials during deployment.</p>
 </div></main></>
}
