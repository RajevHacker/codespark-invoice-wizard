
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import GenerateInvoice from "./pages/GenerateInvoice";
import AddCustomer from "./pages/AddCustomer";
import AddProduct from "./pages/AddProduct";
import UpdateCustomer from "./pages/UpdateCustomer";
import CancelInvoice from "./pages/CancelInvoice";
import RecordPayment from "./pages/RecordPayment";
import Statistics from "./pages/Statistics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/generate-invoice" element={<GenerateInvoice />} />
          <Route path="/add-customer" element={<AddCustomer />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/update-customer" element={<UpdateCustomer />} />
          <Route path="/cancel-invoice" element={<CancelInvoice />} />
          <Route path="/record-payment" element={<RecordPayment />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
