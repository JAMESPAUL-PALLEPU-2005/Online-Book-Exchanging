import './index.css';

const BookItem = (props) => {
    const { bookDetails, addBookInner, searchType } = props;
    const { author, title, imageLink, username, email, mobileNumber } = bookDetails;

    const handleClick = async () => {
        if (searchType === 'addBook') {
            await addBookInner(bookDetails);
        } else if (searchType === 'findBook') {
            const emailInfo = email ? `\nEmail: ${email}` : '';
            alert(`Book listed by: ${username}${emailInfo}\nMobile: ${mobileNumber}`);
            await addBookInner(bookDetails);
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
