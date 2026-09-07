import Link from "next/link";
export function Nav(){
 return <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#05070d]/80 backdrop-blur px-6 py-4 flex items-center justify-between">
  <Link href="/" className="text-xl font-bold tracking-[.2em]">ÆTHRA</Link>
  <div className="hidden md:flex gap-6 text-sm text-slate-300">
   <Link href="/explore">Explore</Link><Link href="/mirror">Mirror</Link>
   <Link href="/arena">Arena</Link><Link href="/autonomy">Autonomy Vault</Link>
   <Link href="/advantage">Advantage Lab</Link>
  </div>
  <Link href="/explore" className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold">Launch Exchange</Link>
 </nav>
}
