"use client";
import { useState, useEffect } from "react";
import { IBook } from "./interfaces/IBook";
import { createBook, deleteBook, getBookById, getBooks, updateBook } from "./services/bookService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<IBook | null>(null);
  const [books, setBooks] = useState<IBook[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 9;
  const [searchId, setSearchId] = useState('');
  const [editFormData, setEditFormData] = useState<IBook>({
    id: 0,
    title: '',
    description: '',
    pageCount: 0,
    excerpt: '',
    publishDate: new Date().toISOString().split('T')[0]
  });
  const [createFormData, setCreateFormData] = useState<IBook>({
    id: 0,
    title: '',
    description: '',
    pageCount: 0,
    excerpt: '',
    publishDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const openEditModal = (book: IBook, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBook(book);
    setEditFormData(book);
    setIsEditModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const openDetailModal = (book: IBook) => {
    setSelectedBook(book);
    setIsDetailModalOpen(true);
    setIsEditModalOpen(false);
  };

  const closeModal = () => {
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedBook(null);
  };

  const fetchBooks = async () => {
    try {
      const response = await getBooks();
      setBooks(response);
      toast.success("Books found");
    } catch (error) {
      toast.error("Failed to fetch books");
    }
  };

  const handleSearch = async () => {
    if (searchId) {
      try {
        const response = await getBookById(parseInt(searchId));
        if (response != null) {
          setBooks([response]);
          toast.success("Book found");
        } else {
          setBooks([]);
          toast.info("No book found with the given ID");
        }
      } catch (error) {
        toast.error("Error searching for book");
      }
    } else {
      fetchBooks();
    }
    setCurrentPage(1);
  };

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prevData => ({
      ...prevData,
      [name]: name === 'pageCount' ? parseInt(value) : value
    }));
  };

  const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCreateFormData(prevData => ({
      ...prevData,
      [name]: name === 'pageCount' ? parseInt(value) : value
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await updateBook(editFormData);
      if (response != null) {
        await fetchBooks();
        closeModal();
        toast.success("Book updated successfully");
      } else {
        toast.error("Failed to update book");
      }
    } catch (error) {
      toast.error("Error updating book");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await createBook(createFormData);
      if (response != null) {
        await fetchBooks();
        closeModal();
        setCreateFormData({
          id: 0,
          title: '',
          description: '',
          pageCount: 0,
          excerpt: '',
          publishDate: new Date().toISOString().split('T')[0]
        });
        toast.success("Book created successfully");
      } else {
        toast.error("Failed to create book");
      }
    } catch (error) {
      toast.error("Error creating book");
    }
  };

  const handleDeleteBook = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const response = await deleteBook(id);
        if (response != null) {
          await fetchBooks();
          toast.success("Book deleted successfully");
        } else {
          toast.error("Failed to delete book");
        }
      } catch (error) {
        toast.error("Error deleting book");
      }
    }
  };

  return (
   <>
   <ToastContainer position="top-right" autoClose={3000} />
   <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Library</h1>
      
      <div className="flex justify-between mb-6">
        <div className="w-2/3">
          <input
            type="number"
            placeholder="Search books by ID"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value.replace(/\D/g, ''))}
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key) && e.key !== 'Enter') {
                e.preventDefault();
              }
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>
        <button 
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 mr-2"
        >
          Search
        </button>
        <button 
          onClick={openAddModal}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          Add Book
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentBooks.map((book) => (
          <div 
            key={book.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
            onClick={() => openDetailModal(book)}
          >
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2 text-black">{book.title}</h2>
              <p className="text-gray-600 mb-4">{book.description}</p>
              <div className="flex justify-between">
                <button
                  onClick={(e) => openEditModal(book, e)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Edit
                </button>
                <button 
                  onClick={(e) => handleDeleteBook(book.id, e)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        {Array.from({ length: Math.ceil(books.length / booksPerPage) }).map((_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-black'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>

    {/* Edit Modal */}
    {isEditModalOpen && selectedBook && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg max-w-2xl w-full text-black">
          <h2 className="text-2xl font-bold mb-4">Edit Book</h2>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={editFormData.title}
                onChange={handleEditInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                value={editFormData.description}
                onChange={handleEditInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="pageCount" className="block text-sm font-medium text-gray-700">Page Count</label>
              <input
                type="number"
                id="pageCount"
                name="pageCount"
                value={editFormData.pageCount}
                onChange={handleEditInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">Excerpt</label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={editFormData.excerpt}
                onChange={handleEditInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700">Publish Date</label>
              <input
                type="date"
                id="publishDate"
                name="publishDate"
                value={editFormData.publishDate}
                onChange={handleEditInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={closeModal}
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded transition duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Detail Modal */}
    {isDetailModalOpen && selectedBook && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg max-w-2xl w-full text-black">
          <h2 className="text-2xl font-bold mb-4 ">{selectedBook.title}</h2>
          <p className="mb-2"><strong>Description:</strong> {selectedBook.description}</p>
          <p className="mb-2"><strong>Page Count:</strong> {selectedBook.pageCount}</p>
          <p className="mb-2"><strong>Excerpt:</strong> {selectedBook.excerpt}</p>
          <p className="mb-4"><strong>Publish Date:</strong> {new Date(selectedBook.publishDate).toLocaleDateString()}</p>
          <button 
            onClick={closeModal}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    )}

    {/* Create Book Modal */}
    {isAddModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg max-w-2xl w-full text-black">
          <h2 className="text-2xl font-bold mb-4">Create New Book</h2>
          <form onSubmit={handleCreateSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={createFormData.title}
                onChange={handleCreateInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                value={createFormData.description}
                onChange={handleCreateInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="pageCount" className="block text-sm font-medium text-gray-700">Page Count</label>
              <input
                type="number"
                id="pageCount"
                name="pageCount"
                value={createFormData.pageCount}
                onChange={handleCreateInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">Excerpt</label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={createFormData.excerpt}
                onChange={handleCreateInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700">Publish Date</label>
              <input
                type="date"
                id="publishDate"
                name="publishDate"
                value={createFormData.publishDate}
                onChange={handleCreateInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={closeModal}
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded transition duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Create Book
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
   </>
  );
}