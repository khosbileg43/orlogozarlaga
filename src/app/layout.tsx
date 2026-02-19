import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "OrlogoZarlaga",
  description: "Personal & Household Finance Manager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
