import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  CreditCard,
  ShoppingCart,
  ReceiptText
} from 'lucide-react';

const Statistics = () => {
  const navigate = useNavigate();

  // Sales mock data
  const salesStats = {
    totalOutstanding: 125000,
    totalPaid: 75000,
    totalInvoices: 45,
    activeCustomers: 12,
    averageInvoiceValue: 8500,
    monthlyGrowth: 15.5
  };

  const salesOutstanding = [
    { customerName: 'ABC Industries', outstandingAmount: 35000, lastPaymentDate: '2024-01-10' },
    { customerName: 'XYZ Corp', outstandingAmount: 28000, lastPaymentDate: '2024-01-08' },
    { customerName: 'Tech Solutions', outstandingAmount: 22000, lastPaymentDate: '2024-01-05' },
    { customerName: 'Global Traders', outstandingAmount: 18500, lastPaymentDate: '2024-01-12' },
    { customerName: 'Modern Enterprise', outstandingAmount: 21500, lastPaymentDate: '2024-01-03' }
  ];

  // Purchase mock data (you can replace with real data)
  const purchaseStats = {
    totalPurchases: 580000,
    totalVendors: 8,
    averagePurchaseValue: 72500,
    monthlyPurchaseGrowth: 10.2
  };

  const purchaseOutstanding = [
    { vendorName: 'Supplier One', amountDue: 55000, dueDate: '2024-01-18' },
    { vendorName: 'VendorX Ltd', amountDue: 47000, dueDate: '2024-01-22' },
    { vendorName: 'RawTech', amountDue: 32000, dueDate: '2024-01-15' }
  ];

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
              <FileText className="w-5 h-5 text-blue-600" />
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
                    ₹{salesStats.totalOutstanding.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Amount pending from customers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Received</CardTitle>
                  <TrendingDown className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{salesStats.totalPaid.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Payments received to date</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                  <ReceiptText className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{salesStats.totalInvoices}</div>
                  <p className="text-xs text-muted-foreground">Invoices generated</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{salesStats.activeCustomers}</div>
                  <p className="text-xs text-muted-foreground">Current customer base</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Invoice Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{salesStats.averageInvoiceValue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Average per invoice</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
                  <BarChart3 className="h-4 w-4 text-teal-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-teal-600">
                    +{salesStats.monthlyGrowth}%
                  </div>
                  <p className="text-xs text-muted-foreground">Compared to last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Sales Outstanding */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Customer Outstanding Balances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesOutstanding.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{item.customerName}</h3>
                        <p className="text-sm text-gray-600">Last payment: {item.lastPaymentDate}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">
                          ₹{item.outstandingAmount.toLocaleString()}
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
                      ₹{salesStats.totalOutstanding.toLocaleString()}
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
                  <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{purchaseStats.totalPurchases.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Total purchase amount</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Vendors</CardTitle>
                  <Users className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{purchaseStats.totalVendors}</div>
                  <p className="text-xs text-muted-foreground">Active vendors</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Purchase Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{purchaseStats.averagePurchaseValue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Per transaction average</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Purchase Growth</CardTitle>
                  <BarChart3 className="h-4 w-4 text-teal-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-teal-600">
                    +{purchaseStats.monthlyPurchaseGrowth}%
                  </div>
                  <p className="text-xs text-muted-foreground">Compared to last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Purchase Outstanding */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Vendor Payment Dues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {purchaseOutstanding.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{item.vendorName}</h3>
                        <p className="text-sm text-gray-600">Due by: {item.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">
                          ₹{item.amountDue.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Due</div>
                      </div>
                    </div>
                  ))}
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