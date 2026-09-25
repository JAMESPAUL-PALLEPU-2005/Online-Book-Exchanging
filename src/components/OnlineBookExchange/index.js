import React, { Component } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../Header';
import HistoryItem from '../HistoryItem';
import BooksContainer from '../BooksContainer';
import Interactive3DBook from '../Interactive3DBook';
import './index.css';

class OnlineBookExchange extends Component {
    state = {
        currentTab: 'home',
        yourBooksList: [],
        searchType: 'findBook',
        requestedBooks: [],
        searchValue: '',
        isSearchOn: true,
        displayAdded: false,
        historySelector: 'requestedBooks',
        isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
        userId: localStorage.getItem('userId') || '',
        customTitle: '',
        customAuthor: '',
        showManualAdd: false,
    };

    componentDidMount() {
        const { location } = this.props;
        const stateUserId = location && location.state && location.state.userId;
        const currentUserId = stateUserId || localStorage.getItem('userId');

        if (currentUserId) {
            this.setState({ userId: currentUserId });
            this.fetchUserData(currentUserId);
        }
    }

    fetchUserData = async (userId) => {
        if (!userId) return;
        try {
            const response = await fetch(`/api/user-data/${userId}`);
            if (response.ok) {
                const data = await response.json();
                this.setState({
                    yourBooksList: data.yourBooks || [],
                    requestedBooks: data.requestedBooks || [],
                });
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    handleAuthSuccess = (user) => {
        const currentUserId = (user && user.id) || localStorage.getItem('userId');
        this.setState({
            isAuthenticated: true,
            userId: currentUserId,
        });
        if (currentUserId) {
            this.fetchUserData(currentUserId);
        }
    };

    changeSearchType = () => {
        this.setState((previousState) => {
            if (previousState.searchType === 'findBook') {
                return { searchType: 'addBook', displayAdded: false, showManualAdd: false };
            }
            return { searchType: 'findBook', displayAdded: false, showManualAdd: false };
        });
    };

    changeHistoryType = () => {
        this.setState((prevState) => {
            if (prevState.historySelector === 'requestedBooks') {
                return { historySelector: 'yourBooks' };
            }
            return { historySelector: 'requestedBooks' };
        });
    };

    addBook = (book) => {
        this.setState((previousState) => {
            if (previousState.searchType === 'findBook') {
                return { requestedBooks: [...previousState.requestedBooks, book], displayAdded: true };
            }
            return { yourBooksList: [...previousState.yourBooksList, book], displayAdded: true };
        });
    };

    changeTab = (value) => {
        this.setState({ currentTab: value, displayAdded: false });
        if (value === 'history' && this.state.userId) {
            this.fetchUserData(this.state.userId);
        }
    };

    updateSearchValue = (e) => {
        this.setState({ searchValue: e.target.value });
    };

    triggerSearchOnEnter = (e) => {
        if (e.key === 'Enter') {
            this.setState({ isSearchOn: true });
        }
    };

    removeBook = async (id) => {
        try {
            if (this.state.historySelector === 'requestedBooks') {
                const response = await fetch(`/api/requests/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    this.setState((prevState) => ({
                        requestedBooks: prevState.requestedBooks.filter((book) => book.id !== id)
                    }));
                }
            } else {
                const response = await fetch(`/api/books/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    this.setState((prevState) => ({
                        yourBooksList: prevState.yourBooksList.filter((book) => book.id !== id)
                    }));
                }
            }
        } catch (error) {
            console.error('Error removing book: ', error);
        }
    };

    handleManualBookSubmit = async (e) => {
        e.preventDefault();
        const { customTitle, customAuthor, userId } = this.state;
        const currentUserId = userId || localStorage.getItem('userId');

        if (!customTitle.trim() || !customAuthor.trim()) {
            alert('Please provide both Book Title and Author Name.');
            return;
        }

        try {
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: customTitle.trim(),
                    author: customAuthor.trim(),
                    imageLink: 'https://assets.ccbp.in/frontend/react-js/book-store-img.png',
                    userId: currentUserId,
                }),
            });

            if (response.ok) {
                const addedBook = await response.json();
                this.addBook(addedBook);
                this.setState({ customTitle: '', customAuthor: '', showManualAdd: false, displayAdded: true });
                alert(`"${addedBook.title}" added to MongoDB database for lending!`);
            } else {
                const err = await response.json();
                alert(err.error || 'Failed to add book');
            }
        } catch (err) {
            console.error('Error adding manual book:', err);
            alert('Error connecting to backend database.');
        }
    };

    renderHome = () => {
        const { searchType, searchValue, isSearchOn, displayAdded, showManualAdd, customTitle, customAuthor } = this.state;
        const buttonContent = searchType === 'findBook' ? 'Add Book' : 'Find Book';
        const addSectionContent = searchType === 'findBook'
            ? 'Your Story is on its Way - Get Ready to Turn the Page!!'
            : 'Successfully added your book to MongoDB database for others to borrow.';
        const headContent = searchType === 'findBook' ? 'Find The Books You Love ...' : 'Add Your Book For Others To Trade ...';

        return (
            <div className="home-container">
                {displayAdded ? (
                    <div className="added-container">
                        <h1 className="added-text">{addSectionContent}</h1>
                        <button type="button" onClick={() => this.setState({ displayAdded: false })} className="btn" style={{ marginTop: '20px' }}>
                            Back to Books
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="operation-area">
                            <button type="button" onClick={this.changeSearchType} className="btn">{buttonContent}</button>
                            {searchType === 'addBook' && (
                                <button
                                    type="button"
                                    onClick={() => this.setState((prevState) => ({ showManualAdd: !prevState.showManualAdd }))}
                                    className="btn"
                                    style={{ backgroundColor: showManualAdd ? '#d9534f' : '#28a745', marginLeft: '10px' }}
                                >
                                    {showManualAdd ? 'Search Library' : '+ Add Custom Book'}
                                </button>
                            )}
                            {!showManualAdd && (
                                <input
                                    type="search"
                                    value={searchValue}
                                    className="input-box"
                                    placeholder="Search Books"
                                    onChange={this.updateSearchValue}
                                    onKeyPress={this.triggerSearchOnEnter}
                                />
                            )}
                        </div>

                        {showManualAdd ? (
                            <form onSubmit={this.handleManualBookSubmit} className="manual-book-form" style={{ marginTop: '20px', textAlign: 'center' }}>
                                <h2 style={{ color: '#fff', marginBottom: '15px' }}>Add a New Book to MongoDB</h2>
                                <input
                                    type="text"
                                    placeholder="Book Title"
                                    value={customTitle}
                                    onChange={(e) => this.setState({ customTitle: e.target.value })}
                                    className="input-box"
                                    style={{ display: 'block', margin: '10px auto', width: '280px' }}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Author Name"
                                    value={customAuthor}
                                    onChange={(e) => this.setState({ customAuthor: e.target.value })}
                                    className="input-box"
                                    style={{ display: 'block', margin: '10px auto', width: '280px' }}
                                    required
                                />
                                <button type="submit" className="btn" style={{ marginTop: '10px' }}>Save Book to Database</button>
                            </form>
                        ) : (
                            <>
                                <h1 className="home-header">{headContent}</h1>
                                {isSearchOn && (
                                    <BooksContainer
                                        searchValue={searchValue}
                                        searchType={searchType}
                                        userId={this.state.userId}
                                        addBook={this.addBook}
                                    />
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        );
    };

    renderHistory = () => {
        const { yourBooksList, requestedBooks, historySelector } = this.state;
        const requestedBooksClass = historySelector === 'requestedBooks' ? 'selected-left' : '';
        const yourBooksClass = historySelector === 'yourBooks' ? 'selected-right' : '';
        let historyContainer;
        if (historySelector === 'requestedBooks') {
            historyContainer = requestedBooks.length === 0 ? (
                <p style={{ color: '#fff', fontSize: '18px', marginTop: '20px' }}>No requested books yet.</p>
            ) : (
                requestedBooks.map((eachBook) => <HistoryItem key={eachBook.id} bookDetails={eachBook} removeBook={this.removeBook} />)
            );
        } else {
            historyContainer = yourBooksList.length === 0 ? (
                <p style={{ color: '#fff', fontSize: '18px', marginTop: '20px' }}>You haven't added any books to the database yet.</p>
            ) : (
                yourBooksList.map((eachBook) => <HistoryItem key={eachBook.id} bookDetails={eachBook} removeBook={this.removeBook} />)
            );
        }

        return (
            <div className="history-container">
                <div className="l">
                    <button className={`history-btn left ${requestedBooksClass}`} onClick={this.changeHistoryType}>Requested Books</button>
                    <button className={`history-btn right ${yourBooksClass}`} onClick={this.changeHistoryType}>Your Books</button>
                </div>
                <div className="history-elements-container">
                    {historyContainer}
                </div>
            </div>
        );
    };

    renderAbout = () => {
        return (
            <div className="about-container">
                <h1 className="about-header">ONLINE BOOK EXCHANGE</h1>
                <p>A community platform where book lovers can lend and borrow books seamlessly.</p>
                <br />
                <p>For any help or feedback, please contact us:</p>
                <br />
                <p>Contact Number : +91 8885490454</p>
                <br />
                <p>Email id : 23b81a0518@cvr.ac.in</p>
            </div>
        );
    };

    renderNotAuthenticated = () => {
        return (
            <div className="not-authenticated-container">
                <div className="not-authenticated-card">
                    <div className="card-top-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 4.5C7 3 2.5 4.5 2 5v13.5c.5-.5 5-2 10-.5 5-1.5 9.5 0 10 .5V5c-.5-.5-5-2-10-.5zm-1 12c-4-1-7.5-.5-8 0V6.5c.5-.5 4-1 8 0v10zm10 0c-.5-.5-4-1-8 0V6.5c4-1 7.5-.5 8 0v10z"/>
                        </svg>
                    </div>
                    <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.8rem', fontWeight: '700', margin: '0 0 6px 0', color: '#ffffff', letterSpacing: '1px' }}>
                        BookBridge
                    </h1>
                    <p style={{ color: '#f5c555', fontSize: '0.86rem', margin: '0 0 16px 0', fontWeight: '600', letterSpacing: '0.5px' }}>
                        An Online Book Exchange Platform
                    </p>
                    <p style={{ color: '#cbd5e1', fontSize: '0.92rem', margin: '0 0 22px 0', lineHeight: '1.45' }}>
                        Open a new chapter and start sharing books with fellow readers.
                    </p>
                    <div className="auth-buttons">
                        <Link to="/login" className="btn">Sign In</Link>
                        <Link to="/signup" className="btn btn-secondary">Sign Up</Link>
                    </div>
                </div>
            </div>
        );
    };

    render() {
        const { currentTab, isAuthenticated } = this.state;
        let component = null;

        if (!isAuthenticated) {
            return (
                <Interactive3DBook onLoginSuccess={this.handleAuthSuccess} />
            );
        }

        switch (currentTab) {
            case 'home':
                component = this.renderHome();
                break;
            case 'history':
                component = this.renderHistory();
                break;
            case 'about':
                component = this.renderAbout();
                break;
            default:
                component = this.renderHome();
        }

        return (
            <div className="online-book-exchange-container">
                <Header changeTab={this.changeTab} currentTab={this.state.currentTab} />
                {component}
            </div>
        );
    }
}

const WithLocation = (props) => {
    const location = useLocation();
    return <OnlineBookExchange {...props} location={location} />;
};

export default WithLocation;
