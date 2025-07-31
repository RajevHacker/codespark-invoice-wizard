import React, { useState } from "react";
// Assuming Button is a shadcn/ui component, it's typically imported like this
// If it's a custom path, ensure it's correct for your project structure.
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom"; // For navigating between routes

const ReportTypeSelection = () => {
  // State to manage the selected report type (sales or purchase)
  const [reportType, setReportType] = useState<"sales" | "purchase">("sales");
  // Hook to programmatically navigate to different routes
  const navigate = useNavigate();

  // Handler for the "Next" button click
  const handleNext = () => {
    // Navigate based on the selected report type
    if (reportType === "sales") {
      navigate("/SalesReportGeneration");
    } else {
      navigate("/PurchaseReportGeneration");
    }
  };

  // Handler for the "Back to Dashboard" button click
  const handleBackToDashboard = () => {
    // Navigate to the main dashboard route, typically "/"
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-100"> {/* Added a subtle background */}
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full border border-gray-200"> {/* Enhanced shadow and border */}
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Select Report Type</h2> {/* Larger, bolder title */}
        <div className="flex flex-col gap-4 mb-6"> {/* Increased gap for better spacing */}
          <label className="flex items-center p-3 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors duration-200">
            <input
              type="radio"
              name="reportType"
              value="sales"
              checked={reportType === "sales"}
              onChange={() => setReportType("sales")}
              className="form-radio h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500" // Styled radio button
            />
            <span className="ml-3 text-lg font-medium text-gray-700">Sales Report</span> {/* Larger text for labels */}
          </label>
          <label className="flex items-center p-3 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors duration-200">
            <input
              type="radio"
              name="reportType"
              value="purchase"
              checked={reportType === "purchase"}
              onChange={() => setReportType("purchase")}
              className="form-radio h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-3 text-lg font-medium text-gray-700">Purchase Report</span>
          </label>
        </div>

        <div className="flex flex-col gap-3 mt-6"> {/* Use flex-col and gap for vertical button stacking */}
          <Button
            onClick={handleNext}
            className="w-full py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
          >
            Next
          </Button>
          <Button
            onClick={handleBackToDashboard} // Changed handler name
            // Use a secondary style for the back button, e.g., outline or ghost
            className="w-full py-3 text-lg font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors duration-200"
          >
            Back to Dashboard {/* Changed button text */}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportTypeSelection;
