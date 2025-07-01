
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, FileText } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface ProductItem {
  sNo: number;
  productName: string;
  hsn: string;
  qty: number;
  price: number;
}

const GenerateInvoice = () => {
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    name: '',
    currentDate: new Date().toISOString().split('T')[0],
    noOfBales: 0,
    transport: '',
  });
  
  const [items, setItems] = useState<ProductItem[]>([
    { sNo: 1, productName: '', hsn: '', qty: 1, price: 0 }
  ]);

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
      // Renumber the items
      const renumberedItems = newItems.map((item, i) => ({ ...item, sNo: i + 1 }));
      setItems(renumberedItems);
    }
  };

  const updateItem = (index: number, field: keyof ProductItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.qty * item.price), 0);
  };

  const handleGenerateInvoice = () => {
    if (!invoiceData.name || items.some(item => !item.productName)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Simulate invoice generation
    toast({
      title: "Success",
      description: `Invoice ${invoiceData.invoiceNumber} generated successfully!`,
    });
    
    console.log('Invoice Data:', { ...invoiceData, items });
  };

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
            {/* Basic Invoice Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="currentDate">Date</Label>
                <Input
                  id="currentDate"
                  type="date"
                  value={invoiceData.currentDate}
                  onChange={(e) => setInvoiceData({...invoiceData, currentDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={invoiceData.name}
                  onChange={(e) => setInvoiceData({...invoiceData, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="transport">Transport</Label>
                <Input
                  id="transport"
                  placeholder="Transport details"
                  value={invoiceData.transport}
                  onChange={(e) => setInvoiceData({...invoiceData, transport: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="noOfBales">Number of Bales</Label>
                <Input
                  id="noOfBales"
                  type="number"
                  value={invoiceData.noOfBales}
                  onChange={(e) => setInvoiceData({...invoiceData, noOfBales: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            {/* Items Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Invoice Items</h3>
                <Button onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div>
                        <Label>S.No</Label>
                        <Input value={item.sNo} disabled />
                      </div>
                      <div>
                        <Label>Product Name *</Label>
                        <Input
                          placeholder="Product name"
                          value={item.productName}
                          onChange={(e) => updateItem(index, 'productName', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>HSN Code</Label>
                        <Input
                          placeholder="HSN code"
                          value={item.hsn}
                          onChange={(e) => updateItem(index, 'hsn', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Price (₹)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-right">
                      <span className="font-semibold">
                        Total: ₹{(item.qty * item.price).toFixed(2)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-right">
                  <div className="text-xl font-bold">
                    Grand Total: ₹{calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleGenerateInvoice} className="flex-1">
                Generate Invoice
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenerateInvoice;
