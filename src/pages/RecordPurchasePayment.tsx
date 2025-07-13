import { useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Loader } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/pages/AuthContext";

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
  const { token, partnerName } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<PurchaseBalance[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<PurchaseBalance | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm) {
      toast({
        title: "Error",
        description: "Please enter a customer name to search",
        variant: "destructive",
      });
      return;
    }

    if (!token || !partnerName) {
      toast({
        title: "Error",
        description: "Authentication is missing",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setResults([]);  // Clear previous results immediately
      const response = await fetch(
        `http://localhost:5062/Invoices/purchasePaymentPending?partnerName=${partnerName}&customerName=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch purchase balances");
      }

      const data: PurchaseBalance[] = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Unable to fetch purchase data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSupplier || !paymentAmount || !paymentDate || !paymentMode) {
      toast({
        title: "Error",
        description: "Please fill in all payment details",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > selectedSupplier.balanceAmount) {
      toast({
        title: "Error",
        description: `Payment must be between ₹1 and ₹${selectedSupplier.balanceAmount}`,
        variant: "destructive",
      });
      return;
    }

    const paymentData = {
      invoiceNumber: selectedSupplier.invoiceNumber,
      customerName: selectedSupplier.customerName,
      paymentAmount: amount,
      paymentDate,
      paymentMode,
    };

    console.log("Submitted Purchase Payment:", paymentData);

    toast({
      title: "Success",
      description: `Payment of ₹${amount} recorded successfully`,
    });

    setSelectedSupplier(null);
    setPaymentAmount('');
    setPaymentDate('');
    setPaymentMode('');
    setSearchTerm('');
    setResults([]);
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
            <CardDescription>Enter the customer name to see pending purchase invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Input
                placeholder="Enter customer name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Loading
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Pending Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="min-w-full border text-sm text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-4 py-2">Customer Name</th>
                      <th className="border px-4 py-2">Invoice Date</th>
                      <th className="border px-4 py-2">Invoice No.</th>
                      <th className="border px-4 py-2">Grand Total</th>
                      <th className="border px-4 py-2">Balance</th>
                      <th className="border px-4 py-2">Status</th>
                      <th className="border px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((supplier) => (
                      <tr key={supplier.invoiceNumber} className="hover:bg-gray-50">
                        <td className="border px-4 py-2">{supplier.customerName}</td>
                        <td className="border px-4 py-2">{supplier.date || '-'}</td>
                        <td className="border px-4 py-2">{supplier.invoiceNumber}</td>
                        <td className="border px-4 py-2">₹{supplier.grandTotal.toLocaleString()}</td>
                        <td className="border px-4 py-2 text-red-600">₹{supplier.balanceAmount.toLocaleString()}</td>
                        <td className="border px-4 py-2">{supplier.paymentStatus}</td>
                        <td className="border px-4 py-2">
                          <Button
                            variant="secondary"
                            onClick={() => setSelectedSupplier(supplier)}
                          >
                            Record
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedSupplier && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Record Payment</CardTitle>
              <CardDescription>
                For <strong>{selectedSupplier.customerName}</strong> - Invoice: <strong>{selectedSupplier.invoiceNumber}</strong>
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
                      min="0"
                      max={selectedSupplier.balanceAmount}
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter payment amount"
                      required
                    />
                    <p className="text-sm text-gray-600">
                      Available balance: ₹{selectedSupplier.balanceAmount.toLocaleString()}
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedSupplier(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Record Payment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RecordPurchasePayment;