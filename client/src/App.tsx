import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import Analyze from "@/pages/analyze";
import History from "@/pages/history";
import DebatePage from "@/pages/debate";
import CheckoutSuccess from "@/pages/checkout-success";
import PurchaseSuccess from "@/pages/purchase-success";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/analyze" component={Analyze} />
      <Route path="/history" component={History} />
      <Route path="/app">{() => <Redirect to="/analyze" />}</Route>
      <Route path="/debate/:id" component={DebatePage} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/purchase/success" component={PurchaseSuccess} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
