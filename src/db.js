import { v4 as uuidv4 } from 'uuid';

const users = [];
const lendBooks = [];
const borrowRequests = [];

// Add a new user
export const addUser = (username, password) => {
  const newUser = {
    id: uuidv4(),
    username,
    password, 
    booksToLend: [],
    booksToBorrow: []
  };
  users.push(newUser);
  console.log(users)
  return newUser;
  };
  
  // Find user by username
  export const findUser = (username) => {
    console.log(users)
    return users.find(user => user.username === username);
    };
    
    // Add a book to lend
    export const addBookToLend = (userId, bookTitle, bookAuthor) => {
        const book = { id: uuidv4(), title: bookTitle, author: bookAuthor, userId };
        lendBooks.push(book);
        return book;
        };
        
        // Add a borrow request
        export const addBorrowRequest = (userId, bookId) => {
            const request = { id: uuidv4(), userId, bookId };
            borrowRequests.push(request);
            return request;
            };
            
            // Export the arrays for reference
            export const getUsers = () => users;
            export const getLendBooks = () => lendBooks;
            export const getBorrowRequests = () => borrowRequests;
            
            console.log(users)