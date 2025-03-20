import React, { Component } from 'react';
import { Puff } from 'react-loader-spinner';
import { v4 } from 'uuid';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import BookItem from '../BookItem';
import './index.css';
import { firestore } from '../../firebase'; // Adjust the path as needed

class BooksContainer extends Component {
    state = { isLoading: false, searchResultsBooks: [] };

    searchBooks = async () => {
        const { searchValue, searchType } = this.props;
        const searchValueUrl = searchValue.replace(' ', '+');

        if (searchType === 'addBook') {
            const apiResponse = await fetch(`https://apis.ccbp.in/book-store?title=${searchValueUrl}`);
            const result = await apiResponse.json();
            const updatedBooksWithId = result.search_results.map((eachResult) => {
                return { ...eachResult, id: v4() };
            });
            this.setState({ isLoading: false, searchResultsBooks: updatedBooksWithId });
        } else if (searchType === 'findBook') {
            const q = query(collection(firestore, 'books'), where('title', '>=', searchValue), where('title', '<=', searchValue + '\uf8ff'));
            const querySnapshot = await getDocs(q);
            const booksList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Fetch user details for each book
            const booksWithUserDetails = await Promise.all(booksList.map(async (book) => {
                const userDoc = await getDoc(doc(firestore, 'users', book.userId));
                if (userDoc.exists()) {
                    return { ...book, username: userDoc.data().username, mobileNumber: userDoc.data().mobile };
                }
                return book;
            }));

            this.setState({ isLoading: false, searchResultsBooks: booksWithUserDetails });
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

    addBookToFirestore = async (book) => {
        const { userId } = this.props;
        const userDoc = await getDoc(doc(firestore, 'users', userId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const bookData = {
                ...book,
                userId,
                username: userData.username,
                mobile: userData.mobile
            };
            await addDoc(collection(firestore, 'books'), bookData);
            this.props.addBook(bookData);
        }
    };

    render() {
        const { isLoading, searchResultsBooks } = this.state;
        const { searchType } = this.props;

        return (
            <div className="books-items-container">
                {isLoading ? (
                    <Puff color="#575e1a" height={550} width={80} />
                ) : (
                    searchResultsBooks.map((eachBook) => (
                        <BookItem
                            key={eachBook.id}
                            bookDetails={eachBook}
                            addBookInner={this.addBookToFirestore}
                            searchType={searchType}
                        />
                    ))
                )}
            </div>
        );
    }
}

export default BooksContainer;
