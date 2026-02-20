import Sidebar from "@/components/layout/Sidebar";

export default function OzLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body>
        <div className="flex justify-end">
          <Sidebar />
          <main className="flex w-4/5 min-h-screen">{children}</main>
        </div>
      </body>
    </html>
  );
}
