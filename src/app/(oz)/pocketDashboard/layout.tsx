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
    <div className="grid w-full grid-cols-1 gap-4 lg:gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="order-1 min-w-0">
        <div className="grid grid-cols-3 grid-rows-1 gap-4 lg:gap-5 ">
          <div className="min-w-0 col-span-1">{accountsPanel}</div>
          <div className="min-w-0 col-span-2">{summaryPanel}</div>
        </div>
        <div className="mt-4 lg:mt-5">{transactions}</div>
      </div>
      <div className="order-2 xl:sticky xl:top-6 xl:h-fit xl:self-start">
        {addTransaction}
      </div>
    </div>
  );
}
