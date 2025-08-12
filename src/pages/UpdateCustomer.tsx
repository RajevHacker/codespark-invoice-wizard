import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Save, Search, Loader } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/pages/AuthContext";
import config from '../config'; // Assuming config is correctly imported

const UpdateCustomer = () => {
  const navigate = useNavigate();
  const { token, partnerName } = useAuth();

  const [searchName, setSearchName] = useState('');
  const [customerFound, setCustomerFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]); // New state for suggestions
  const [customerData, setCustomerData] = useState({
    name: '',
    address: '',
    contactNumber: '',
    state: '',
    stateCode: '',
    gstNo: '',
    email: ''
  });

  const suggestionRef = useRef(null); // Ref for the suggestion list to handle outside clicks

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

  // Function to fetch customer suggestions
  const fetchSuggestions = useCallback(async (value) => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    setIsSearchingSuggestions(true);
    try {
      const response = await fetch(
        `${config.BACKEND_HOST}/Invoices/SearchCustomers?partnerName=${partnerName}&searchValue=${encodeURIComponent(value)}&sheetName=CustomerDetails`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsSearchingSuggestions(false);
    }
  }, [partnerName, token]);

  // Debounce the suggestion search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSuggestions(searchName);
    }, 300); // 300ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchName, fetchSuggestions]);

  // Handle click outside suggestions to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        `${config.BACKEND_HOST}/Invoices/getCustomerByName?customerName=${encodeURIComponent(searchName)}&partnerName=${partnerName}`,
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
      setSuggestions([]); // Clear suggestions after a successful search

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
      setCustomerData({ // Reset customer data if not found
        name: '',
        address: '',
        contactNumber: '',
        state: '',
        stateCode: '',
        gstNo: '',
        email: ''
      });
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
        `${config.BACKEND_HOST}/Invoices/updateCustomerDetail?partnerName=${partnerName}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(customerData)
        }
      );

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Failed to update customer");
      }

      toast({
        title: "Success",
        description: `Customer "${customerData.name}" updated successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to update customer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (name) => {
    setSearchName(name);
    setSuggestions([]); // Clear suggestions
    // Optionally, trigger search immediately after selecting a suggestion
    // handleSearch(); // This would call handleSearch with the new searchName
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
            <div className="relative flex gap-4">
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

              {/* Suggestions List */}
              {searchName.trim() && suggestions.length > 0 && (
                <ul ref={suggestionRef} className="absolute z-10 w-[calc(100%-100px)] bg-white border border-gray-200 rounded-md shadow-lg mt-12 max-h-60 overflow-y-auto">
                  {isSearchingSuggestions ? (
                    <li className="p-2 text-gray-500 flex items-center">
                      <Loader className="animate-spin h-4 w-4 mr-2" /> Loading suggestions...
                    </li>
                  ) : (
                    suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="p-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))
                  )}
                </ul>
              )}
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
                      setSuggestions([]); // Clear suggestions on reset
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
