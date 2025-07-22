import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Building2, FileText, Users, Package, CreditCard, BarChart3, XCircle, LogOut, ShoppingCart, Receipt, FileBarChart, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [businessName, setBusinessName] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const salesStats = {
    totalOutstanding: 125000,
    totalPaid: 75000,
    totalInvoices: 45,
    activeCustomers: 12,
    averageInvoiceValue: 8500,
    monthlyGrowth: 15.5
  };
  const purchaseStats = {
    totalPurchases: 580000,
    totalVendors: 8,
    averagePurchaseValue: 72500,
    monthlyPurchaseGrowth: 10.2
  };
  useEffect(() => {
    const storedBusinessName = localStorage.getItem('businessName');
    const storedUsername = localStorage.getItem('username');
    
    if (!storedBusinessName || !storedUsername) {
      navigate('/');
      return;
    }
    
    setBusinessName(storedBusinessName);
    setUsername(storedUsername);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('businessName');
    localStorage.removeItem('username');
    navigate('/');
  };

  const dashboardItems = [
    {
      title: 'Generate Invoice',
      description: 'Create new invoices for your customers',
      icon: FileText,
      color: 'bg-green-500',
      path: '/generate-invoice'
    },
    {
      title: 'Report Generation',
      description: 'Generate purchase and sales reports',
      icon: FileBarChart,
      color: 'bg-cyan-500',
      path: '/report-generation'
    },
    {
      title: 'Record Payment',
      description: 'Record customer payments',
      icon: CreditCard,
      color: 'bg-teal-500',
      path: '/record-payment'
    },
    {
      title: 'Add Purchase Entry',
      description: 'Add purchase order details',
      icon: ShoppingCart,
      color: 'bg-yellow-500',
      path: '/add-purchase-entry'
    },
    {
      title: 'Record Purchase Payment',
      description: 'Record payments for purchase orders',
      icon: Receipt,
      color: 'bg-pink-500',
      path: '/record-purchase-payment'
    },
    {
      title: 'Cancel Invoice',
      description: 'Cancel or void existing invoices',
      icon: XCircle,
      color: 'bg-red-500',
      path: '/cancel-invoice'
    },
    {
      title: 'Add Customer',
      description: 'Add new customer information',
      icon: Users,
      color: 'bg-blue-500',
      path: '/add-customer'
    },
    {
      title: 'Add Product',
      description: 'Add new products to your catalog',
      icon: Package,
      color: 'bg-purple-500',
      path: '/add-product'
    },
    {
      title: 'Update Customer',
      description: 'Modify existing customer details',
      icon: Users,
      color: 'bg-orange-500',
      path: '/update-customer'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CodeSpark Invoice Generator</h1>
                <p className="text-sm text-gray-600">{businessName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {username}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
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
          
          <Card className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"  onClick={() => navigate('/statistics')}>
            <div className="bg-indigo-500 p-3 rounded-lg text-white flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Statistics</h3>
              <p className="text-sm text-gray-500">View payment balance and analytics</p>
            </div>
          </Card>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Manage your invoices, customers, and business operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(item.path)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`${item.color} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
