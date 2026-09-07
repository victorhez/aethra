import "./globals.css";
export const metadata = { title: "ÆTHRA", description: "Agent Intelligence Exchange" };
export default function RootLayout({children}:{children:React.ReactNode}) {
 return <html lang="en"><body className="grid-bg min-h-screen">{children}</body></html>
}
