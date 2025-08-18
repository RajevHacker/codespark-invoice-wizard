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
  console.log("👀 SalesBalanceList component mounted");

  const auth = useAuth();
  const token = auth?.token || "";
  const partnerName = auth?.partnerName || "";

  const [customerName, setCustomerName] = useState("");
  const [balances, setBalances] = useState<SalesBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string>("");

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

      console.log("📡 API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📩 Response Status:", response.status, response.statusText);

      const rawText = await response.text();
      console.log("📄 Raw Response Text:", rawText);

      setRawResponse(rawText); // ✅ Keep raw response for debugging

      let data: SalesBalance[] = [];
      try {
        data = JSON.parse(rawText);
        console.log("✅ Parsed JSON Response:", data);
      } catch (parseErr) {
        console.error("❌ JSON Parse Error:", parseErr);
        data = [];
      }

      setBalances(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("🔥 Fetch Error:", err);
      setError("Failed to load sales balances.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Robust date formatter that handles "31-Jul-2025" and ISO formats
  const formatDate = (dateValue: string | null) => {
    if (!dateValue || dateValue.trim() === "") return "-";
  
    const parsedDate = new Date(dateValue);
    if (!isNaN(parsedDate.getTime())) {
      const day = parsedDate.getDate().toString().padStart(2, "0");
      const month = parsedDate.toLocaleString("en-US", { month: "short" });
      const year = parsedDate.getFullYear();
      return `${day}-${month}-${year}`;
    }
  
    // If parsing fails, handle formats like "31-Jul-2025"
    const regex = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/;
    const match = dateValue.match(regex);
    if (match) {
      return `${match[1].padStart(2, "0")}-${match[2]}-${match[3]}`;
    }
  
    // fallback: return as-is
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
          {/* Search Box */}
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Enter customer name..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
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
            <>
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
                          {(b.paymentStatus ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Debug JSON Response */}
              {/* <div className="mt-6 p-4 bg-gray-100 border rounded">
                <h2 className="text-sm font-semibold mb-2">
                  📦 Raw JSON Response:
                </h2>
                <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                  {rawResponse || "No response yet"}
                </pre>
              </div> */}
            </>
          ) : (
            <p className="text-gray-500">No records found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesBalanceList;