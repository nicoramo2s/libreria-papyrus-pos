import SalesByPeriodChart from '../components/reports/SalesByPeriodChart';
import TopProductsChart from '../components/reports/TopProductsChart';
import PaymentBreakdownChart from '../components/reports/PaymentBreakdownChart';
import LowStockTable from '../components/reports/LowStockTable';
import ProfitabilityCard from '../components/reports/ProfitabilityCard';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Profitability summary — top priority */}
      <ProfitabilityCard />

      {/* Charts grid */}
      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <SalesByPeriodChart />
        <PaymentBreakdownChart />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <TopProductsChart />
        <LowStockTable />
      </section>
    </div>
  );
}
