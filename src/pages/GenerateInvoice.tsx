import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, FileText, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/pages/AuthContext"; // Ensure this path is correct

interface ProductItem {
  sNo: number;
  productName: string;
  hsn: string;
  qty: number;
  price: number;
}

const GenerateInvoice = () => {
  const navigate = useNavigate();
  const { token, partnerName } = useAuth(); // Destructure token and partnerName
  const [isGenerating, setIsGenerating] = useState(false);
  const [customerSuggestions, setCustomerSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const inputRef = useRef<HTMLDivElement>(null);

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    name: '',
    CurrentDate: new Date().toISOString().split('T')[0],
    noOfBales: 0,
    transport: '',
  });

  const [items, setItems] = useState<ProductItem[]>([
    { sNo: 1, productName: '', hsn: '', qty: 1, price: 0 }
  ]);

  // Debug: Log initial token and partnerName from useAuth
  useEffect(() => {
    console.log('Auth Context State (on mount):');
    console.log('  Token:', token ? 'Present' : 'Missing');
    console.log('  Partner Name:', partnerName ? partnerName : 'Missing');
  }, [token, partnerName]); // Run once when token/partnerName are initially set

  // Fetch customer suggestions when invoiceData.name changes and length >= 2
  useEffect(() => {
    console.log('*** useEffect for suggestions triggered ***');
    console.log('  Current invoiceData.name:', invoiceData.name);
    console.log('  Current token (inside effect):', token ? 'Present' : 'Missing');
    console.log('  Current partnerName (inside effect):', partnerName ? partnerName : 'Missing');

    const fetchSuggestions = async () => {
      console.log('--> fetchSuggestions function started.');
      const trimmedName = invoiceData.name.trim();
      console.log('    trimmedName for search:', `"${trimmedName}"`, 'Length:', trimmedName.length);

      if (trimmedName.length < 2) {
        console.log('    --> CONDITION MET: Name too short for suggestions. Clearing suggestions.');
        setCustomerSuggestions([]);
        setShowSuggestions(false);
        return; // Exit if condition met
      }

      if (!token || !partnerName) {
        console.log('    --> CONDITION MET: Auth token or partner name missing. Cannot fetch suggestions.');
        setCustomerSuggestions([]);
        setShowSuggestions(false);
        return; // Exit if condition met
      }

      // If we reach here, conditions are met, proceed with fetch
      console.log('    --> All conditions passed. Preparing to make API call.');
      try {
        const url = `http://localhost:5062/Invoices/SearchCustomers?partnerName=${partnerName}&searchValue=${encodeURIComponent(trimmedName)}&sheetName=CustomerDetails`;
        console.log('    API Request URL:', url);
        console.log('    API Request Method: GET');
        console.log('    API Request Headers (Authorization): Bearer ...');

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          // body: '', // For GET requests, 'body' property is typically ignored and can be removed for clarity
        });

        console.log('    <-- Fetch response received.');
        console.log('    Response status:', response.status);
        console.log('    Response ok:', response.ok);
        
        // Log all response headers to debug CORS
        console.log('    Response Headers:');
        for (let pair of response.headers.entries()) {
          console.log(`      ${pair[0]}: ${pair[1]}`);
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('    API Error: Failed to fetch customer suggestions:', response.status, errorText);
          toast({
            title: "Suggestion Error",
            description: `Could not fetch customer suggestions: ${response.statusText}. Details: ${errorText.substring(0, 100)}`,
            variant: "destructive"
          });
          setCustomerSuggestions([]);
          setShowSuggestions(false);
          return;
        }

        const suggestions: string[] = await response.json();
        console.log('    Received suggestions:', suggestions);
        
        setCustomerSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } catch (error) {
        // This 'catch' block means the fetch *itself* failed (e.g., network down, CORS blocked response)
        console.error("    <-- Fetch Error: Error fetching customer suggestions (caught):", error);
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.error("    Likely cause: CORS issue or actual network unavailability (e.g., backend not running).");
        } else {
            console.error("    Possible cause: Malformed JSON response or other fetch-related issue.");
        }
        toast({
          title: "Network Error",
          description: `Failed to connect to suggestion service. Check browser console for network/CORS errors.`,
          variant: "destructive"
        });
        setCustomerSuggestions([]);
        setShowSuggestions(false);
      }
    };

    // Debounce: Prevents immediate calls on every keystroke
    console.log('  Setting up debounce timeout...');
    const handler = setTimeout(() => {
      console.log('  --> Debounce finished. Calling fetchSuggestions.');
      fetchSuggestions();
    }, 300);

    return () => {
      console.log('  <-- Cleaning up previous debounce timeout.');
      clearTimeout(handler); // Cleanup the timeout on re-render or unmount
    };
  }, [invoiceData.name, partnerName, token]); // Dependencies that trigger this useEffect

  // Handle clicking a suggestion from dropdown
  const handleSuggestionClick = (name: string) => {
    console.log('Suggestion clicked:', name);
    setInvoiceData((prev) => ({ ...prev, name }));
    setShowSuggestions(false); // Hide suggestions immediately
    // Re-focus the input after setting the name
    setTimeout(() => {
      inputRef.current?.querySelector('input')?.focus();
    }, 0); 
  };

  // Close suggestion dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        console.log('Clicked outside of input/suggestions, hiding suggestions.');
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchInvoiceNumber = async () => {
    console.log('Fetching invoice number...');
    try {
      const response = await fetch(`http://localhost:5062/Invoices/GetInvoiceNumber?partnerName=${partnerName}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error: Failed to fetch invoice number:', response.status, errorText);
        throw new Error(`Failed to fetch invoice number: ${response.statusText}`);
      }
  
      const rawText = await response.text();
      const invoiceNumber = rawText.replace(/"/g, ''); 
      
      if (!invoiceNumber || invoiceNumber.trim() === '') {
        console.warn("Received empty or invalid invoice number from API.");
        return '';
      }
      console.log('Fetched Invoice Number:', invoiceNumber);
      return invoiceNumber;
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive"
      });
      console.error("Fetch Error: Error in fetchInvoiceNumber:", error);
      return '';
    }
  };

  useEffect(() => {
    const loadInvoiceNumber = async () => {
      console.log('Loading initial invoice number...');
      if (token && partnerName) {
        const invNum = await fetchInvoiceNumber();
        if (invNum) {
          setInvoiceData(prev => ({ ...prev, invoiceNumber: invNum }));
        }
      } else {
        console.log('Skipping initial invoice number load: token or partnerName missing.');
      }
    };

    loadInvoiceNumber();
  }, [token, partnerName]); // Depend on token and partnerName for initial load

  const addItem = () => {
    setItems([...items, {
      sNo: items.length + 1,
      productName: '',
      hsn: '',
      qty: 1,
      price: 0
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      const renumberedItems = newItems.map((item, i) => ({ ...item, sNo: i + 1 }));
      setItems(renumberedItems);
    } else {
      // Clear the last item's fields instead of removing it entirely if only one exists
      setItems([{ sNo: 1, productName: '', hsn: '', qty: 1, price: 0 }]);
    }
  };

  const updateItem = (index: number, field: keyof ProductItem, value: string | number) => {
    const newItems = [...items];
    if (field === 'qty' || field === 'price') {
      value = Number(value);
      if (isNaN(value)) {
        value = 0; 
      }
    }
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.qty * item.price), 0);
  };

  const calculateGST = (subtotal: number) => {
    return subtotal * 0.05;
  };

  const handleGenerateInvoice = async () => {
    console.log('Attempting to generate invoice...');
    if (!invoiceData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Customer Name is required.",
        variant: "destructive"
      });
      console.log('Validation failed: Customer Name empty.');
      return;
    }
    if (items.some(item => !item.productName.trim())) {
      toast({
        title: "Validation Error",
        description: "All product names are required.",
        variant: "destructive"
      });
      console.log('Validation failed: Product name empty.');
      return;
    }
    if (items.some(item => item.qty <= 0 || item.price < 0)) {
      toast({
        title: "Validation Error",
        description: "Quantity must be greater than 0 and price cannot be negative.",
        variant: "destructive"
      });
      console.log('Validation failed: Quantity/Price invalid.');
      return;
    }

    try {
      setIsGenerating(true);

      const payload = {
        ...invoiceData,
        items,
      };
      console.log('Invoice payload:', payload);
      
      const response = await fetch(`http://localhost:5062/Invoices/InvoiceGenerator?partnerName=${partnerName}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error: Failed to generate invoice:', response.status, errorText);
        throw new Error(`Failed to generate invoice: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Invoice generation result:', result);

      if (result.fileUrl) {
        window.open(result.fileUrl, '_blank');
      }

      toast({
        title: `Invoice ${result.invoiceNumber || 'Generated'}`,
        description: result.fileUrl ? `Invoice PDF opened in new tab.` : `Invoice data processed.`,
        duration: 7000,
      });

      const nextInvNum = await fetchInvoiceNumber(); // Fetch new invoice number
      console.log('Next Invoice Number:', nextInvNum);

      setInvoiceData({
        invoiceNumber: nextInvNum || '',
        name: '',
        CurrentDate: new Date().toISOString().split('T')[0],
        noOfBales: 0,
        transport: '',
      });

      setItems([{ sNo: 1, productName: '', hsn: '', qty: 1, price: 0 }]);

    } catch (error) {
      toast({
        title: "Error Generating Invoice",
        description: (error as Error).message,
        variant: "destructive"
      });
      console.error("Generate Invoice Error (caught):", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const subtotal = calculateSubtotal();
  const gst = calculateGST(subtotal);
  const grandTotal = subtotal + gst;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Generate Invoice</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  readOnly
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-[35px]"
                  onClick={async () => {
                    const inv = await fetchInvoiceNumber();
                    if (inv) {
                      setInvoiceData(prev => ({ ...prev, invoiceNumber: inv }));
                      toast({ title: "Invoice number refreshed" });
                    }
                  }}
                  title="Refresh Invoice Number"
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <Label htmlFor="currentDate">Date</Label>
                <Input
                  id="currentDate"
                  type="date"
                  value={invoiceData.CurrentDate}
                  onChange={(e) => setInvoiceData({ ...invoiceData, CurrentDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <div className="relative" ref={inputRef}>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={invoiceData.name}
                    onChange={(e) => {
                      console.log('Customer name input changed:', e.target.value); // Debug: Input change
                      setInvoiceData({ ...invoiceData, name: e.target.value });
                      if (e.target.value.trim().length >= 2) {
                          setShowSuggestions(true); 
                      } else {
                          setShowSuggestions(false);
                      }
                    }}
                    autoComplete="off"
                  />
                  {showSuggestions && (customerSuggestions.length > 0 || invoiceData.name.trim().length >= 2) && (
                    <ul className="absolute z-50 bg-white border rounded-md max-h-48 overflow-y-auto w-full mt-1 shadow-lg">
                      {customerSuggestions.length > 0 ? (
                        customerSuggestions.map((name, idx) => (
                          <li
                            key={idx}
                            onClick={() => handleSuggestionClick(name)}
                            className="cursor-pointer px-3 py-1 hover:bg-gray-100"
                          >
                            {name}
                          </li>
                        ))
                      ) : (
                        <li className="px-3 py-1 text-gray-500 italic">No matching customers found.</li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="noOfBales">No of Bales</Label>
                <Input
                  id="noOfBales"
                  type="number"
                  min={0}
                  value={invoiceData.noOfBales}
                  onChange={(e) => setInvoiceData({ ...invoiceData, noOfBales: +e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="transport">Transport Details</Label>
                <Input
                  id="transport"
                  value={invoiceData.transport}
                  onChange={(e) => setInvoiceData({ ...invoiceData, transport: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Products / Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-2 py-1 text-sm">SNo</th>
                    <th className="border border-gray-300 px-2 py-1 text-sm">Product Name *</th>
                    <th className="border border-gray-300 px-2 py-1 text-sm">HSN Code</th>
                    <th className="border border-gray-300 px-2 py-1 text-sm">QTY</th>
                    <th className="border border-gray-300 px-2 py-1 text-sm">Amount</th>
                    <th className="border border-gray-300 px-2 py-1 text-sm">Total</th>
                    <th className="border border-gray-300 px-2 py-1 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.sNo}>
                      <td className="border border-gray-300 text-center px-2 py-1 text-sm">{item.sNo}</td>
                      <td className="border border-gray-300 px-2 py-1">
                        <Input
                          value={item.productName}
                          onChange={(e) => updateItem(index, 'productName', e.target.value)}
                          required
                          className="w-full"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        <Input
                          value={item.hsn}
                          onChange={(e) => updateItem(index, 'hsn', e.target.value)}
                          className="w-full"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        <Input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={(e) => updateItem(index, 'qty', Number(e.target.value))}
                          className="w-full"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        <Input
                          type="number"
                          min={0}
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
                          className="w-full"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-right font-semibold text-sm">
                        {(item.qty * item.price).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeItem(index)}
                          aria-label={`Remove product ${item.sNo}`}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Product
              </Button>
            </div>

            <div className="mt-6 space-y-1 text-right">
              <div>Subtotal: ₹ {subtotal.toFixed(2)}</div>
              <div>GST (5%): ₹ {gst.toFixed(2)}</div>
              <div className="text-lg font-bold">Grand Total: ₹ {grandTotal.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate('/dashboard')}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerateInvoice}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Invoice'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GenerateInvoice;