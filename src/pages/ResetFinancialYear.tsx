import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import config from "@/config";
import { useAuth } from "@/pages/AuthContext";

export default function ResetFinancialYear() {
  const [financialYear, setFinancialYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Fetch token and partnerName from AuthContext
  const { token, partnerName } = useAuth();

  const handleReset = async () => {
    if (!financialYear) {
      setMessage("⚠️ Please enter a financial year.");
      return;
    }

    if (!partnerName || !token) {
      setMessage("❌ Authentication error. Please login again.");
      return;
    }

    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const res = await fetch(
        `${config.BACKEND_HOST}/Invoices/resetFinancialYear?partnerName=${partnerName}&financialYear=${financialYear}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        setSuccess(true);
        setMessage("Financial year reset successfully!");
      } else {
        const err = await res.text();
        setMessage("❌ Failed: " + err);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Error occurred while resetting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">
            Reset Financial Year
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Enter the new financial year (e.g., <b>2025-26</b>) to reset.
          </p>

          {!success ? (
            <>
              <Input
                placeholder="e.g. 2025-26"
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="mb-4"
              />

              <Button
                onClick={handleReset}
                disabled={loading}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                {loading ? "Processing..." : "Reset"}
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle className="text-green-600 w-12 h-12" />
              <p className="text-green-700 font-medium">{message}</p>
            </div>
          )}

          {message && !success && (
            <p className="mt-4 text-center text-sm font-medium text-gray-700">
              {message}
            </p>
          )}

          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={() => navigate("/dashboard")}
          >
            ⬅ Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}