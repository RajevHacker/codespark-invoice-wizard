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
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
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
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

    try {
      const resp = await fetch(
        `https://invoicegenerator-bktt.onrender.com/Invoices/purchasePaymentPending?partnerName=${partnerName}&customerName=${encodeURIComponent(searchTerm)}`,
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
      BankName: paymentMode,
      Amount: paymentAmount
    };

    try {
      const resp = await fetch(
        `https://invoicegenerator-bktt.onrender.com/Invoices/PaymentEntry?partnerName=${partnerName}&paymentType=PurchasePayment`,
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
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Payment record failed", variant: "destructive" });
    } finally {
      setShowConfirmModal(false);
    }
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
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-4 items-center">
              <Input
                placeholder="Customer name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <><Loader className="h-4 w-4 animate-spin mr-2" />Loading</> : <><Search className="h-4 w-4 mr-2" />Search</>}
              </Button>
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
                    <th className="border px-4">Customer</th>
                    <th className="border px-4">Date</th>
                    <th className="border px-4">Invoice</th>
                    <th className="border px-4">Total</th>
                    <th className="border px-4">Balance</th>
                    <th className="border px-4">Status</th>
                    <th className="border px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.invoiceNumber} className="hover:bg-gray-50">
                      <td className="border px-4">{r.customerName}</td>
                      <td className="border px-4">{r.date || '-'}</td>
                      <td className="border px-4">{r.invoiceNumber}</td>
                      <td className="border px-4">₹{r.grandTotal.toLocaleString()}</td>
                      <td className="border px-4 text-red-600">₹{r.balanceAmount.toLocaleString()}</td>
                      <td className="border px-4">{r.paymentStatus}</td>
                      <td className="border px-4">
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
      </div>
    </div>
  );
};

export default RecordPurchasePayment;