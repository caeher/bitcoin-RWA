import { Link } from 'react-router-dom';
import {
  ActivityFeedCard,
  DashboardBalanceCard,
  DepositAddress,
  Layout,
  MarketplaceOpenOrdersCard,
  PortfolioBreakdownCard,
  PortfolioTableCard,
  Button,
  SectionHeader,
} from '@components';

export function Dashboard() {
  return (
    <Layout>
      <div className="space-y-6">
        <SectionHeader
          title="Dashboard"
          description="Welcome back to your portfolio"
          actions={
            <>
              <Link to="/wallet/deposit">
                <Button variant="outline">Deposit</Button>
              </Link>
              <Link to="/assets/submit">
                <Button>Submit Asset</Button>
              </Link>
            </>
          }
        />

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <DashboardBalanceCard />
            <DepositAddress />
          </div>
          <PortfolioBreakdownCard />
        </div>

        <PortfolioTableCard />

        <div className="grid lg:grid-cols-2 gap-6">
          <ActivityFeedCard />
          <MarketplaceOpenOrdersCard />
        </div>
      </div>
    </Layout>
  );
}
