import { useState, useEffect, useRef } from 'react'; // Import useEffect and useRef
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

import { ArrowLeft, FileText, Download } from 'lucide-react';

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/pages/AuthContext";

interface ReportData {
  customerName: string;
  gstNumber: string;
  invoiceNumber: string;
  date: string;
  totalBeforeGST: number;
  qty: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
}

const ReportGeneration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token, partnerName } = useAuth();
  const reportRef = useRef<HTMLDivElement>(null);

  // State variables for filters
  const [reportType] = useState<'sales'>('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customerName, setCustomerName] = useState('');

  // New states for suggestion list
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionBoxRef = useRef<HTMLDivElement>(null);

  // State for fetched report data and UI control
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // --- Suggestion List Logic ---
  // Debounce for suggestion fetching
  useEffect(() => {
    const handler = setTimeout(() => {
      if (customerName.length > 1 && token && partnerName) {
        fetchSuggestions(customerName);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce
    return () => clearTimeout(handler);
  }, [customerName, token, partnerName]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchSuggestions = async (value: string) => {
    if (!token || !partnerName) return;

    try {
      const apiUrl = `https://invoicegenerator-bktt.onrender.com/Invoices/SearchCustomers?partnerName=${partnerName}&searchValue=${encodeURIComponent(value)}&sheetName=CustomerDetails`;
      const resp = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!resp.ok) {
        throw new Error(`Failed to fetch suggestions: ${resp.statusText}`);
      }

      const data: string[] = await resp.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (e) {
      console.error("Error fetching suggestions:", e);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setCustomerName(suggestion);
    setShowSuggestions(false);
    // You might want to automatically generate the report here, or leave it for the user to click "Generate Report"
    // generateReport(); // Uncomment if you want immediate report generation on suggestion selection
  };
  // --- End Suggestion List Logic ---


  // Fetch report data from API based on filters
  const generateReport = async () => {
    if (!reportType) {
      toast({ title: "Error", description: "Please select a report type", variant: "destructive" });
      return;
    }
    if (!token || !partnerName) {
      toast({ title: "Authentication Error", description: "You are not authenticated. Please login again.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setShowSuggestions(false); // Hide suggestions when generating report

    try {
      const params = new URLSearchParams({
        startDate: startDate || '',
        endDate: endDate || '',
        customerName: customerName || '',
        partnerName,
      });

      const url = reportType === 'sales'
        ? `https://invoicegenerator-bktt.onrender.com/Invoices/GetSalesList?${params}`
        : `https://invoicegenerator-bktt.onrender.com/Invoices/GetPurchaseList?${params}`; // This part will likely not be hit since reportType is fixed to 'sales'

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch report data");

      const data = await res.json();
      setReportData(data);
      setShowReport(true);

      toast({ title: "Success", description: `Sales report generated successfully` });
    } catch (error) {
      console.error("Error during report generation:", error);
      toast({ title: "Error", description: "Something went wrong while generating the report", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Export the report data to PDF using jsPDF + autoTable
  const downloadReport = () => {
    const pdf = new jsPDF('p', 'pt', 'a4');

    const title = `${partnerName} Sales Report`;
    const dateRange = `${formatDate(startDate) || 'Start'} to ${formatDate(endDate) || 'End'}`;
    const customerFilter = customerName ? ` | Customer: ${customerName}` : '';
    const subTitle = `${reportData.length} records found for ${dateRange}${customerFilter}`;

    pdf.setFontSize(18);
    pdf.text(title, 40, 40);

    pdf.setFontSize(12);
    pdf.setTextColor(100);
    pdf.text(subTitle, 40, 60);

    // ✅ Step 1: Calculate grand totals
    const totalBeforeGSTSum = reportData.reduce((sum, item) => sum + item.totalBeforeGST, 0);
    const cgstSum = reportData.reduce((sum, item) => sum + item.cgst, 0);
    const sgstSum = reportData.reduce((sum, item) => sum + item.sgst, 0);
    const igstSum = reportData.reduce((sum, item) => sum + item.igst, 0);
    const grandTotalSum = reportData.reduce((sum, item) => sum + item.grandTotal, 0);
    const qtyTotal = reportData.reduce((sum, item) => sum + item.qty, 0);

    autoTable(pdf, {
      startY: 80,
      head: [[
        "Date",
        "Customer",
        "GST Number",
        "Invoice Number",
        "Qty",
        "Total before GST",
        "CGST",
        "SGST",
        "IGST",
        "Grand Total"
      ]],
      body: reportData.map(item => [
        formatDate(item.date),
        item.customerName,
        item.gstNumber || "-",
        item.invoiceNumber,
        item.qty.toString(),
        item.totalBeforeGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        item.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        item.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        item.igst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        item.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      ]),
      // ✅ Step 2: Add grand total footer row
      foot: [[
        '', '', '', 'Grand Total', qtyTotal.toString(),
        totalBeforeGSTSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        cgstSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        sgstSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        igstSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        grandTotalSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      ]],
      margin: { top: 80, bottom: 40, left: 20, right: 20 },
      styles: { fontSize: 8, cellPadding: 3 },
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      footStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: 'bold' },
      showHead: 'everyPage',
      showFoot: 'lastPage',
      columnStyles: {
        3: { cellWidth: 70 }, // Invoice Number
        5: { halign: 'right' }, // Total before GST
        6: { halign: 'right' }, // CGST
        7: { halign: 'right' }, // SGST
        8: { halign: 'right' }, // IGST
        9: { halign: 'right' }, // Grand Total
      },
      didDrawPage: () => {
        pdf.setFontSize(10);
        pdf.text(
          `Page ${pdf.getNumberOfPages()}`,
          pdf.internal.pageSize.getWidth() - 50,
          pdf.internal.pageSize.getHeight() - 10
        );
      }
    });

    pdf.save(`${reportType}-report.pdf`);
  };

  // Calculate total amount of all report rows
  const getTotalAmount = () => {
    return reportData.reduce((sum, item) => sum + item.grandTotal, 0);
  };

  // Reset all filters and clear report data
  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setCustomerName('');
    setReportData([]);
    setShowReport(false);
    setSuggestions([]); // Clear suggestions on reset
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Report Generation</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Filters</CardTitle>
              <CardDescription>Generate reports based on date range and customer name</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Input value="Sales Report" disabled readOnly />
                </div>

                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>

                <div className="space-y-2 relative"> {/* Added relative positioning */}
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (e.target.value.length > 0) {
                        setShowSuggestions(true);
                      } else {
                        setShowSuggestions(false);
                      }
                    }}
                    onFocus={() => {
                      if (customerName.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    placeholder="Enter customer name"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div ref={suggestionBoxRef} className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSelectSuggestion(suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={generateReport} disabled={loading}>
                  <FileText className="h-4 w-4 mr-2" />
                  {loading ? 'Generating...' : 'Generate Report'}
                </Button>
                <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
              </div>
            </CardContent>
          </Card>

          {showReport && (
            <Card ref={reportRef} className="report-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{partnerName} Sales Report</CardTitle>
                    <CardDescription>
                      {reportData.length} records found
                      {startDate && endDate && ` for ${formatDate(startDate)} to ${formatDate(endDate)}`}
                      {customerName && ` for customer: ${customerName}`}
                    </CardDescription>
                  </div>
                  <Button onClick={downloadReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {reportData.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>GST</TableHead>
                          <TableHead>Invoice</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Total Before GST</TableHead>
                          <TableHead>CGST</TableHead>
                          <TableHead>SGST</TableHead>
                          <TableHead>IGST</TableHead>
                          <TableHead>Grand Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{formatDate(item.date)}</TableCell>
                            <TableCell>{item.customerName}</TableCell>
                            <TableCell>{item.gstNumber || '-'}</TableCell>
                            <TableCell>{item.invoiceNumber}</TableCell>
                            <TableCell>{item.qty}</TableCell>
                            <TableCell>{item.totalBeforeGST.toLocaleString()}</TableCell>
                            <TableCell>{item.cgst.toFixed(2)}</TableCell>
                            <TableCell>{item.sgst.toFixed(2)}</TableCell>
                            <TableCell>{item.igst.toFixed(2)}</TableCell>
                            <TableCell className="font-semibold">{item.grandTotal.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex justify-end mt-4 pt-4 border-t">
                      <div className="text-right text-lg font-semibold">
                        Total Amount: ₹{getTotalAmount().toLocaleString()}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No records found for the selected criteria</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportGeneration;