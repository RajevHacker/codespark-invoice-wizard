import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/pages/AuthContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import config from '../config';
const AddPurchaseEntry = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token, partnerName } = useAuth();

  const [customerName, setCustomerName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [amountBeforeTax, setAmountBeforeTax] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [gstRate, setGstRate] = useState('5');
  const [customGstRate, setCustomGstRate] = useState('');

  const [customerOptions, setCustomerOptions] = useState<{ name: string; gstNumber: string }[]>([]);
  const [purchaseDate, setPurchaseDate] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    return today;
  });
  const selectedRate = gstRate === 'other' ? parseFloat(customGstRate) || 0 : parseFloat(gstRate);
  const cgst = Math.round(amountBeforeTax * (selectedRate / 2) / 100);
  const sgst = Math.round(amountBeforeTax * (selectedRate / 2) / 100);
  const grandTotal = amountBeforeTax + cgst + sgst;

  const handleCustomerSelect = (option: { name: string; gstNumber: string }) => {
    setCustomerName(option.name);
    setGstNumber(option.gstNumber);
    setCustomerOptions([]);
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!customerName || customerName.length < 2) {
        setCustomerOptions([]);
        return;
      }

      try {
        const response = await fetch(
          `${config.BACKEND_HOST}/Invoices/getPurchaseCustomerGST?partnerName=${partnerName}&consumerName=${encodeURIComponent(customerName)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCustomerOptions(data || []);
        } else {
          setCustomerOptions([]);
        }
      } catch (err) {
        console.error("Fetch failed:", err);
        setCustomerOptions([]);
      }
    };

    const debounce = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [customerName, partnerName, token]);

  const handleUpsertCustomer = async () => {
    if (!customerName || !gstNumber) {
      toast({
        title: "Missing Fields",
        description: "Please enter both Customer Name and GST Number.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`${config.BACKEND_HOST}/Invoices/updatePurchaseCustomerGST?partnerName=${partnerName}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: customerName,
          gstNumber: gstNumber
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to update GST');
      }

      toast({
        title: "GST Updated",
        description: "GST number saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !invoiceNumber || !hsnCode) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!token || !partnerName) {
      toast({
        title: "Unauthorized",
        description: "Missing credentials. Please log in again.",
        variant: "destructive"
      });
      return;
    }

    const payload = {
      customerName,
      gstNumber,
      invoiceNumber,
      hsnCode,
      qty: quantity,
      totalBeforeGST: amountBeforeTax,
      cgst,
      sgst,
      grandTotal,
      date: purchaseDate
    };

    try {
      setIsLoading(true);

      const response = await fetch(
        `${config.BACKEND_HOST}/Invoices/AddPurchaseOrder?partnerName=${partnerName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Failed to save purchase entry');
      }

      toast({
        title: "Success",
        description: "Purchase entry saved successfully"
      });

      setCustomerName('');
      setGstNumber('');
      setInvoiceNumber('');
      setHsnCode('');
      setQuantity(0);
      setAmountBeforeTax(0);
      setGstRate('5');
      setCustomGstRate('');
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Add Purchase Entry</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
              <CardDescription>Search existing customers or add new ones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g., Krishna Tex"
                    required
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.preventDefault();
                    }}
                  />
                  {customerOptions.length > 0 && (
                    <div className="absolute z-10 bg-white border w-full rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                      {customerOptions.map((option, index) => (
                        <div
                          key={index}
                          onClick={() => handleCustomerSelect(option)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {option.name} – {option.gstNumber}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="gstNumber"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      placeholder="Enter GST if not autofilled"
                    />
                    <Button type="button" onClick={handleUpsertCustomer}>
                      Upsert
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
              <CardDescription>Fill invoice and tax related details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="e.g., INV-0001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hsnCode">HSN Code *</Label>
                  <Input
                    id="hsnCode"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    placeholder="e.g., 5208"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="purchaseDate">Date *</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="amountBeforeTax">Amount Before Tax (₹)</Label>
                  <Input
                    id="amountBeforeTax"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amountBeforeTax}
                    onChange={(e) => setAmountBeforeTax(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>GST Rate</Label>
                <RadioGroup value={gstRate} onValueChange={setGstRate} className="flex gap-4 flex-wrap">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2.5" id="gst2.5" />
                    <Label htmlFor="gst2.5">2.5%</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5" id="gst5" />
                    <Label htmlFor="gst5">5%</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="18" id="gst18" />
                    <Label htmlFor="gst18">18%</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="gstOther" />
                    <Label htmlFor="gstOther">Other</Label>
                  </div>
                  {gstRate === 'other' && (
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-24"
                      value={customGstRate}
                      onChange={(e) => setCustomGstRate(e.target.value)}
                      placeholder="GST %"
                    />
                  )}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                <div>
                  <Label>CGST ({(selectedRate / 2).toFixed(2)}%)</Label>
                  <div className="px-3 py-2 bg-gray-100 rounded-md">₹{cgst}</div>
                </div>
                <div>
                  <Label>SGST ({(selectedRate / 2).toFixed(2)}%)</Label>
                  <div className="px-3 py-2 bg-gray-100 rounded-md">₹{sgst}</div>
                </div>
                <div>
                  <Label>Grand Total</Label>
                  <div className="px-3 py-2 bg-green-100 font-semibold rounded-md">₹{grandTotal}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
              {isLoading ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPurchaseEntry;