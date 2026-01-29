import React, { useState, useEffect } from 'react';
import { FaRupeeSign, FaPlus, FaDownload, FaSearch, FaEye, FaEdit, FaTimes, FaReceipt, FaCreditCard } from 'react-icons/fa';
import AdminHeader from '../../components/AdminHeader';
import BackButton from '../../components/BackButton';
import Input from '../../components/ui/Input';
import Select, { SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { toast } from 'react-toastify';

import adminService from '../../services/adminService';

const FeeManagement = () => {
  const [feeRecords, setFeeRecords] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeeData();
  }, []);

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getFees();

      if (data.success && data.fees) {
        // Transform backend data to match frontend format
        const transformedFees = data.fees.map(fee => ({
          id: fee._id,
          student: fee.studentId?.name || 'Unknown',
          rollNo: fee.studentId?.rollNo || 'N/A',
          course: fee.studentId?.courseId?.courseName || 'N/A',
          amount: fee.totalAmount || 0,
          paid: fee.paidAmount || 0,
          due: fee.dueAmount || 0,
          status: fee.status || (fee.dueAmount === 0 ? 'Paid' : fee.paidAmount > 0 ? 'Partial' : 'Pending'),
          lastPayment: fee.transactions && fee.transactions.length > 0
            ? fee.transactions[fee.transactions.length - 1].date
            : null
        }));

        setFeeRecords(transformedFees);

        // Extract payment history from transactions
        const allTransactions = [];
        data.fees.forEach(fee => {
          if (fee.transactions && fee.transactions.length > 0) {
            fee.transactions.forEach(transaction => {
              allTransactions.push({
                id: transaction._id || Math.random().toString(),
                student: fee.studentId?.name || 'Unknown',
                amount: transaction.amount,
                date: transaction.date,
                method: transaction.method || 'Cash',
                receipt: transaction.receiptNo || 'N/A'
              });
            });
          }
        });
        setPaymentHistory(allTransactions);
      }
    } catch (err) {
      console.error("Error fetching fees:", err);
      toast.error('Failed to load fee records');
      // Set empty arrays on error
      setFeeRecords([]);
      setPaymentHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  const [paymentForm, setPaymentForm] = useState({
    amount: '', method: 'Cash', date: new Date().toISOString().split('T')[0], remarks: ''
  });

  const filteredRecords = feeRecords.filter(record => {
    const matchesSearch = record.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All Status' || record.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const exportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Roll No,Student Name,Course,Total Amount,Paid Amount,Due Amount,Status,Last Payment\n" +
      filteredRecords.map(record =>
        `${record.rollNo},"${record.student}",${record.course},${record.amount},${record.paid},${record.due},${record.status},${record.lastPayment || 'N/A'}`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fee_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addPayment = () => {
    const updatedRecord = {
      ...selectedRecord,
      paid: selectedRecord.paid + parseInt(paymentForm.amount),
      due: selectedRecord.due - parseInt(paymentForm.amount),
      lastPayment: paymentForm.date
    };
    updatedRecord.status = updatedRecord.due === 0 ? 'Paid' : updatedRecord.due < updatedRecord.amount ? 'Partial' : 'Pending';

    setFeeRecords(feeRecords.map(record =>
      record.id === selectedRecord.id ? updatedRecord : record
    ));

    setPaymentHistory([...paymentHistory, {
      id: paymentHistory.length + 1,
      student: selectedRecord.student,
      amount: parseInt(paymentForm.amount),
      date: paymentForm.date,
      method: paymentForm.method,
      receipt: `RCP${100 + paymentHistory.length + 1}`
    }]);

    setShowPaymentModal(false);
    setPaymentForm({ amount: '', method: 'Cash', date: new Date().toISOString().split('T')[0], remarks: '' });
    alert('Payment added successfully!');
  };

  const viewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const editFee = (record) => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };

  const saveEditedFee = () => {
    setFeeRecords(feeRecords.map(record =>
      record.id === selectedRecord.id ? selectedRecord : record
    ));
    setShowEditModal(false);
    alert('Fee record updated successfully!');
  };

  const makePayment = (record) => {
    setSelectedRecord(record);
    setShowPaymentModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <BackButton className="mb-4" />
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-secondary font-heading">Fee Management</h1>
              <p className="text-text-secondary">Manage student fees and payments</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={exportReport}
                className="flex items-center space-x-2"
              >
                <FaDownload />
                <span>Export Report</span>
              </Button>
              <Button
                onClick={() => setShowPaymentModal(true)}
                className="flex items-center space-x-2"
              >
                <FaPlus />
                <span>Add Payment</span>
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <FaRupeeSign className="text-3xl text-green-500 mr-4" />
                <div>
                  <p className="text-text-secondary">Total Collection</p>
                  <p className="text-2xl font-bold text-secondary">₹{feeRecords.reduce((sum, record) => sum + record.paid, 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <FaRupeeSign className="text-3xl text-red-500 mr-4" />
                <div>
                  <p className="text-text-secondary">Total Due</p>
                  <p className="text-2xl font-bold text-secondary">₹{feeRecords.reduce((sum, record) => sum + record.due, 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <FaRupeeSign className="text-3xl text-primary mr-4" />
                <div>
                  <p className="text-text-secondary">Total Amount</p>
                  <p className="text-2xl font-bold text-secondary">₹{feeRecords.reduce((sum, record) => sum + record.amount, 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <FaRupeeSign className="text-3xl text-yellow-500 mr-4" />
                <div>
                  <p className="text-text-secondary">Pending Students</p>
                  <p className="text-2xl font-bold text-secondary">{feeRecords.filter(record => record.status !== 'Paid').length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fee Records Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium text-secondary">{record.rollNo}</TableCell>
                    <TableCell className="font-medium text-secondary">{record.student}</TableCell>
                    <TableCell>{record.course}</TableCell>
                    <TableCell>₹{record.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600">₹{record.paid.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600">₹{record.due.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${record.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        record.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {record.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewDetails(record)}
                          className="text-primary hover:text-primary/80"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => editFee(record)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => makePayment(record)}
                          className="text-secondary hover:text-secondary/80"
                        >
                          <FaCreditCard />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Add Payment Modal */}
          {showPaymentModal && (
            <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-secondary font-heading">Add Payment</h2>
                  <button onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-gray-700">
                    <FaTimes size={24} />
                  </button>
                </div>

                {selectedRecord && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-secondary">Student: {selectedRecord.student}</h3>
                    <p className="text-text-secondary">Roll No: {selectedRecord.rollNo}</p>
                    <p className="text-text-secondary">Due Amount: ₹{selectedRecord.due.toLocaleString()}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <Input
                    label="Payment Amount"
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder="Enter amount"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Payment Method"
                      value={paymentForm.method}
                      onValueChange={(value) => setPaymentForm({ ...paymentForm, method: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      label="Payment Date"
                      type="date"
                      value={paymentForm.date}
                      onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Remarks</label>
                    <textarea
                      value={paymentForm.remarks}
                      onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows="3"
                      placeholder="Optional remarks"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => setShowPaymentModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addPayment}
                  >
                    Add Payment
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* View Details Modal */}
          {showDetailsModal && selectedRecord && (
            <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-secondary font-heading">Fee Details - {selectedRecord.student}</h2>
                  <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700">
                    <FaTimes size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-secondary mb-3">Student Information</h3>
                    <p className="text-text-secondary"><strong>Name:</strong> {selectedRecord.student}</p>
                    <p className="text-text-secondary"><strong>Roll No:</strong> {selectedRecord.rollNo}</p>
                    <p className="text-text-secondary"><strong>Course:</strong> {selectedRecord.course}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-secondary mb-3">Fee Summary</h3>
                    <p className="text-text-secondary"><strong>Total Amount:</strong> ₹{selectedRecord.amount.toLocaleString()}</p>
                    <p className="text-text-secondary"><strong>Paid Amount:</strong> ₹{selectedRecord.paid.toLocaleString()}</p>
                    <p className="text-text-secondary"><strong>Due Amount:</strong> ₹{selectedRecord.due.toLocaleString()}</p>
                    <p className="text-text-secondary"><strong>Status:</strong>
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${selectedRecord.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        selectedRecord.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {selectedRecord.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-secondary mb-3">Payment History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">Amount</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">Method</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paymentHistory.filter(payment => payment.student === selectedRecord.student).map((payment, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-text-secondary">{payment.date}</td>
                            <td className="px-4 py-2 text-sm text-text-secondary">₹{payment.amount.toLocaleString()}</td>
                            <td className="px-4 py-2 text-sm text-text-secondary">{payment.method}</td>
                            <td className="px-4 py-2 text-sm text-text-secondary">{payment.receipt}</td>
                          </tr>
                        ))}
                        {paymentHistory.filter(payment => payment.student === selectedRecord.student).length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-4 py-2 text-sm text-text-secondary text-center">No payment history</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Fee Modal */}
          {showEditModal && selectedRecord && (
            <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-secondary font-heading">Edit Fee Record</h2>
                  <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                    <FaTimes size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Student Name"
                    value={selectedRecord.student}
                    disabled
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Total Amount"
                      type="number"
                      value={selectedRecord.amount}
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, amount: parseInt(e.target.value) })}
                    />
                    <Input
                      label="Paid Amount"
                      type="number"
                      value={selectedRecord.paid}
                      onChange={(e) => {
                        const paid = parseInt(e.target.value);
                        setSelectedRecord({
                          ...selectedRecord,
                          paid: paid,
                          due: selectedRecord.amount - paid
                        });
                      }}
                    />
                  </div>

                  <Input
                    label="Due Amount"
                    type="number"
                    value={selectedRecord.due}
                    disabled
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveEditedFee}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeeManagement;