import './index.css'
import binIcon from '../../resources/bin-icon.png'; 

const HistoryItem = (props) => {
    const {bookDetails, removeBook} = props
    const {author, title, imageLink, id} = bookDetails

    const removeCurrentBook = () => {
        removeBook(id)
    } 

    return (
        <div className="history-item-container">
            <img src={imageLink} alt={title} className="book-image" />
            <div className='book-details'>
                <p className="title">{title}</p>
                <p className="author">{author}</p>
            </div>
            <button className="removeBtn" onClick={() => removeCurrentBook()}><img src={binIcon} className="icon" alt="delete-book"/></button>
        </div>
    )
}

export default HistoryItem