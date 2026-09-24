import './index.css';

const BookItem = (props) => {
    const { bookDetails, addBookInner, searchType } = props;
    const { author, title, imageLink, username, mobileNumber } = bookDetails;

    const handleClick = async () => {
        if (searchType === 'addBook') {
            await addBookInner(bookDetails);
        } else if (searchType === 'findBook') {
            alert(`Book added by: ${username}\nContact: ${mobileNumber}`);
            await addBookInner(bookDetails)
        }
    };

    return (
        <div className="book-item-container" onClick={handleClick}>
            <img src={imageLink} alt={title} className="book-image" />
            <p className="title">{title}</p>
            <p className="author">{author}</p>
        </div>
    );
};

export default BookItem;
