import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QualityShell } from "@/components/quality-shell";
import { BatchProbabilityPage, BinomialCalculatorPage, ConclusionPage, DatasetPage, DefectRatePage, OverviewPage, ResultsPage, SimulationPage } from "@/pages/project-pages";
import NotFound from "@/pages/not-found";
import { Route, Switch, useLocation, Router as WouterRouter } from "wouter";

const queryClient = new QueryClient();

function Router() {
  return (
    <RoutedErrorBoundary>
      <QualityShell>
        <Switch>
          <Route path="/" component={OverviewPage} />
          <Route path="/dataset" component={DatasetPage} />
          <Route path="/defect-rate" component={DefectRatePage} />
          <Route path="/binomial-calculator" component={BinomialCalculatorPage} />
          <Route path="/simulation" component={SimulationPage} />
          <Route path="/batch-probability" component={BatchProbabilityPage} />
          <Route path="/results" component={ResultsPage} />
          <Route path="/conclusion" component={ConclusionPage} />
          <Route component={NotFound} />
        </Switch>
      </QualityShell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
