
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface PurchaseBalance {
  poNumber: string;
  supplierName: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  poDate: string;
}

const RecordPurchasePayment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<PurchaseBalance | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMode, setPaymentMode] = useState('');

  // Mock data for purchase balances
  const mockPurchaseBalances: PurchaseBalance[] = [
    {
      poNumber: 'PO-001',
      supplierName: 'ABC Suppliers Ltd',
      totalAmount: 50000,
      paidAmount: 20000,
      balanceAmount: 30000,
      poDate: '2024-01-15'
    },
    {
      poNumber: 'PO-002',
      supplierName: 'XYZ Trading Co',
      totalAmount: 75000,
      paidAmount: 0,
      balanceAmount: 75000,
      poDate: '2024-01-20'
    },
    {
      poNumber: 'PO-003',
      supplierName: 'Global Merchants',
      totalAmount: 35000,
      paidAmount: 15000,
      balanceAmount: 20000,
      poDate: '2024-01-25'
    }
  ];

  const searchResults = mockPurchaseBalances.filter(balance =>
    balance.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    balance.poNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = () => {
    if (!searchTerm) {
      toast({
        title: "Error",
        description: "Please enter a supplier name or PO number to search",
        variant: "destructive",
      });
      return;
    }
    
    if (searchResults.length === 0) {
      toast({
        title: "No Results",
        description: "No purchase orders found for the search term",
        variant: "destructive",
      });
    }
  };

  const handleSupplierSelect = (supplier: PurchaseBalance) => {
    setSelectedSupplier(supplier);
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
        description: `Payment amount must be between ₹1 and ₹${selectedSupplier.balanceAmount}`,
        variant: "destructive",
      });
      return;
    }

    const paymentData = {
      poNumber: selectedSupplier.poNumber,
      supplierName: selectedSupplier.supplierName,
      paymentAmount: amount,
      paymentDate,
      paymentMode
    };

    console.log('Purchase Payment:', paymentData);
    
    toast({
      title: "Success",
      description: `Payment of ₹${amount} recorded successfully`,
    });

    // Reset form
    setSelectedSupplier(null);
    setPaymentAmount('');
    setPaymentDate('');
    setPaymentMode('');
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Record Purchase Payment</h1>
        </div>

        <div className="space-y-6">
          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle>Search Purchase Consumer</CardTitle>
              <CardDescription>Search by supplier name or PO number</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter supplier name or PO number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchTerm && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
              </CardHeader>
              <CardContent>
                {searchResults.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.map((supplier) => (
                      <div
                        key={supplier.poNumber}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedSupplier?.poNumber === supplier.poNumber
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleSupplierSelect(supplier)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{supplier.supplierName}</h3>
                            <p className="text-sm text-gray-600">PO: {supplier.poNumber}</p>
                            <p className="text-sm text-gray-600">Date: {supplier.poDate}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Total: ₹{supplier.totalAmount.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Paid: ₹{supplier.paidAmount.toLocaleString()}</div>
                            <div className="text-lg font-semibold text-red-600">
                              Balance: ₹{supplier.balanceAmount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No purchase orders found</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Form */}
          {selectedSupplier && (
            <Card>
              <CardHeader>
                <CardTitle>Record Payment</CardTitle>
                <CardDescription>
                  Recording payment for {selectedSupplier.supplierName} - PO: {selectedSupplier.poNumber}
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
                      <Label htmlFor="paymentMode">Mode of Payment *</Label>
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
    </div>
  );
};

export default RecordPurchasePayment;
