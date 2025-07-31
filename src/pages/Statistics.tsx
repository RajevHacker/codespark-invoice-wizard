import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  CreditCard,
  ShoppingCart,
  Loader, // Import Loader icon for loading state
  XCircle // Import XCircle for error state
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/pages/AuthContext"; // Assuming useAuth provides token and partnerName

// Define interfaces for the backend response
interface DuePayment {
  name: string;
  amount: number;
}

interface DashboardSummary {
  totalOutstanding: number;
  totalPurchasePaymentPending: number;
  totOutstandingPayment: DuePayment[];
  vendorPaymentDues: DuePayment[];
}

const Statistics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token, partnerName } = useAuth();

  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardSummary = async () => {
      if (!token || !partnerName) {
        setError("Authentication details missing. Please log in.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const apiUrl = `https://invoicegenerator-bktt.onrender.com/Invoices/DashBoardSummary?partnerName=${partnerName}`;
        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch dashboard summary: ${response.status} ${errorText}`);
        }

        const data: DashboardSummary = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error("Error fetching dashboard summary:", err);
        setError("Failed to load dashboard data. Please try again.");
        toast({
          title: "Error",
          description: "Could not fetch dashboard summary.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardSummary();
  }, [token, partnerName, toast]); // Re-fetch if token or partnerName changes

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="h-10 w-10 animate-spin text-blue-500" />
          <p className="mt-4 text-lg text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center text-red-600">
          <XCircle className="h-10 w-10" />
          <p className="mt-4 text-lg">{error}</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-6">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // If data is loaded and no error, render the dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Statistics & Analytics</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sales Report Analysis */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Sales Report Analysis
            </h2>

            <div className="grid grid-cols-1 gap-6 mb-6">
              <Card>
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
                  <TrendingUp className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {dashboardData ? formatCurrency(dashboardData.totalOutstanding) : formatCurrency(0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Amount pending from customers</p>
                </CardContent>
              </Card>
            </div>

            {/* Customer Outstanding Balances */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Customer Outstanding Balances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.totOutstandingPayment && dashboardData.totOutstandingPayment.length > 0 ? (
                    dashboardData.totOutstandingPayment.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          {/* No lastPaymentDate from API, so remove or add placeholder */}
                          <p className="text-sm text-gray-600">Outstanding detail</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">
                            {formatCurrency(item.amount)}
                          </div>
                          <div className="text-sm text-gray-500">Outstanding</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">No customer outstanding balances found.</p>
                  )}
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-blue-900">Total Outstanding Balance:</span>
                    <span className="text-2xl font-bold text-blue-900">
                      {dashboardData ? formatCurrency(dashboardData.totalOutstanding) : formatCurrency(0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Report Analysis */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-green-600" />
              Purchase Report Analysis
            </h2>

            <div className="grid grid-cols-1 gap-6 mb-6">
              <Card>
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Purchase Payment Pending</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {dashboardData ? formatCurrency(dashboardData.totalPurchasePaymentPending) : formatCurrency(0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Amount pending to vendors</p>
                </CardContent>
              </Card>
            </div>

            {/* Vendor Payment Dues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Vendor Payment Dues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.vendorPaymentDues && dashboardData.vendorPaymentDues.length > 0 ? (
                    dashboardData.vendorPaymentDues.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          {/* No dueDate from API, so remove or add placeholder */}
                          <p className="text-sm text-gray-600">Due detail</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">
                            {formatCurrency(item.amount)}
                          </div>
                          <div className="text-sm text-gray-500">Due</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">No vendor payment dues found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;