import { useState, useEffect, useRef } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Loader } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/pages/AuthContext";
import config from '../config';
// Updated PaymentReport interface to match the JSON keys from your C# API
interface PaymentReport {
  customerName: string;
  date: string; // Keeping as string as per your API response example
  amount: number; // Keeping as number as per your API response example
}

interface PurchaseBalance {
  invoiceNumber: string;
  customerName: string;
  grandTotal: number;
  balanceAmount: number;
  paymentStatus: string;
  date: string;
}

const RecordPurchasePayment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token, partnerName } = useAuth(); // Assuming partnerName is available from useAuth

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]); // State for suggestions
  const [showSuggestions, setShowSuggestions] = useState(false); // State to control suggestion visibility
  const suggestionBoxRef = useRef<HTMLDivElement>(null); // Ref for suggestion box
  const [results, setResults] = useState<PurchaseBalance[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<PurchaseBalance | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // New state for recent transactions
  const [recentTransactions, setRecentTransactions] = useState<PaymentReport[]>([]);
  const [isRecentLoading, setIsRecentLoading] = useState(false);

  // Function to fetch recent payment transactions
  const fetchRecentTransactions = async () => {
    if (!token || !partnerName) {
      // Don't try to fetch if authentication details are missing
      return;
    }

    setIsRecentLoading(true);
    try {
      // Construct the API URL for recent transactions
      // Ensure this URL matches your backend endpoint for recent transactions
      const apiUrl = `${config.BACKEND_HOST}/Invoices/GetRecentPaymentTransaction?partnerName=${partnerName}&paymentType=PurchasePayment`;
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

  // useEffect to fetch recent transactions on component mount or auth change
  useEffect(() => {
    fetchRecentTransactions();
  }, [token, partnerName]); // Re-run when token or partnerName changes

  // Debounce for suggestion fetching
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.length > 1 && token && partnerName) { // Fetch suggestions if searchTerm has at least 2 characters
        fetchSuggestions(searchTerm);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce
    return () => clearTimeout(handler);
  }, [searchTerm, token, partnerName]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchSuggestions = async (value: string) => {
    if (!token || !partnerName) return;

    try {
      // Construct the API URL for customer search suggestions
      const apiUrl = `${config.BACKEND_HOST}/Invoices/SearchCustomers?partnerName=${partnerName}&searchValue=${encodeURIComponent(value)}&sheetName=PurchaseCustomer`;
      const resp = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!resp.ok) {
        throw new Error(`Failed to fetch suggestions: ${resp.statusText}`);
      }

      const data: string[] = await resp.json(); // Assuming the API returns an array of strings
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (e) {
      console.error("Error fetching suggestions:", e);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({ title: "Error", description: "Enter customer name", variant: "destructive" });
      return;
    }
    if (!token || !partnerName) {
      toast({ title: "Error", description: "Authentication missing", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResults([]);
    setShowSuggestions(false); // Hide suggestions after search

    try {
      const resp = await fetch(
        `${config.BACKEND_HOST}/Invoices/purchasePaymentPending?partnerName=${partnerName}&customerName=${encodeURIComponent(searchTerm)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!resp.ok) throw new Error("Failed to fetch");
      const data: PurchaseBalance[] = await resp.json();
      setResults(data);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Unable to fetch pending invoices", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !paymentAmount || !paymentDate || !paymentMode) {
      toast({ title: "Error", description: "Fill all fields", variant: "destructive" });
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Error", description: `Amount must be greater than 0`, variant: "destructive" });
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    if (!token || !partnerName || !selectedSupplier) return;

    const payload = {
      CustomerName: selectedSupplier.customerName,
      Date: paymentDate,
      BankName: paymentMode, // This seems to be used as payment mode, adjust if your backend expects 'PaymentMode'
      Amount: paymentAmount
    };

    try {
      const resp = await fetch(
        `${config.BACKEND_HOST}/Invoices/PaymentEntry?partnerName=${partnerName}&paymentType=PurchasePayment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!resp.ok) throw new Error("Failed to record payment");
      toast({ title: "Success", description: `₹${parseFloat(paymentAmount).toLocaleString()} recorded!` });
      setSelectedSupplier(null);
      setPaymentAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMode('');
      setSearchTerm('');
      setResults([]);
      fetchRecentTransactions(); // Re-fetch recent transactions after a successful payment
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Payment record failed", variant: "destructive" });
    } finally {
      setShowConfirmModal(false);
    }
  };

  // Helper function to format date
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

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    handleSearch(); // Automatically search when a suggestion is selected
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Record Purchase Payment</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Customer</CardTitle>
            <CardDescription>Find pending purchase invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-4 items-center relative"> {/* Added relative for positioning suggestions */}
              <Input
                placeholder="Customer name"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Only show suggestions if there's input
                  if (e.target.value.length > 0) {
                    setShowSuggestions(true);
                  } else {
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (searchTerm.length > 0) { // Show suggestions on focus if there's a search term
                    setShowSuggestions(true);
                  }
                }}
                className="flex-grow"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <><Loader className="h-4 w-4 animate-spin mr-2" />Loading</> : <><Search className="h-4 w-4 mr-2" />Search</>}
              </Button>

              {showSuggestions && suggestions.length > 0 && (
                <div ref={suggestionBoxRef} className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card className="mt-6">
            <CardHeader><CardTitle>Pending Invoices</CardTitle></CardHeader>
            <CardContent>
              <table className="min-w-full border text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-2">Customer</th>
                    <th className="border px-4 py-2">Date</th>
                    <th className="border px-4 py-2">Invoice</th>
                    <th className="border px-4 py-2">Total</th>
                    <th className="border px-4 py-2">Balance</th>
                    <th className="border px-4 py-2">Status</th>
                    <th className="border px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.invoiceNumber} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{r.customerName}</td>
                      <td className="border px-4 py-2">{r.date || '-'}</td>
                      <td className="border px-4 py-2">{r.invoiceNumber}</td>
                      <td className="border px-4 py-2">₹{r.grandTotal.toLocaleString()}</td>
                      <td className="border px-4 py-2 text-red-600">₹{r.balanceAmount.toLocaleString()}</td>
                      <td className="border px-4 py-2">{r.paymentStatus}</td>
                      <td className="border px-4 py-2">
                        <Button variant="secondary" onClick={() => setSelectedSupplier(r)}>
                          Record
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {selectedSupplier && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Record Payment</CardTitle>
              <CardDescription>
                For <strong>{selectedSupplier.customerName}</strong> — Invoice: <strong>{selectedSupplier.invoiceNumber}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentAmount">Payment Amount *</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      min="1"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-600">
                      Available: ₹{selectedSupplier.balanceAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Payment Date *</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMode">Payment Mode *</Label>
                    <Select value={paymentMode} onValueChange={setPaymentMode} required>
                      <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button variant="outline" onClick={() => setSelectedSupplier(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">Record Payment</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Confirm Modal */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Name:</strong> {selectedSupplier?.customerName}</p>
              <p><strong>Amount:</strong> ₹{parseFloat(paymentAmount || '0').toLocaleString()}</p>
            </div>
            <DialogFooter className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
              <Button onClick={confirmSubmit}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
              <div className="overflow-x-auto"> {/* Added for horizontal scrolling on small screens */}
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
                      <tr key={index} className="hover:bg-gray-50"> {/* Using index as key, consider a unique ID if available */}
                        <td className="border px-4 py-2">{transaction.customerName}</td>
                        {/* Format the date here */}
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

export default RecordPurchasePayment;