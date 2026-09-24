import React, { Component } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../Header';
import HistoryItem from '../HistoryItem';
import BooksContainer from '../BooksContainer';
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

    changeSearchType = () => {
        this.setState((previousState) => {
            if (previousState.searchType === 'findBook') {
                return { searchType: 'addBook', displayAdded: false };
            }
            return { searchType: 'findBook', displayAdded: false };
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

    renderHome = () => {
        const { searchType, searchValue, isSearchOn, displayAdded } = this.state;
        const buttonContent = searchType === 'findBook' ? 'Add Book' : 'Find Book';
        const addSectionContent = searchType === 'findBook' ? 'Requested the book from the user who listed it.' : 'Added your book for others to trade.';
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
                            <input
                                type="search"
                                value={searchValue}
                                className="input-box"
                                placeholder="Search Books"
                                onChange={this.updateSearchValue}
                                onKeyPress={this.triggerSearchOnEnter}
                            />
                        </div>
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
                <p style={{ color: '#fff', fontSize: '18px', marginTop: '20px' }}>You haven't listed any books yet.</p>
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
                <p>Contact Numbers: +91 6304794105, +91 7995952941</p>
                <br />
                <p>Email: 22r01a05b0@cmrithyderabad.edu.in</p>
            </div>
        );
    };

    renderNotAuthenticated = () => {
        return (
            <div className="not-authenticated-container">
                <h1 className="home-header">Welcome to Online Book Exchange</h1>
                <p>Please log in or sign up to continue</p>
                <div className="auth-buttons">
                    <Link to="/login" className="btn">Login</Link>
                    <Link to="/signup" className="btn">Sign Up</Link>
                </div>
            </div>
        );
    };

    render() {
        const { currentTab, isAuthenticated } = this.state;
        let component = null;

        if (!isAuthenticated) {
            return (
                <div className="online-book-exchange-container">
                    {this.renderNotAuthenticated()}
                </div>
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
