import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, XCircle, Search } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/pages/AuthContext";
import config from '../config';
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
  const { token, partnerName } = useAuth(); // ✅ Auth context

  const [searchInvoice, setSearchInvoice] = useState('');
  const [invoiceSuggestions, setInvoiceSuggestions] = useState<string[]>([]);
  const [invoiceFound, setInvoiceFound] = useState(false);
  const [invoiceData, setInvoiceData] = useState<BillHistoryEntry | null>(null);

  // ✅ Auto-fill suggestions
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchInvoice.length > 2) {
        fetchSuggestions(searchInvoice);
      } else {
        setInvoiceSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchInvoice]);

  const fetchSuggestions = async (searchValue: string) => {
    if (!token || !partnerName) return;

    try {
      const response = await fetch(
        `${config.BACKEND_HOST}/Invoices/SearchCustomers?partnerName=${encodeURIComponent(partnerName)}&searchValue=${encodeURIComponent(searchValue)}&sheetName=BillHistory`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error("Failed to fetch suggestions");

      const data = await response.json();
      const invoiceNumbers = data.map((item: any) => item.invoiceNumber);
      setInvoiceSuggestions(invoiceNumbers);
    } catch (error) {
      console.error("Autocomplete error:", error);
    }
  };

  // ✅ Fetch invoice details
  const handleSearch = async () => {
    if (!searchInvoice.trim()) {
      toast({
        title: "Error",
        description: "Please enter an invoice number to search",
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
      const response = await fetch(
        `${config.BACKEND_HOST}/Invoices/getCancelInvoiceDetails?invoiceNumber=${encodeURIComponent(searchInvoice)}&partnerName=${encodeURIComponent(partnerName)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error("Invoice not found");

      const data = await response.json();
      setInvoiceData({ ...data, status: 'active' }); // fallback
      setInvoiceFound(true);

      toast({
        title: "Success",
        description: `Invoice "${searchInvoice}" found and loaded`,
      });
    } catch (error: any) {
      console.error(error);
      setInvoiceFound(false);
      setInvoiceData(null);

      toast({
        title: "Error",
        description: error.message || "Failed to load invoice details",
        variant: "destructive"
      });
    }
  };

  // ✅ Cancel invoice via backend
  const handleCancelInvoice = async () => {
    if (!invoiceData || !token || !partnerName) return;

    try {
      const response = await fetch(
        `${config.BACKEND_HOST}/Invoices/cancel?invoiceNumber=${encodeURIComponent(invoiceData.invoiceNumber!)}&partnerName=${encodeURIComponent(partnerName)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error("Failed to cancel invoice");

      const result = await response.text();

      setInvoiceData({ ...invoiceData, status: 'cancelled' });

      toast({
        title: "Success",
        description: `Invoice "${invoiceData.invoiceNumber}" has been cancelled successfully!`,
      });

      console.log('Backend cancel result:', result);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel invoice",
        variant: "destructive"
      });
    }
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
            <div className="relative">
              <Input
                placeholder="Enter invoice number"
                value={searchInvoice}
                onChange={(e) => setSearchInvoice(e.target.value)}
                onBlur={() => setTimeout(() => setInvoiceSuggestions([]), 200)}
              />
              {invoiceSuggestions.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-200 mt-1 w-full shadow-lg rounded-md max-h-48 overflow-y-auto">
                  {invoiceSuggestions.map((inv, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        setSearchInvoice(inv);
                        setInvoiceSuggestions([]);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {inv}
                    </li>
                  ))}
                </ul>
              )}
              <Button onClick={handleSearch} className="mt-3 w-full">
                Search Invoice
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details & Cancel */}
        {invoiceFound && invoiceData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Cancel Invoice #{invoiceData.invoiceNumber}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p><strong>Customer:</strong> {invoiceData.customerName}</p>
              <p><strong>GST Number:</strong> {invoiceData.gstNumber || '—'}</p>
              <p><strong>Date:</strong> {invoiceData.date || '—'}</p>
              <p><strong>Quantity:</strong> {invoiceData.qty}</p>
              <p><strong>Total Before GST:</strong> ₹{invoiceData.totalBeforeGST?.toFixed(2)}</p>
              <p><strong>CGST:</strong> ₹{invoiceData.cgst?.toFixed(2) || '—'}</p>
              <p><strong>SGST:</strong> ₹{invoiceData.sgst?.toFixed(2) || '—'}</p>
              <p><strong>IGST:</strong> ₹{invoiceData.igst?.toFixed(2) || '—'}</p>
              <p><strong>Grand Total:</strong> <span className="font-semibold text-lg">₹{invoiceData.grandTotal?.toFixed(2)}</span></p>

              <div className="flex items-center gap-4 mt-4">
              <Badge variant={(invoiceData.customerName === 'Cancelled' || invoiceData.status !== 'active') ? "secondary" : "destructive"}>
                {(invoiceData.customerName === 'Cancelled') ? 'INACTIVE' : invoiceData.status.toUpperCase()}
              </Badge>

                {invoiceData.status === 'active' && (
                  <Button variant="destructive" onClick={handleCancelInvoice}>
                    Confirm Cancel Invoice
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CancelInvoice;