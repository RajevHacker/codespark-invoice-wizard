
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ReportData {
  id: string;
  date: string;
  customerName: string;
  type: 'purchase' | 'sales';
  amount: number;
  poNumber?: string;
  invoiceNumber?: string;
}

const ReportGeneration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [reportType, setReportType] = useState<'purchase' | 'sales' | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [showReport, setShowReport] = useState(false);

  // Mock data for demonstration
  const mockData: ReportData[] = [
    {
      id: '1',
      date: '2024-01-15',
      customerName: 'ABC Industries',
      type: 'sales',
      amount: 50000,
      invoiceNumber: 'INV-001'
    },
    {
      id: '2',
      date: '2024-01-16',
      customerName: 'ABC Suppliers Ltd',
      type: 'purchase',
      amount: 30000,
      poNumber: 'PO-001'
    },
    {
      id: '3',
      date: '2024-01-18',
      customerName: 'XYZ Corp',
      type: 'sales',
      amount: 75000,
      invoiceNumber: 'INV-002'
    },
    {
      id: '4',
      date: '2024-01-20',
      customerName: 'XYZ Trading Co',
      type: 'purchase',
      amount: 45000,
      poNumber: 'PO-002'
    },
    {
      id: '5',
      date: '2024-01-22',
      customerName: 'Tech Solutions',
      type: 'sales',
      amount: 25000,
      invoiceNumber: 'INV-003'
    }
  ];

  const generateReport = () => {
    if (!reportType) {
      toast({
        title: "Error",
        description: "Please select a report type",
        variant: "destructive",
      });
      return;
    }

    let filteredData = mockData.filter(item => item.type === reportType);

    // Filter by date range
    if (startDate && endDate) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return itemDate >= start && itemDate <= end;
      });
    }

    // Filter by customer name
    if (customerName) {
      filteredData = filteredData.filter(item =>
        item.customerName.toLowerCase().includes(customerName.toLowerCase())
      );
    }

    setReportData(filteredData);
    setShowReport(true);

    toast({
      title: "Success",
      description: `${reportType === 'purchase' ? 'Purchase' : 'Sales'} report generated successfully`,
    });
  };

  const downloadReport = () => {
    toast({
      title: "Download Started",
      description: "Report download will start shortly",
    });
    // In a real application, this would generate and download a PDF or Excel file
  };

  const getTotalAmount = () => {
    return reportData.reduce((sum, item) => sum + item.amount, 0);
  };

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
          {/* Report Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Report Filters</CardTitle>
              <CardDescription>
                Generate reports based on date range and customer name
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type *</Label>
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
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={generateReport}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Report Results */}
          {showReport && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      {reportType === 'purchase' ? 'Purchase Report' : 'Sales Report'}
                    </CardTitle>
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
                          <TableHead>Customer Name</TableHead>
                          <TableHead>{reportType === 'purchase' ? 'PO Number' : 'Invoice Number'}</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.date}</TableCell>
                            <TableCell>{item.customerName}</TableCell>
                            <TableCell>
                              {reportType === 'purchase' ? item.poNumber : item.invoiceNumber}
                            </TableCell>
                            <TableCell className="text-right">
                              ₹{item.amount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    <div className="flex justify-end mt-4 pt-4 border-t">
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          Total Amount: ₹{getTotalAmount().toLocaleString()}
                        </div>
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
