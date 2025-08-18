import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader, Search, XCircle } from "lucide-react";
import { useAuth } from "@/pages/AuthContext";
import config from "../config";

interface SalesBalance {
  customerName: string;
  invoiceNumber: string;
  date: string | null;
  grandTotal: number | null;
  balanceAmount: number | null;
  paymentStatus: string | null;
}

const SalesBalanceList = () => {
  const auth = useAuth();
  const token = auth?.token || "";
  const partnerName = auth?.partnerName || "";

  const [customerName, setCustomerName] = useState("");
  const [balances, setBalances] = useState<SalesBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string>("");

  // 🔎 Suggestions state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch balances
  const fetchBalances = async (name?: string) => {
    if (!token || !partnerName) {
      setError("Authentication details missing. Please log in.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = `${config.BACKEND_HOST}/Invoices/getSalesBalanceList?partnerName=${encodeURIComponent(
        partnerName
      )}${name ? `&customerName=${encodeURIComponent(name)}` : ""}`;

      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rawText = await response.text();
      setRawResponse(rawText);

      let data: SalesBalance[] = [];
      try {
        data = JSON.parse(rawText);
      } catch {
        data = [];
      }

      setBalances(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load sales balances.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch suggestions for customer name
  const fetchCustomerSuggestions = async (searchValue: string) => {
    if (!token || !partnerName || searchValue.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    try {
      const apiUrl = `${config.BACKEND_HOST}/Invoices/SearchCustomers?partnerName=${encodeURIComponent(
        partnerName
      )}&searchValue=${encodeURIComponent(
        searchValue
      )}&sheetName=CustomerDetails`;

      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rawText = await response.text();

      let data: string[] = [];
      try {
        data = JSON.parse(rawText);
      } catch {
        data = [];
      }

      if (Array.isArray(data)) {
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Suggestion fetch failed:", err);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    fetchBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Date formatting helper
  const formatDate = (dateValue: string | null) => {
    if (!dateValue || dateValue.trim() === "") return "-";
    const parsedDate = new Date(dateValue);
    if (!isNaN(parsedDate.getTime())) {
      const day = parsedDate.getDate().toString().padStart(2, "0");
      const month = parsedDate.toLocaleString("en-US", { month: "short" });
      const year = parsedDate.getFullYear();
      return `${day}-${month}-${year}`;
    }
    const regex = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/;
    const match = dateValue.match(regex);
    if (match) {
      return `${match[1].padStart(2, "0")}-${match[2]}-${match[3]}`;
    }
    return dateValue;
  };

  if (!token || !partnerName) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card>
          <CardContent>
            <p className="text-red-500">
              Please log in to view sales balances.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Sales Balance List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Box with Suggestions */}
          <div className="relative mb-4">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-gray-500" />
              <Input
                type="text"
                placeholder="Enter customer name..."
                value={customerName}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomerName(value);
                  fetchCustomerSuggestions(value); // 🔎 Fetch suggestions on change
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onBlur={() => {
                  // delay hiding so click can register
                  setTimeout(() => setShowSuggestions(false), 150);
                }}
              />
              <button
                onClick={() => {
                  if (customerName.trim()) {
                    fetchBalances(customerName.trim());
                  } else {
                    fetchBalances();
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 w-full shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((s, idx) => (
                  <li
                    key={idx}
                    onClick={() => {
                      setCustomerName(s);
                      setShowSuggestions(false);
                      fetchBalances(s);
                    }}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <Loader className="h-6 w-6 animate-spin text-blue-500 mr-2" />
              <p>Loading...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-6 text-red-600">
              <XCircle className="h-6 w-6 mr-2" />
              {error}
            </div>
          ) : balances.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border">Customer Name</th>
                    <th className="px-4 py-2 border">Invoice No</th>
                    <th className="px-4 py-2 border">Invoice Date</th>
                    <th className="px-4 py-2 border">Total Amount</th>
                    <th className="px-4 py-2 border">Balance Amount</th>
                    <th className="px-4 py-2 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map((b, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">
                        {b.customerName || "-"}
                      </td>
                      <td className="px-4 py-2 border">
                        {b.invoiceNumber || "-"}
                      </td>
                      <td className="px-4 py-2 border">
                        {formatDate(b.date)}
                      </td>
                      <td className="px-4 py-2 border">
                        ₹{(b.grandTotal ?? 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 border text-red-600 font-semibold">
                        ₹{(b.balanceAmount ?? 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 border font-semibold">
                        {b.paymentStatus || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No records found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesBalanceList;