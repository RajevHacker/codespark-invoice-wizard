import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Save, Search, Loader } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/pages/AuthContext";

const UpdateCustomer = () => {
  const navigate = useNavigate();
  const { token, partnerName } = useAuth();

  const [searchName, setSearchName] = useState('');
  const [customerFound, setCustomerFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    address: '',
    contactNumber: '',
    state: '',
    stateCode: '',
    gstNo: '',
    email: ''
  });

  // Guard if auth missing
  if (!partnerName || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 font-semibold">
          Authentication missing. Please log in again.
        </p>
      </div>
    );
  }

  const handleSearch = async () => {
    if (!searchName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a customer name to search",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://invoicegenerator-bktt.onrender.com/Invoices/getCustomerByName?customerName=${encodeURIComponent(searchName)}&partnerName=${partnerName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Customer not found");
      }

      const data = await response.json();
      setCustomerData(data);
      setCustomerFound(true);

      toast({
        title: "Success",
        description: `Customer "${searchName}" found and loaded`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Customer not found or server error",
        variant: "destructive"
      });
      setCustomerFound(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerData({ ...customerData, [field]: value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerData.name || !customerData.contactNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Name and Contact Number)",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://invoicegenerator-bktt.onrender.com/Invoices/updateCustomerDetail?partnerName=${partnerName}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(customerData)
        }
      );

      if (!response.ok) throw new Error("Failed to update customer");

      toast({
        title: "Success",
        description: `Customer "${customerData.name}" updated successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update customer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Update Customer</h1>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter customer name to search"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Searching...
                  </span>
                ) : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Update Form */}
        {customerFound && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Update Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Customer Name *</Label>
                    <Input
                      id="name"
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
                      pattern="[0-9]{10}"
                      title="Enter a valid 10-digit number"
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
                      value={customerData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="stateCode">State Code</Label>
                    <Input
                      id="stateCode"
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
                      value={customerData.gstNo}
                      onChange={(e) => handleInputChange('gstNo', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                      title="Enter a valid email address"
                      value={customerData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Updating..." : "Update Customer"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCustomerFound(false);
                      setSearchName('');
                      setCustomerData({
                        name: '',
                        address: '',
                        contactNumber: '',
                        state: '',
                        stateCode: '',
                        gstNo: '',
                        email: ''
                      });
                    }}
                  >
                    Reset
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

export default UpdateCustomer;