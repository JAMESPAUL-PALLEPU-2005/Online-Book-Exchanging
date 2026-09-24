import React, { Component } from 'react';
import { Puff } from 'react-loader-spinner';
import { v4 as uuidv4 } from 'uuid';
import BookItem from '../BookItem';
import './index.css';

class BooksContainer extends Component {
    state = { isLoading: false, searchResultsBooks: [] };

    searchBooks = async () => {
        const { searchValue, searchType } = this.props;
        this.setState({ isLoading: true });

        if (searchType === 'addBook') {
            try {
                const queryParam = searchValue ? searchValue.replace(/\s+/g, '+') : 'react';
                const apiResponse = await fetch(`https://apis.ccbp.in/book-store?title=${queryParam}`);
                if (apiResponse.ok) {
                    const result = await apiResponse.json();
                    const updatedBooksWithId = (result.search_results || []).map((eachResult) => ({
                        id: uuidv4(),
                        title: eachResult.title || 'Untitled Book',
                        author: eachResult.author || 'Unknown Author',
                        imageLink: eachResult.image_url || 'https://assets.ccbp.in/frontend/react-js/book-store-img.png',
                    }));
                    this.setState({ isLoading: false, searchResultsBooks: updatedBooksWithId });
                } else {
                    this.setState({ isLoading: false, searchResultsBooks: [] });
                }
            } catch (err) {
                console.error('Error fetching external books API:', err);
                this.setState({ isLoading: false, searchResultsBooks: [] });
            }
        } else if (searchType === 'findBook') {
            try {
                const searchParam = searchValue ? encodeURIComponent(searchValue) : '';
                const response = await fetch(`/api/books?search=${searchParam}`);
                if (response.ok) {
                    const booksList = await response.json();
                    this.setState({ isLoading: false, searchResultsBooks: booksList });
                } else {
                    this.setState({ isLoading: false, searchResultsBooks: [] });
                }
            } catch (err) {
                console.error('Error fetching books from backend:', err);
                this.setState({ isLoading: false, searchResultsBooks: [] });
            }
        }
    };

    componentDidMount() {
        this.searchBooks();
    }

    componentDidUpdate(prevProps) {
        if (this.props.searchValue !== prevProps.searchValue || this.props.searchType !== prevProps.searchType) {
            this.searchBooks();
        }
    }

    handleBookAction = async (book) => {
        const { userId, searchType, addBook } = this.props;
        const currentUserId = userId || localStorage.getItem('userId');

        if (!currentUserId) {
            alert('Please log in first.');
            return;
        }

        if (searchType === 'addBook') {
            try {
                const response = await fetch('/api/books', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: book.title,
                        author: book.author,
                        imageLink: book.imageLink,
                        userId: currentUserId,
                    }),
                });
                if (response.ok) {
                    const addedBook = await response.json();
                    addBook(addedBook);
                    alert(`"${book.title}" added to your books for lending!`);
                } else {
                    const err = await response.json();
                    alert(err.error || 'Failed to add book');
                }
            } catch (error) {
                console.error('Error adding book:', error);
                alert('Error adding book. Please try again.');
            }
        } else if (searchType === 'findBook') {
            try {
                const response = await fetch('/api/requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: currentUserId,
                        bookId: book.id,
                        title: book.title,
                        author: book.author,
                        imageLink: book.imageLink,
                        ownerUsername: book.username,
                        ownerEmail: book.email,
                        ownerMobile: book.mobileNumber,
                    }),
                });
                if (response.ok) {
                    const requestedBook = await response.json();
                    addBook(requestedBook);
                    const emailMsg = book.email ? `\nEmail: ${book.email}` : '';
                    alert(`Requested "${book.title}"!\nLender Username: ${book.username}${emailMsg}\nContact: ${book.mobileNumber}`);
                } else {
                    alert('Error submitting borrow request.');
                }
            } catch (error) {
                console.error('Error requesting book:', error);
            }
        }
    };

    render() {
        const { isLoading, searchResultsBooks } = this.state;
        const { searchType } = this.props;

        return (
            <div className="books-items-container">
                {isLoading ? (
                    <Puff color="#575e1a" height={80} width={80} />
                ) : searchResultsBooks.length === 0 ? (
                    <p style={{ color: '#fff', fontSize: '18px', marginTop: '20px' }}>No books found.</p>
                ) : (
                    searchResultsBooks.map((eachBook) => (
                        <BookItem
                            key={eachBook.id}
                            bookDetails={eachBook}
                            addBookInner={this.handleBookAction}
                            searchType={searchType}
                        />
                    ))
                )}
            </div>
        );
    }
}

export default BooksContainer;
