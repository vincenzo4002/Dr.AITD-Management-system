import React, { useState, useEffect } from 'react';
import { FaBookOpen, FaPlus, FaSearch, FaEdit, FaTrash, FaDownload, FaEye, FaTimes } from 'react-icons/fa';
import AdminHeader from '../../components/AdminHeader';
import BackButton from '../../components/BackButton';
import Input from '../../components/ui/Input';
import Select, { SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import adminService from '../../services/adminService';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/LoadingSpinner';

const LibraryManagement = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  const [newBook, setNewBook] = useState({
    bookName: '', author: '', isbn: '', category: '', quantity: 1
  });

  const [issueForm, setIssueForm] = useState({
    bookId: '', studentId: '', returnDate: ''
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await adminService.getBooks();
      if (data.success) {
        setBooks(data.books);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const addBook = async () => {
    try {
      await adminService.addBook(newBook);
      toast.success('Book added successfully');
      setNewBook({ bookName: '', author: '', isbn: '', category: '', quantity: 1 });
      setShowAddModal(false);
      fetchBooks();
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error(error.response?.data?.msg || 'Failed to add book');
    }
  };

  const deleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await adminService.deleteBook(id);
      toast.success('Book deleted successfully');
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    }
  };

  const issueBook = async () => {
    if (!issueForm.bookId || !issueForm.studentId || !issueForm.returnDate) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      await adminService.issueBook(issueForm);
      toast.success('Book issued successfully');
      setShowIssueModal(false);
      setIssueForm({ bookId: '', studentId: '', returnDate: '' });
      fetchBooks();
    } catch (error) {
      console.error('Issue error:', error);
      toast.error(error.response?.data?.msg || 'Failed to issue book');
    }
  };

  const returnBook = async (bookId, studentId) => {
    if (!window.confirm('Mark this book as returned?')) return;
    try {
      await adminService.returnBook({ bookId, studentId });
      toast.success('Book returned successfully');
      fetchBooks();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Return error:', error);
      toast.error(error.response?.data?.msg || 'Failed to return book');
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.bookName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm);
    const matchesCategory = selectedCategory === 'All Categories' || book.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All Status' ||
      (selectedStatus === 'Available' && book.remaining > 0) ||
      (selectedStatus === 'Out of Stock' && book.remaining === 0);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const exportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Title,Author,ISBN,Category,Available,Total\n" +
      filteredBooks.map(book =>
        `"${book.bookName}","${book.author}",${book.isbn},${book.category},${book.remaining},${book.quantity}`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `library_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <BackButton className="mb-4" />
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-secondary font-heading">Library Management</h1>
              <p className="text-text-secondary">Manage books and library resources</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={exportReport} className="flex items-center space-x-2">
                <FaDownload /> <span>Export Report</span>
              </Button>
              <Button variant="outline" onClick={() => setShowIssueModal(true)} className="flex items-center space-x-2">
                <FaBookOpen /> <span>Issue Book</span>
              </Button>
              <Button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2">
                <FaPlus /> <span>Add Book</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <FaBookOpen className="text-3xl text-primary mr-4" />
                <div>
                  <p className="text-text-secondary">Total Books</p>
                  <p className="text-2xl font-bold text-secondary">{books.reduce((sum, b) => sum + b.quantity, 0)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <FaBookOpen className="text-3xl text-success mr-4" />
                <div>
                  <p className="text-text-secondary">Available</p>
                  <p className="text-2xl font-bold text-secondary">{books.reduce((sum, b) => sum + b.remaining, 0)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <FaBookOpen className="text-3xl text-warning mr-4" />
                <div>
                  <p className="text-text-secondary">Issued</p>
                  <p className="text-2xl font-bold text-secondary">{books.reduce((sum, b) => sum + (b.quantity - b.remaining), 0)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Categories">All Categories</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Book Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">ISBN</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Available</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBooks.map((book) => (
                    <tr key={book._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaBookOpen className="text-primary mr-3" />
                          <span className="font-medium text-secondary">{book.bookName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-secondary">{book.author}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-secondary">{book.isbn}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-secondary">{book.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-medium ${book.remaining > 0 ? 'text-success' : 'text-danger'}`}>
                          {book.remaining} / {book.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button onClick={() => { setSelectedBook(book); setShowDetailsModal(true); }} className="text-primary hover:text-primary/80"><FaEye /></button>
                          <button onClick={() => deleteBook(book._id)} className="text-danger hover:text-danger/80"><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Book Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-secondary font-heading">Add New Book</h2>
                  <button onClick={() => setShowAddModal(false)} className="text-text-secondary hover:text-secondary"><FaTimes size={24} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Book Title" value={newBook.bookName} onChange={(e) => setNewBook({ ...newBook, bookName: e.target.value })} />
                  <Input label="Author" value={newBook.author} onChange={(e) => setNewBook({ ...newBook, author: e.target.value })} />
                  <Input label="ISBN" value={newBook.isbn} onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })} />
                  <Select label="Category" value={newBook.category} onValueChange={(val) => setNewBook({ ...newBook, category: val })}>
                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Mechanical">Mechanical</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input label="Quantity" type="number" value={newBook.quantity} onChange={(e) => setNewBook({ ...newBook, quantity: parseInt(e.target.value) })} />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button onClick={addBook}>Add Book</Button>
                </div>
              </div>
            </div>
          )}

          {/* Issue Book Modal */}
          {showIssueModal && (
            <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-secondary font-heading">Issue Book</h2>
                  <button onClick={() => setShowIssueModal(false)} className="text-text-secondary hover:text-secondary"><FaTimes size={24} /></button>
                </div>
                <div className="space-y-4">
                  <Select label="Select Book" value={issueForm.bookId} onValueChange={(val) => setIssueForm({ ...issueForm, bookId: val })}>
                    <SelectTrigger><SelectValue placeholder="Select a book" /></SelectTrigger>
                    <SelectContent>
                      {books.filter(b => b.remaining > 0).map(b => (
                        <SelectItem key={b._id} value={b._id}>{b.bookName} ({b.remaining})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input label="Student ID (MongoDB ID for now)" value={issueForm.studentId} onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })} />
                  <Input label="Return Date" type="date" value={issueForm.returnDate} onChange={(e) => setIssueForm({ ...issueForm, returnDate: e.target.value })} />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="ghost" onClick={() => setShowIssueModal(false)}>Cancel</Button>
                  <Button onClick={issueBook}>Issue Book</Button>
                </div>
              </div>
            </div>
          )}

          {/* View Details Modal */}
          {showDetailsModal && selectedBook && (
            <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-secondary font-heading">{selectedBook.bookName}</h2>
                  <button onClick={() => setShowDetailsModal(false)} className="text-text-secondary hover:text-secondary"><FaTimes size={24} /></button>
                </div>
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Issued To:</h3>
                  {selectedBook.issuedTo && selectedBook.issuedTo.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedBook.issuedTo.filter(i => i.status === 'Issued').map((issue, idx) => (
                        <li key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                          <span>Student ID: {issue.studentId} (Due: {new Date(issue.returnDate).toLocaleDateString()})</span>
                          <Button size="sm" variant="outline" onClick={() => returnBook(selectedBook._id, issue.studentId)}>Return</Button>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-text-muted">No active issues.</p>}
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setShowDetailsModal(false)}>Close</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryManagement;