export default function DashboardLayout({
  balancePanel,
  summaryPanel,
  transactions,
}: {
  balancePanel: React.ReactNode;
  summaryPanel: React.ReactNode;
  transactions: React.ReactNode;
}) {
  return (
    <div>
      <header>HEADER</header>

      <div className="grid grid-cols-2 gap-4">
        <div>
          {balancePanel}
          {summaryPanel}
        </div>

        <div>{transactions}</div>
      </div>

      <footer>FOOTER</footer>
    </div>
  );
}
