import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added CardDescription
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"; // Added Select components
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Save, Loader } from 'lucide-react'; // Added Loader icon
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/pages/AuthContext";

// Interface for the data returned by GetRecentPaymentTransaction API
interface PaymentReport {
  customerName: string;
  date: string; // API returns date as string (e.g., "2025-07-21")
  amount: number; // API returns amount as number
}

const RecordPayment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token, partnerName } = useAuth(); // Assuming partnerName is available from useAuth

  const [paymentData, setPaymentData] = useState({
    customerName: '',
    date: new Date().toISOString().split('T')[0], // Default to current date in YYYY-MM-DD format
    bankName: '', // This will correspond to paymentMode in the UI
    amount: ''
  });

  const [customerSuggestions, setCustomerSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // New state for recent transactions
  const [recentTransactions, setRecentTransactions] = useState<PaymentReport[]>([]);
  const [isRecentLoading, setIsRecentLoading] = useState(false);

  // Helper function to format date to dd-MMM-yyyy
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if invalid
      }
      // Format as dd-MMM-yyyy
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Fallback to original string on error
    }
  };

  // Function to fetch recent payment transactions
  const fetchRecentTransactions = async () => {
    if (!token || !partnerName) {
      // Don't try to fetch if authentication details are missing
      return;
    }

    setIsRecentLoading(true);
    try {
      // API call for recent payment transactions
      const apiUrl = `https://invoicegenerator-bktt.onrender.com/Invoices/GetRecentPaymentTransaction?partnerName=${partnerName}&paymentType=Payments`;
      const resp = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!resp.ok) {
        throw new Error(`Failed to fetch recent transactions: ${resp.statusText}`);
      }

      const data: PaymentReport[] = await resp.json();
      setRecentTransactions(data);
    } catch (e) {
      console.error("Error fetching recent transactions:", e);
      toast({
        title: "Error",
        description: "Unable to fetch recent payment transactions.",
        variant: "destructive",
      });
    } finally {
      setIsRecentLoading(false);
    }
  };

  // Effect hook to fetch recent transactions on component mount or auth change
  useEffect(() => {
    fetchRecentTransactions();
  }, [token, partnerName]); // Re-run when token or partnerName changes

  const handleInputChange = (field: string, value: string) => {
    setPaymentData({ ...paymentData, [field]: value });
    if (field === "customerName") {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPaymentData({ ...paymentData, customerName: suggestion });
    setShowSuggestions(false);
  };

  const searchCustomers = async (searchValue: string) => {
    if (!partnerName || !token) return;

    try {
      const response = await fetch(
        `https://invoicegenerator-bktt.onrender.com/Invoices/SearchCustomers?partnerName=${encodeURIComponent(partnerName)}&searchValue=${encodeURIComponent(searchValue)}&sheetName=CustomerDetails`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const result = await response.json();
      setCustomerSuggestions(result);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Customer search error:", error);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const name = paymentData.customerName.trim();
      if (name.length >= 2) {
        searchCustomers(name);
      } else {
        setCustomerSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [paymentData.customerName, token, partnerName]); // Added token, partnerName to dependencies

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentData.customerName || !paymentData.amount || !paymentData.bankName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(paymentData.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (!token || !partnerName) {
      toast({
        title: "Error",
        description: "Authorization error. Please login again.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`https://invoicegenerator-bktt.onrender.com/Invoices/PaymentEntry?partnerName=${encodeURIComponent(partnerName)}&paymentType=Payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          CustomerName: paymentData.customerName,
          Date: paymentData.date,
          BankName: paymentData.bankName, // This maps to your 'BankName' field in the backend
          Amount: paymentData.amount
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to record payment.");
      }

      toast({
        title: "Success",
        description: `Payment of ₹${parseFloat(paymentData.amount).toLocaleString()} recorded successfully for ${paymentData.customerName}!`,
      });

      // Reset form fields after successful submission
      setPaymentData({
        customerName: '',
        date: new Date().toISOString().split('T')[0],
        bankName: '',
        amount: ''
      });

      setCustomerSuggestions([]);
      setShowSuggestions(false);
      fetchRecentTransactions(); // Re-fetch recent transactions after a successful payment

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong while recording payment.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Record Payment</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Customer Name and Payment Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={paymentData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    required
                  />
                  {showSuggestions && customerSuggestions.length > 0 && (
                    <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded shadow max-h-48 overflow-y-auto">
                      {customerSuggestions.map((name, index) => (
                        <li
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSuggestionClick(name)}
                        >
                          {name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Payment Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={paymentData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Row 2: Payment Mode and Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Payment Mode *</Label>
                  <Select value={paymentData.bankName} onValueChange={(value) => handleInputChange('bankName', value)} required>
                    <SelectTrigger id="bankName"><SelectValue placeholder="Select mode" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="Enter payment amount"
                    value={paymentData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* --- Recent Transactions Table --- */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Payment Transactions</CardTitle>
            <CardDescription>Last 10 payments recorded</CardDescription>
          </CardHeader>
          <CardContent>
            {isRecentLoading ? (
              <div className="flex justify-center items-center h-24">
                <Loader className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading recent transactions...</span>
              </div>
            ) : recentTransactions.length === 0 ? (
              <p className="text-center text-gray-500">No recent transactions found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-4 py-2">Customer Name</th>
                      <th className="border px-4 py-2">Date</th>
                      <th className="border px-4 py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((transaction, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border px-4 py-2">{transaction.customerName}</td>
                        <td className="border px-4 py-2">{formatDate(transaction.date)}</td>
                        <td className="border px-4 py-2">₹{transaction.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecordPayment;
