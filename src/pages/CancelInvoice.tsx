
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, XCircle, Search, AlertTriangle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface BillHistoryEntry {
  customerName: string;
  gstNumber?: string;
  invoiceNumber?: string;
  date?: string;
  totalBeforeGST?: number;
  qty?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  grandTotal?: number;
  status: 'active' | 'cancelled';
}

const CancelInvoice = () => {
  const navigate = useNavigate();
  const [searchInvoice, setSearchInvoice] = useState('');
  const [invoiceFound, setInvoiceFound] = useState(false);
  const [invoiceData, setInvoiceData] = useState<BillHistoryEntry | null>(null);

  const handleSearch = () => {
    if (!searchInvoice.trim()) {
      toast({
        title: "Error",
        description: "Please enter an invoice number to search",
        variant: "destructive"
      });
      return;
    }

    // Simulate finding invoice (in real app, this would be an API call)
    const mockInvoice: BillHistoryEntry = {
      customerName: 'ABC Industries',
      gstNumber: '27XXXXX1234X1Z5',
      invoiceNumber: searchInvoice,
      date: '2024-01-15',
      totalBeforeGST: 10000,
      qty: 5,
      cgst: 900,
      sgst: 900,
      igst: 0,
      grandTotal: 11800,
      status: 'active'
    };

    setInvoiceData(mockInvoice);
    setInvoiceFound(true);
    
    toast({
      title: "Success",
      description: `Invoice "${searchInvoice}" found and loaded`,
    });
  };

  const handleCancelInvoice = () => {
    if (!invoiceData) return;

    // Simulate cancelling invoice
    setInvoiceData({ ...invoiceData, status: 'cancelled' });
    
    toast({
      title: "Success",
      description: `Invoice "${invoiceData.invoiceNumber}" has been cancelled successfully!`,
    });

    console.log('Cancelled Invoice:', invoiceData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Cancel Invoice</h1>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Invoice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter invoice number to search"
                value={searchInvoice}
                onChange={(e) => setSearchInvoice(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch}>
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        {invoiceFound && invoiceData && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Invoice Details
                </CardTitle>
                <Badge 
                  variant={invoiceData.status === 'active' ? 'default' : 'destructive'}
                >
                  {invoiceData.status === 'active' ? 'Active' : 'Cancelled'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Number</Label>
                  <div className="font-semibold">{invoiceData.invoiceNumber}</div>
                </div>
                <div>
                  <Label>Date</Label>
                  <div className="font-semibold">{invoiceData.date}</div>
                </div>
                <div>
                  <Label>Customer Name</Label>
                  <div className="font-semibold">{invoiceData.customerName}</div>
                </div>
                <div>
                  <Label>GST Number</Label>
                  <div className="font-semibold">{invoiceData.gstNumber}</div>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <div className="font-semibold">{invoiceData.qty}</div>
                </div>
                <div>
                  <Label>Total Before GST</Label>
                  <div className="font-semibold">₹{invoiceData.totalBeforeGST?.toFixed(2)}</div>
                </div>
                <div>
                  <Label>CGST</Label>
                  <div className="font-semibold">₹{invoiceData.cgst?.toFixed(2)}</div>
                </div>
                <div>
                  <Label>SGST</Label>
                  <div className="font-semibold">₹{invoiceData.sgst?.toFixed(2)}</div>
                </div>
                {invoiceData.igst && invoiceData.igst > 0 && (
                  <div>
                    <Label>IGST</Label>
                    <div className="font-semibold">₹{invoiceData.igst.toFixed(2)}</div>
                  </div>
                )}
                <div>
                  <Label>Grand Total</Label>
                  <div className="font-semibold text-lg">₹{invoiceData.grandTotal?.toFixed(2)}</div>
                </div>
              </div>

              {invoiceData.status === 'active' && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Warning: This action cannot be undone. The invoice will be permanently cancelled.
                    </span>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button 
                      onClick={handleCancelInvoice}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Invoice
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/dashboard')}
                    >
                      Go Back
                    </Button>
                  </div>
                </div>
              )}

              {invoiceData.status === 'cancelled' && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm text-red-800">
                      This invoice has been cancelled and cannot be processed further.
                    </span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/dashboard')}
                    className="w-full"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CancelInvoice;
