
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, DollarSign, Users, FileText, CreditCard } from 'lucide-react';

const Statistics = () => {
  const navigate = useNavigate();

  // Mock data for demonstration
  const mockStats = {
    totalOutstanding: 125000,
    totalPaid: 75000,
    totalInvoices: 45,
    activeCustomers: 12,
    averageInvoiceValue: 8500,
    monthlyGrowth: 15.5
  };

  const mockPaymentBalances = [
    { customerName: 'ABC Industries', outstandingAmount: 35000, lastPaymentDate: '2024-01-10' },
    { customerName: 'XYZ Corp', outstandingAmount: 28000, lastPaymentDate: '2024-01-08' },
    { customerName: 'Tech Solutions', outstandingAmount: 22000, lastPaymentDate: '2024-01-05' },
    { customerName: 'Global Traders', outstandingAmount: 18500, lastPaymentDate: '2024-01-12' },
    { customerName: 'Modern Enterprise', outstandingAmount: 21500, lastPaymentDate: '2024-01-03' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Statistics & Analytics</h1>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ₹{mockStats.totalOutstanding.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Amount pending from customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{mockStats.totalPaid.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Payments received to date
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalInvoices}</div>
              <p className="text-xs text-muted-foreground">
                Invoices generated
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.activeCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Current customer base
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Invoice Value</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{mockStats.averageInvoiceValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Average per invoice
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
              <BarChart3 className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">
                +{mockStats.monthlyGrowth}%
              </div>
              <p className="text-xs text-muted-foreground">
                Compared to last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Balances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Outstanding Payment Balances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPaymentBalances.map((balance, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{balance.customerName}</h3>
                    <p className="text-sm text-gray-600">
                      Last payment: {balance.lastPaymentDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">
                      ₹{balance.outstandingAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Outstanding</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-900">Total Outstanding Balance:</span>
                <span className="text-2xl font-bold text-blue-900">
                  ₹{mockStats.totalOutstanding.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
