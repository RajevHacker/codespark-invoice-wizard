import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Save } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/pages/AuthContext";

const RecordPayment = () => {
  const navigate = useNavigate();
  const { token, partnerName } = useAuth();

  const [paymentData, setPaymentData] = useState({
    customerName: '',
    date: new Date().toISOString().split('T')[0],
    bankName: '',
    amount: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setPaymentData({ ...paymentData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentData.customerName || !paymentData.amount || !paymentData.bankName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(paymentData.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (!token || !partnerName) {
      toast({
        title: "Error",
        description: "Authorization error. Please login again.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`https://invoicegenerator-bktt.onrender.com/Invoices/PaymentEntry?partnerName=${encodeURIComponent(partnerName)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          CustomerName: paymentData.customerName,
          Date: paymentData.date,
          BankName: paymentData.bankName,
          Amount: paymentData.amount
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to record payment.");
      }

      toast({
        title: "Success",
        description: `Payment of ₹${paymentData.amount} recorded successfully for ${paymentData.customerName}!`,
      });

      setPaymentData({
        customerName: '',
        date: new Date().toISOString().split('T')[0],
        bankName: '',
        amount: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong while recording payment.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Record Payment</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={paymentData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="date">Payment Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={paymentData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  placeholder="Enter bank name"
                  value={paymentData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter payment amount"
                  value={paymentData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecordPayment;