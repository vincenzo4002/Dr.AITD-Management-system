import React from 'react';
import { FaMoneyBillWave, FaExclamationCircle } from 'react-icons/fa';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const StudentFees = () => {
  // Mock data
  const mockFees = {
    totalAmount: 50000,
    paidAmount: 30000,
    dueAmount: 20000,
    dueDate: '2024-03-31',
    status: 'pending',
    transactions: [
      { amount: 30000, date: '2024-01-15', method: 'Online', transactionId: 'TXN123456' }
    ]
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <FaMoneyBillWave className="text-3xl text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-secondary font-heading">Fee Details</h1>
            <p className="text-text-secondary">Manage your fee payments and history</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="border-l-4 border-l-primary border-gray-200 shadow-md">
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-text-secondary">Total Amount</p>
              <p className="text-3xl font-bold text-secondary">₹{mockFees.totalAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-success border-gray-200 shadow-md">
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-text-secondary">Paid Amount</p>
              <p className="text-3xl font-bold text-success">₹{mockFees.paidAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-danger border-gray-200 shadow-md">
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-text-secondary">Due Amount</p>
              <p className="text-3xl font-bold text-danger">₹{mockFees.dueAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 text-secondary font-heading">Payment Status</h2>
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationCircle size={24} className="text-warning" />
              <div>
                <p className="font-bold text-secondary">Pending Payment</p>
                <p className="text-sm text-text-secondary">Due Date: {new Date(mockFees.dueDate).toLocaleDateString()}</p>
              </div>
            </div>
            <Button
              variant="primary"
              className="px-6 py-3 font-bold"
              onClick={() => alert('Payment gateway will be integrated')}
            >
              Pay Now
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 text-secondary font-heading">Transaction History</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-secondary">
                  <tr>
                    <th className="p-3 text-left text-white font-heading">Date</th>
                    <th className="p-3 text-left text-white font-heading">Amount</th>
                    <th className="p-3 text-left text-white font-heading">Method</th>
                    <th className="p-3 text-left text-white font-heading">Transaction ID</th>
                  </tr>
                </thead>
                <tbody>
                  {mockFees.transactions.map((txn, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-3 text-secondary border-b border-gray-100">{new Date(txn.date).toLocaleDateString()}</td>
                      <td className="p-3 font-bold text-secondary border-b border-gray-100">₹{txn.amount.toLocaleString()}</td>
                      <td className="p-3 text-secondary border-b border-gray-100">{txn.method}</td>
                      <td className="p-3 text-secondary border-b border-gray-100 font-mono text-sm">{txn.transactionId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentFees;
