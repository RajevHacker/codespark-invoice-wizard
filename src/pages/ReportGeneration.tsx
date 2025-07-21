import React, { useState } from "react";
import { Button } from "@/components/ui/button"; // Make sure this is correctly imported
import { useNavigate } from "react-router-dom";

const ReportTypeSelection = () => {
  const [reportType, setReportType] = useState<"sales" | "purchase">("sales");
  const navigate = useNavigate();

  const handleNext = () => {
    if (reportType === "sales") {
      navigate("/SalesReportGeneration");
    } else {
      navigate("/PurchaseReportGeneration");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4 text-center">Select Report Type</h2>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="reportType"
              value="sales"
              checked={reportType === "sales"}
              onChange={() => setReportType("sales")}
            />
            Sales Report
          </label>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="reportType"
              value="purchase"
              checked={reportType === "purchase"}
              onChange={() => setReportType("purchase")}
            />
            Purchase Report
          </label>
        </div>

        <div className="mt-6 text-center">
          <Button onClick={handleNext}>Next</Button>
        </div>
      </div>
    </div>
  );
};

export default ReportTypeSelection;