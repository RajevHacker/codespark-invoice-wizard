
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Building2, FileText, Users, Package, CreditCard, BarChart3, XCircle, LogOut } from 'lucide-react';

const Dashboard = () => {
  const [businessName, setBusinessName] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

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
    {
      title: 'Cancel Invoice',
      description: 'Cancel or void existing invoices',
      icon: XCircle,
      color: 'bg-red-500',
      path: '/cancel-invoice'
    },
    {
      title: 'Record Payment',
      description: 'Record customer payments',
      icon: CreditCard,
      color: 'bg-teal-500',
      path: '/record-payment'
    },
    {
      title: 'Statistics',
      description: 'View payment balance and analytics',
      icon: BarChart3,
      color: 'bg-indigo-500',
      path: '/statistics'
    }
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

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <p className="text-xs text-gray-600">Generated this month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <p className="text-xs text-gray-600">Active customers</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">₹0</div>
              <p className="text-xs text-gray-600">Outstanding balance</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
