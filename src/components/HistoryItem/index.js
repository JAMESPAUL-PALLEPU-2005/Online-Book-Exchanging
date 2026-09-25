import React from 'react';
import './index.css';
import binIcon from '../../resources/bin-icon.png'; 

const DEFAULT_BOOK_COVER = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&q=80';

const HistoryItem = (props) => {
    const { bookDetails, removeBook } = props;
    const { author, title, imageLink, id } = bookDetails;

    const removeCurrentBook = () => {
        removeBook(id);
    }; 

    return (
        <div className="history-item-container">
            <div className="history-image-wrapper">
                <img
                    src={imageLink || DEFAULT_BOOK_COVER}
                    alt={title}
                    className="history-book-image"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_BOOK_COVER;
                    }}
                />
            </div>
            <div className="history-book-details">
                <p className="history-title" title={title}>{title}</p>
                <p className="history-author">by {author}</p>
            </div>
            <button className="removeBtn" onClick={removeCurrentBook} title="Remove Book">
                <img src={binIcon} className="remove-icon" alt="delete-book"/>
            </button>
        </div>
    );
};

export default HistoryItem;