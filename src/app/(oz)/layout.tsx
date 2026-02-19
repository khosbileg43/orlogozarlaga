import Sidebar from "@/src/components/layout/Sidebar";

export default function OzLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body>
        <Sidebar />
        <main className="w-4/5 fixed right-0 top-0 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
