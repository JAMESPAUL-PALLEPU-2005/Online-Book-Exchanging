import React, { Component } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../Header';
import HistoryItem from '../HistoryItem';
import { firestore, doc, deleteDoc } from '../../firebase';
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
        userId: '',
    };

    componentDidMount() {
        const { state } = this.props.location;
        if (state && state.userId) {
            this.setState({ userId: state.userId });
        }
    }

    changeSearchType = () => {
        this.setState((previousState) => {
            if (previousState.searchType === 'findBook') {
                return { searchType: 'addBook' };
            }
            return { searchType: 'findBook' };
        });
    };

    changeHistoryType = () => {
        this.setState((prevState) => {
            if (prevState.historySelector === 'requestedBooks') {
                return { historySelector: 'yourBooks' };
            } else if (prevState.historySelector === 'yourBooks') {
                return { historySelector: 'requestedBooks' };
            }
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
                this.setState((prevState) => ({
                    requestedBooks: prevState.requestedBooks.filter((book) => book.id !== id)
                }));
            } else {
                // Remove the book from Firestore
                await deleteDoc(doc(firestore, 'books', id));
            }
        } catch (error) {
            console.error("Error removing book: ", error);
        }
    };
    

    renderHome = () => {
        const { searchType, searchValue, isSearchOn, displayAdded } = this.state;
        const buttonContent = searchType === 'findBook' ? 'Add Book' : 'Find Book';
        const addSectionContent = searchType === 'findBook' ? 'Requested the book to the people who added the book.' : 'Added your books for others to find.';
        const headContent = searchType === 'findBook' ? 'Find The Books You Love ...' : 'Add Your Book For Others To Trade ...';

        return (
            <div className="home-container">
                {displayAdded ? (
                    <div className="added-container">
                        <h1 className="added-text">{addSectionContent}</h1>
                    </div>
                ) : (
                    <>
                        <div className="operation-area">
                            <button type="button" onClick={this.changeSearchType} className="btn">{buttonContent}</button>
                            <input
                                type="search"
                                value={searchValue}
                                className="input-box"
                                placeholder='Search Books'
                                onChange={this.updateSearchValue}
                                onKeyPress={this.triggerSearchOnEnter}
                            />
                        </div>
                        <h1 className="home-header">{headContent}</h1>
                        {isSearchOn && <BooksContainer searchValue={searchValue} searchType={searchType} userId={this.state.userId} addBook={this.addBook} />}
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
            historyContainer = requestedBooks.map((eachBook) => <HistoryItem key={eachBook.id} bookDetails={eachBook} removeBook={this.removeBook} />);
        } else {
            historyContainer = yourBooksList.map((eachBook) => <HistoryItem key={eachBook.id} bookDetails={eachBook} removeBook={this.removeBook} />);
        }

        return (
            <div className="history-container">
                <div className="l">
                    <button className={`history-btn left ${requestedBooksClass}`} onClick={this.changeHistoryType}>Requested Books</button>
                    <button className={`history-btn right ${yourBooksClass}`} onClick={this.changeHistoryType}>Your Books</button>
                </div>
                <div className='history-elements-container'>
                    {historyContainer}
                </div>
            </div>
        );
    };

    renderAbout = () => {
        return (
            <div className='about-container'>
                <h1 className='about-header'>ONLINE BOOK EXCHANGE PROTOTYPE</h1>
                <p>A place where you can lend and borrow books.</p>
                <br></br><p>For any Help please contact us.</p><br></br>
                <p>Our Details:8885490454</p>
                <br></br><p>email:23b81a0518@cvr.ac.in</p>
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
                <Header changeTab={this.changeTab} currentTab={this.state.currentTab}/>
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
