import React from 'react';
import './index.css';

const DEFAULT_BOOK_COVER = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&q=80';

const BookItem = (props) => {
    const { bookDetails, addBookInner, searchType } = props;
    const { author, title, imageLink, username } = bookDetails;

    const handleClick = async () => {
        await addBookInner(bookDetails);
    };

    const actionText = searchType === 'findBook' ? 'Borrow Book' : '+ Add Book';

    return (
        <div className="book-item-container" onClick={handleClick}>
            <div className="image-wrapper">
                <img
                    src={imageLink || DEFAULT_BOOK_COVER}
                    alt={title}
                    className="book-image"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_BOOK_COVER;
                    }}
                />
            </div>
            <div className="book-info">
                <p className="title" title={title}>{title}</p>
                <p className="author">by {author}</p>
                {username && searchType === 'findBook' && (
                    <p className="lender-tag">👤 {username}</p>
                )}
            </div>
            <button type="button" className="book-action-btn">
                {actionText}
            </button>
        </div>
    );
};

export default BookItem;
