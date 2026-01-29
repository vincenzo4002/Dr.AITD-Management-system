import React, { useState, useEffect } from 'react';
import { FaBook, FaSearch, FaBookmark, FaHistory } from 'react-icons/fa';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const StudentLibrary = () => {
    const { studentId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'my-books'
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await api.get('/api/student/library/books');
                if (response.data.success) {
                    setBooks(response.data.books);
                }
            } catch (error) {
                console.error("Error fetching books:", error);
                toast.error("Failed to load library books");
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    // Helper to check if book is issued to current student
    const isIssuedToMe = (book) => {
        return book.issuedTo?.some(issue =>
            issue.studentId === studentId && issue.status === 'Issued'
        );
    };

    const myIssuedBooks = books.filter(b => isIssuedToMe(b));

    const filteredBooks = books.filter(book =>
        book.bookName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background pb-12 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-secondary font-heading">Library</h1>
                        <p className="text-text-secondary">Explore resources and manage your issued books</p>
                    </div>
                    <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
                        <Button
                            onClick={() => setActiveTab('browse')}
                            variant={activeTab === 'browse' ? 'primary' : 'ghost'}
                            className="text-sm"
                        >
                            Browse Books
                        </Button>
                        <Button
                            onClick={() => setActiveTab('my-books')}
                            variant={activeTab === 'my-books' ? 'primary' : 'ghost'}
                            className="text-sm"
                        >
                            My Issued Books
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : activeTab === 'browse' && (
                    <div className="space-y-6">
                        {/* Search Bar */}
                        <div className="relative max-w-xl">
                            <Input
                                type="text"
                                placeholder="Search by title, author, or category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        </div>

                        {/* Books Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredBooks.map(book => (
                                <Card key={book._id} className="hover:shadow-lg transition-shadow duration-300 group border border-gray-200">
                                    <div className="aspect-[2/3] bg-gray-100 relative overflow-hidden flex items-center justify-center">
                                        {/* Placeholder for cover if image fails or is generic */}
                                        <div className="text-gray-300">
                                            <FaBook size={64} />
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <Badge variant={book.remaining > 0 ? 'success' : 'danger'}>
                                                {book.remaining > 0 ? 'Available' : 'Out of Stock'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">{book.category || 'General'}</p>
                                        <h3 className="font-bold text-secondary line-clamp-1 font-heading" title={book.bookName}>{book.bookName}</h3>
                                        <p className="text-sm text-text-secondary mb-3">{book.author}</p>
                                        <p className="text-xs text-text-muted mb-3">ISBN: {book.isbn || 'N/A'}</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            disabled={book.remaining === 0}
                                        >
                                            {book.remaining > 0 ? 'Request Issue' : 'Unavailable'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'my-books' && (
                    <div className="max-w-4xl">
                        <Card className="border border-gray-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-heading text-secondary">
                                    <FaBookmark className="text-primary" /> Current Issues
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {myIssuedBooks.length > 0 ? (
                                    <div className="space-y-4">
                                        {myIssuedBooks.map(book => {
                                            const issueInfo = book.issuedTo.find(i => i.studentId === studentId && i.status === 'Issued');
                                            return (
                                                <div key={book._id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                                    <div className="w-16 h-24 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                        <FaBook className="text-gray-400 text-2xl" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-secondary font-heading">{book.bookName}</h3>
                                                        <p className="text-sm text-text-secondary">{book.author}</p>
                                                        <div className="flex items-center gap-4 mt-2 text-sm">
                                                            <span className="text-text-muted">Issued: {issueInfo?.issueDate ? new Date(issueInfo.issueDate).toLocaleDateString() : 'N/A'}</span>
                                                            <span className="text-danger font-medium">Due: {issueInfo?.returnDate ? new Date(issueInfo.returnDate).toLocaleDateString() : 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    {/* <Button variant="secondary" size="sm">Renew</Button> */}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FaBook className="text-gray-300 text-2xl" />
                                        </div>
                                        <p className="text-text-secondary">You haven't issued any books yet.</p>
                                        <button onClick={() => setActiveTab('browse')} className="text-primary font-semibold mt-2 hover:underline">Browse Library</button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="mt-8 border border-gray-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-heading text-secondary">
                                    <FaHistory className="text-secondary" /> History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-text-secondary text-center py-4">No past history available.</p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentLibrary;
