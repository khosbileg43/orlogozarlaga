import { DashboardProvider } from "@/features/dashboard/DashboardProvider";

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
    <DashboardProvider>
      <div className="grid w-full grid-cols-1 gap-3 sm:gap-4 lg:gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="order-1 min-w-0 space-y-3 sm:space-y-4 lg:space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
            <div className="min-w-0 lg:col-span-1">{accountsPanel}</div>
            <div className="min-w-0 lg:col-span-2">{summaryPanel}</div>
          </div>
          <div>{transactions}</div>
        </div>
        <div className="order-2 min-w-0 xl:sticky xl:top-6 xl:h-fit xl:self-start">
          {addTransaction}
        </div>
      </div>
    </DashboardProvider>
  );
}
