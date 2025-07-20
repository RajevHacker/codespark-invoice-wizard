import { useState, useRef } from 'react';
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
  const [reportType, setReportType] = useState<'purchase' | 'sales' | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  
  // State for fetched report data and UI control
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(false);

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
    try {
      const params = new URLSearchParams({
        startDate: startDate || '',
        endDate: endDate || '',
        customerName: customerName || '',
        partnerName,
      });

      const url = reportType === 'sales'
        ? `http://localhost:5062/Invoices/GetSalesList?${params}`
        : `http://localhost:5062/Invoices/GetPurchaseList?${params}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch report data");

      const data = await res.json();
      setReportData(data);
      setShowReport(true);

      toast({ title: "Success", description: `${reportType === 'purchase' ? 'Purchase' : 'Sales'} report generated successfully` });
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
  
    const title = reportType === 'purchase' ? 'Purchase Report' : 'Sales Report';
    const dateRange = `${startDate || 'Start'} to ${endDate || 'End'}`;
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
        item.date,
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
        '', '', '', 'Grand Total',
        qtyTotal.toString(),
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
    setReportType('');
    setStartDate('');
    setEndDate('');
    setCustomerName('');
    setReportData([]);
    setShowReport(false);
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
                  <Label>Report Type *</Label>
                  <Select value={reportType} onValueChange={(value: 'purchase' | 'sales') => setReportType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purchase">Purchase Report</SelectItem>
                      <SelectItem value="sales">Sales Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter customer name" />
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
                    <CardTitle>{reportType === 'purchase' ? 'Purchase Report' : 'Sales Report'}</CardTitle>
                    <CardDescription>
                      {reportData.length} records found
                      {startDate && endDate && ` for ${startDate} to ${endDate}`}
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
                            <TableCell>{item.date}</TableCell>
                            <TableCell>{item.customerName}</TableCell>
                            <TableCell>{item.gstNumber || '-'}</TableCell>
                            <TableCell>{item.invoiceNumber}</TableCell>
                            <TableCell>{item.qty}</TableCell>
                            {/* <TableCell>₹{item.totalBeforeGST.toLocaleString()}</TableCell>
                            <TableCell>₹{item.cgst.toFixed(2)}</TableCell>
                            <TableCell>₹{item.sgst.toFixed(2)}</TableCell>
                            <TableCell>₹{item.igst.toFixed(2)}</TableCell>
                            <TableCell className="font-semibold">₹{item.grandTotal.toLocaleString()}</TableCell> */}
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