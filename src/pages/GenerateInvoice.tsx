import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, FileText, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/pages/AuthContext";
import config from '../config';
interface ProductItem {
  sNo: number;
  productName: string;
  hsn: string;
  qty: number;
  price: number;
}

const GenerateInvoice = () => {
  const navigate = useNavigate();
  const { token, partnerName } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  // State for Customer Suggestions
  const [customerSuggestions, setCustomerSuggestions] = useState<string[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  
  // State for Product Suggestions
  const [productSuggestions, setProductSuggestions] = useState<string[]>([]);
  // activeProductInputIndex tracks which product input is currently focused,
  // allowing suggestions to appear only for that specific input.
  const [activeProductInputIndex, setActiveProductInputIndex] = useState<number | null>(null);
  // New state to store the position and dimensions of the active product input
  const [suggestionBoxPosition, setSuggestionBoxPosition] = useState<{ top: number; left: number; width: number } | null>(null);


  // Refs for managing focus and click-outside for suggestion lists
  const customerInputRef = useRef<HTMLDivElement>(null);
  // Using a Map for refs is robust for dynamic lists where items can be added/removed,
  // ensuring each input has a unique, retrievable reference.
  const productInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());


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
    console.log('--- Auth Context State (on mount) ---');
    console.log('  Token:', token ? 'Present' : 'Missing');
    console.log('  Partner Name:', partnerName ? partnerName : 'Missing');
  }, [token, partnerName]);

  // --- Customer Suggestions Logic ---
  useEffect(() => {
    const fetchCustomerSuggestions = async () => {
      const trimmedName = invoiceData.name.trim();
      if (trimmedName.length < 2 || !token || !partnerName) {
        setCustomerSuggestions([]);
        setShowCustomerSuggestions(false);
        return;
      }
      try {
        const url = `${config.BACKEND_HOST}/Invoices/SearchCustomers?partnerName=${partnerName}&searchValue=${encodeURIComponent(trimmedName)}&sheetName=CustomerDetails`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error: Failed to fetch customer suggestions:', response.status, errorText);
          toast({ title: "Suggestion Error", description: `Could not fetch customer suggestions: ${response.statusText}`, variant: "destructive" });
          setCustomerSuggestions([]);
          setShowCustomerSuggestions(false);
          return;
        }
        const suggestions: string[] = await response.json();
        setCustomerSuggestions(suggestions);
        setShowCustomerSuggestions(suggestions.length > 0);
      } catch (error) {
        console.error("Fetch Error: Error fetching customer suggestions:", error);
        toast({ title: "Network Error", description: `Failed to connect to customer suggestion service.`, variant: "destructive" });
        setCustomerSuggestions([]);
        setShowCustomerSuggestions(false);
      }
    };
    const handler = setTimeout(() => {
      fetchCustomerSuggestions();
    }, 300);
    return () => clearTimeout(handler);
  }, [invoiceData.name, partnerName, token]);

  const handleCustomerSuggestionClick = (name: string) => {
    setInvoiceData((prev) => ({ ...prev, name }));
    setShowCustomerSuggestions(false);
    // Re-focus the customer input after selection
    setTimeout(() => { customerInputRef.current?.querySelector('input')?.focus(); }, 0);
  };

  // Effect to handle clicking outside the customer input/suggestions to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerInputRef.current && !customerInputRef.current.contains(event.target as Node)) {
        setShowCustomerSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Product Suggestions Logic ---
  useEffect(() => {
    console.log('--- Product Suggestions useEffect triggered ---');
    console.log('  Current activeProductInputIndex:', activeProductInputIndex);

    const fetchProductSuggestions = async () => {
      console.log('--> fetchProductSuggestions function started.');
      
      // If no product input is active, or the product name is too short, or auth details are missing,
      // clear suggestions and return early.
      if (activeProductInputIndex === null) {
        console.log('    CONDITION NOT MET: No active product input index. Returning.');
        setProductSuggestions([]);
        return; 
      }

      const currentProductItem = items[activeProductInputIndex];
      const trimmedProductName = currentProductItem?.productName.trim() || '';
      console.log(`    Processing for index ${activeProductInputIndex}. Product Name: "${trimmedProductName}", Length: ${trimmedProductName.length}`);

      if (trimmedProductName.length < 2) {
        console.log('    --> CONDITION MET: Product name too short (< 2 chars). Clearing product suggestions.');
        setProductSuggestions([]);
        return;
      }

      if (!token || !partnerName) {
        console.log('    --> CONDITION MET: Auth token or partner name missing. Cannot fetch product suggestions.');
        setProductSuggestions([]);
        return;
      }

      console.log('    --> All product conditions passed. Preparing to make Product API call.');
      try {
        // Use sheetName=Products for product suggestions
        const url = `${config.BACKEND_HOST}/Invoices/SearchCustomers?partnerName=${partnerName}&searchValue=${encodeURIComponent(trimmedProductName)}&sheetName=Products`;
        console.log('    Product API Request URL:', url);
        console.log('    Product API Request Method: GET');

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('    <-- Product Fetch response received.');
        console.log('    Product Response status:', response.status);
        console.log('    Product Response ok:', response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error: Failed to fetch product suggestions:', response.status, errorText);
          toast({
            title: "Product Suggestion Error",
            description: `Could not fetch product suggestions: ${response.statusText}. Details: ${errorText.substring(0, 100)}`,
            variant: "destructive"
          });
          setProductSuggestions([]);
          return;
        }

        const suggestions: string[] = await response.json();
        console.log('    Received product suggestions:', suggestions);
        setProductSuggestions(suggestions);
      } catch (error) {
        console.error("    <-- Fetch Error: Error fetching product suggestions (caught):", error);
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.error("    Likely cause: CORS issue or actual network unavailability (e.g., backend not running).");
        } else {
            console.error("    Possible cause: Malformed JSON response or other fetch-related issue.");
        }
        toast({
          title: "Network Error",
          description: `Failed to connect to product suggestion service. Check browser console.`,
          variant: "destructive"
        });
        setProductSuggestions([]);
      }
    };

    // Debounce the API call for product suggestions
    // Only fetch if an input is active and the product name has at least 2 characters
    if (activeProductInputIndex !== null && items[activeProductInputIndex]?.productName.trim().length >= 2) {
        console.log('  Setting up debounce timeout for product suggestions...');
        const handler = setTimeout(() => {
          console.log('  --> Product Debounce finished. Calling fetchProductSuggestions.');
          fetchProductSuggestions();
        }, 300);

        return () => {
          console.log('  <-- Cleaning up previous debounce timeout for product suggestions.');
          clearTimeout(handler);
        };
    } else {
        // If conditions are not met, clear suggestions immediately
        console.log('  Product suggestions conditions not met (activeInputIndex is null or name too short). Clearing suggestions.');
        setProductSuggestions([]);
    }
  }, [items, activeProductInputIndex, partnerName, token]); // `items` as a whole array is a dependency for product name changes

  // Handle clicking a product suggestion
  const handleProductSuggestionClick = (suggestion: string) => {
    console.log('Product suggestion clicked:', suggestion, 'for index:', activeProductInputIndex);
    if (activeProductInputIndex !== null) {
      updateItem(activeProductInputIndex, 'productName', suggestion);
      setProductSuggestions([]); // Clear suggestions after selection
      setActiveProductInputIndex(null); // Deactivate this input after selection
      setSuggestionBoxPosition(null); // Hide the suggestion box
      // Re-focus the input after setting the value
      setTimeout(() => {
        productInputRefs.current.get(activeProductInputIndex)?.focus();
      }, 0);
    }
  };

  // Focus handler for product name inputs
  const handleProductInputFocus = (event: React.FocusEvent<HTMLInputElement>, index: number) => {
    console.log(`Product input ${index} focused. Setting activeProductInputIndex to ${index}.`);
    setActiveProductInputIndex(index); // Set the active index

    // Capture the position and width of the focused input to position the suggestion box
    const rect = event.currentTarget.getBoundingClientRect();
    setSuggestionBoxPosition({
      top: rect.top + window.scrollY, // Use window.scrollY for absolute positioning
      left: rect.left + window.scrollX, // Use window.scrollX for absolute positioning
      width: rect.width,
    });
  };

  // Blur handler for product name inputs
  const handleProductInputBlur = (event: React.FocusEvent, index: number) => {
    console.log(`Product input ${index} blurred.`);
    
    // Check if the focus moved to an element that is part of the suggestion list
    // This is crucial to prevent suggestions from disappearing when a user clicks on a suggestion.
    const relatedTarget = event.relatedTarget as HTMLElement;
    // We can't use nextElementSibling reliably here since the suggestion list is now outside the table.
    // Instead, we check if the relatedTarget is within the suggestion list itself.
    const suggestionListElement = document.getElementById('product-suggestions-list'); // Give the ul an ID

    // Use a timeout to allow the click on a suggestion to register before the blur logic.
    // A click on a suggestion will trigger the input's blur event first.
    setTimeout(() => {
      console.log(`  Blur timeout for index ${index} triggered.`);
      if (suggestionListElement && relatedTarget && suggestionListElement.contains(relatedTarget)) {
          console.log(`  Blur from input ${index} due to click on suggestion. Retaining active and suggestions.`);
          // If we clicked a suggestion, the click handler will handle updating the value and clearing suggestions.
          return; 
      }

      // If focus moved elsewhere (not a suggestion), hide suggestions and deactivate
      console.log(`  Blur from input ${index} not on suggestion. Hiding suggestions, deactivating index.`);
      setProductSuggestions([]); // Clear suggestions
      setActiveProductInputIndex(null); // Deactivate this input
      setSuggestionBoxPosition(null); // Hide the suggestion box
    }, 100); // Small delay to allow click event to propagate
  };

  const fetchInvoiceNumber = async () => {
    try {
      const response = await fetch(`${config.BACKEND_HOST}/Invoices/GetInvoiceNumber?partnerName=${partnerName}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
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
      return invoiceNumber;
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
      console.error("Fetch Error: Error in fetchInvoiceNumber:", error);
      return '';
    }
  };

  useEffect(() => {
    const loadInvoiceNumber = async () => {
      if (token && partnerName) {
        const invNum = await fetchInvoiceNumber();
        if (invNum) {
          setInvoiceData(prev => ({ ...prev, invoiceNumber: invNum }));
        }
      }
    };
    loadInvoiceNumber();
  }, [token, partnerName]);

  const addItem = () => {
    setItems(currentItems => {
      const newItems = [...currentItems, {
        sNo: currentItems.length + 1,
        productName: '',
        hsn: '',
        qty: 1,
        price: 0
      }];
      return newItems;
    });
    // After adding an item, you might want to focus the new product name input.
    // This will implicitly trigger the focus handler and potentially suggestions.
    // We need to wait for React to render the new input element before trying to focus it.
    setTimeout(() => {
      const newIndex = items.length; // The index of the newly added item
      productInputRefs.current.get(newIndex)?.focus();
    }, 0);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(currentItems => {
        const newItems = currentItems.filter((_, i) => i !== index);
        const renumberedItems = newItems.map((item, i) => ({ ...item, sNo: i + 1 }));
        return renumberedItems;
      });
      // Remove the corresponding ref from the Map
      productInputRefs.current.delete(index);
      // Adjust remaining indices in the map if needed (important for re-using refs for re-indexed items)
      const newRefs = new Map<number, HTMLInputElement>();
      productInputRefs.current.forEach((value, key) => {
          if (key < index) {
              newRefs.set(key, value);
          } else if (key > index) {
              newRefs.set(key - 1, value); // Shift index down
          }
      });
      productInputRefs.current = newRefs;

      // Clear product suggestions and deactivate if the removed item was active
      if (activeProductInputIndex === index) {
          setProductSuggestions([]);
          setActiveProductInputIndex(null);
          setSuggestionBoxPosition(null); // Hide the suggestion box
      } else if (activeProductInputIndex !== null && activeProductInputIndex > index) {
          // Adjust active index if an earlier item was removed
          setActiveProductInputIndex(prev => (prev !== null ? prev - 1 : null));
      }
    } else {
      // If only one item remains, reset its fields instead of removing it entirely
      setItems([{ sNo: 1, productName: '', hsn: '', qty: 1, price: 0 }]);
      productInputRefs.current.clear(); // Clear all product refs if the list is reset
      setProductSuggestions([]);
      setActiveProductInputIndex(null);
      setSuggestionBoxPosition(null); // Hide the suggestion box
    }
  };

  const updateItem = (index: number, field: keyof ProductItem, value: string | number) => {
    setItems(currentItems => {
      const newItems = [...currentItems];
      if (field === 'qty' || field === 'price') {
        value = Number(value);
        if (isNaN(value)) {
          value = 0; 
        }
      }
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.qty * item.price), 0);
  };

  const calculateGST = (subtotal: number) => {
    return subtotal * 0.05;
  };

  const handleGenerateInvoice = async () => {
    if (!invoiceData.name.trim()) {
      toast({ title: "Validation Error", description: "Customer Name is required.", variant: "destructive" });
      return;
    }
    if (items.some(item => !item.productName.trim())) {
      toast({ title: "Validation Error", description: "All product names are required.", variant: "destructive" });
      return;
    }
    if (items.some(item => item.qty <= 0 || item.price < 0)) {
      toast({ title: "Validation Error", description: "Quantity must be greater than 0 and price cannot be negative.", variant: "destructive" });
      return;
    }

    try {
      setIsGenerating(true);
      const payload = { ...invoiceData, items };
      const response = await fetch(`${config.BACKEND_HOST}/Invoices/InvoiceGenerator?partnerName=${partnerName}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error: Failed to generate invoice:', response.status, errorText);
        throw new Error(`Failed to generate invoice: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      if (result.fileUrl) {
        window.open(result.fileUrl, '_blank');
      }

      toast({ title: `Invoice ${result.invoiceNumber || 'Generated'}`, description: result.fileUrl ? `Invoice PDF opened in new tab.` : `Invoice data processed.`, duration: 7000 });

      const nextInvNum = await fetchInvoiceNumber();
      setInvoiceData({
        invoiceNumber: nextInvNum || '',
        name: '',
        CurrentDate: new Date().toISOString().split('T')[0],
        noOfBales: 0,
        transport: '',
      });
      setItems([{ sNo: 1, productName: '', hsn: '', qty: 1, price: 0 }]);

    } catch (error) {
      toast({ title: "Error Generating Invoice", description: (error as Error).message, variant: "destructive" });
      console.error("Generate Invoice Error:", error);
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
                <div className="relative" ref={customerInputRef}>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={invoiceData.name}
                    onChange={(e) => {
                      setInvoiceData({ ...invoiceData, name: e.target.value });
                      // Show suggestions if input length is >= 2, otherwise hide
                      if (e.target.value.trim().length >= 2) {
                          setShowCustomerSuggestions(true); 
                      } else {
                          setShowCustomerSuggestions(false);
                      }
                    }}
                    onFocus={() => {
                        // Show suggestions on focus if there's already enough text
                        if (invoiceData.name.trim().length >= 2) {
                            setShowCustomerSuggestions(true);
                        }
                    }}
                    onBlur={(e) => {
                        // Use a timeout to allow a click on a suggestion to register
                        setTimeout(() => {
                            if (!customerInputRef.current?.contains(e.relatedTarget as Node)) {
                                setShowCustomerSuggestions(false);
                            }
                        }, 100);
                    }}
                    autoComplete="off"
                  />
                  {showCustomerSuggestions && (customerSuggestions.length > 0 || invoiceData.name.trim().length >= 2) && (
                    <ul className="absolute z-50 bg-white border rounded-md max-h-48 overflow-y-auto w-full mt-1 shadow-lg">
                      {customerSuggestions.length > 0 ? (
                        customerSuggestions.map((name, idx) => (
                          <li
                            key={idx}
                            onMouseDown={(e) => e.preventDefault()} // Prevent input blur when clicking suggestion
                            onClick={() => handleCustomerSuggestionClick(name)}
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
                    {/* <th className="border border-gray-300 px-2 py-1 text-sm">HSN Code</th> */}
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
                      <td className="border border-gray-300 px-2 py-1 relative">
                        <Input
                          value={item.productName}
                          onChange={(e) => updateItem(index, 'productName', e.target.value)}
                          onFocus={(e) => handleProductInputFocus(e, index)} // Pass event to capture position
                          onBlur={(e) => handleProductInputBlur(e, index)} // Handle blur for product inputs
                          // Store ref in the Map using the item's index as key
                          ref={(el) => {
                            if (el) productInputRefs.current.set(index, el);
                            else productInputRefs.current.delete(index); // Clean up ref on unmount
                          }}
                          required
                          className="w-full"
                          autoComplete="off"
                        />
                        {/* The product suggestion list is now rendered globally, not here */}
                      </td>
                      {/* <td className="border border-gray-300 px-2 py-1">
                        <Input
                          value={item.hsn}
                          onChange={(e) => updateItem(index, 'hsn', e.target.value)}
                          className="w-full"
                        />
                      </td> */}
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
                          step="0.01" // Added step for two decimal places
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
            {/* UI Update: Move Add Product button to the right */}
            <div className="mt-3 flex justify-end"> {/* Added flex and justify-end */}
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

      {/* GLOBAL PRODUCT SUGGESTIONS LIST - RENDERED OUTSIDE THE TABLE */}
      {/* This list is positioned absolutely based on the active input's coordinates */}
      {suggestionBoxPosition && productSuggestions.length > 0 && activeProductInputIndex !== null && items[activeProductInputIndex]?.productName.trim().length >= 2 && (
        <ul
          id="product-suggestions-list" // Added ID for blur detection
          className="absolute z-[100] bg-white border rounded-md max-h-48 overflow-y-auto shadow-lg"
          style={{
            top: suggestionBoxPosition.top + suggestionBoxPosition.width/2 + 20, // Position below the input
            left: suggestionBoxPosition.left,
            width: suggestionBoxPosition.width,
          }}
        >
          {productSuggestions.map((suggestion, idx) => (
            <li
              key={idx}
              onMouseDown={(e) => e.preventDefault()} // Crucial: Prevents input blur when clicking suggestion
              onClick={() => handleProductSuggestionClick(suggestion)}
              className="cursor-pointer px-3 py-1 hover:bg-gray-100"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GenerateInvoice;
