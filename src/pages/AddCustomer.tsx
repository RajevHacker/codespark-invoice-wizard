
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Save } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

const AddCustomer = () => {
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState({
    name: '',
    address: '',
    contactNumber: '',
    state: '',
    stateCode: '',
    gstNo: '',
    email: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setCustomerData({ ...customerData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerData.name || !customerData.contactNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Name and Contact Number)",
        variant: "destructive"
      });
      return;
    }

    // Simulate saving customer
    console.log('Customer Data:', customerData);
    
    toast({
      title: "Success",
      description: `Customer "${customerData.name}" added successfully!`,
    });

    // Reset form
    setCustomerData({
      name: '',
      address: '',
      contactNumber: '',
      state: '',
      stateCode: '',
      gstNo: '',
      email: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Add New Customer</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Customer Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter customer name"
                    value={customerData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    placeholder="Enter contact number"
                    value={customerData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter complete address"
                  value={customerData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="Enter state"
                    value={customerData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="stateCode">State Code</Label>
                  <Input
                    id="stateCode"
                    placeholder="Enter state code"
                    value={customerData.stateCode}
                    onChange={(e) => handleInputChange('stateCode', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gstNo">GST Number</Label>
                  <Input
                    id="gstNo"
                    placeholder="Enter GST number"
                    value={customerData.gstNo}
                    onChange={(e) => handleInputChange('gstNo', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={customerData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Customer
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddCustomer;
