export default function DashboardLayout({
  accountsPanel,
  addTransaction,
  summaryPanel,
  transactions,
}: {
  accountsPanel: React.ReactNode;
  addTransaction: React.ReactNode;
  summaryPanel: React.ReactNode;
  transactions: React.ReactNode;
}) {
  return (
    <div className="flex w-full gap-4">
      <div className="flex flex-2 flex-col gap-8 p-8">
        <div className="flex gap-8">
          {accountsPanel}
          {summaryPanel}
        </div>
        {transactions}
      </div>
      <div className=" flex flex-1">{addTransaction}</div>
    </div>
  );
}
