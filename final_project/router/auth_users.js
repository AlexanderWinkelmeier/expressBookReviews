const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  // Check if username exists in users array
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  // Check if username and password match the records
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  // Check if username and password are provided
  if (!username) {
    return res.status(400).json({message: "Username is required"});
  }
  
  if (!password) {
    return res.status(400).json({message: "Password is required"});
  }
  
  // Check if user exists and credentials are valid
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({
      data: username
    }, 'access', { expiresIn: 60 * 60 });
    
    // Store access token and username in session
    req.session.authorization = {
      accessToken, username
    };
    
    return res.status(200).json({message: "User successfully logged in"});
  } else {
    return res.status(401).json({message: "Invalid username or password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;
  
  // Check if review is provided
  if (!review) {
    return res.status(400).json({message: "Review is required"});
  }
  
  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  
  // Add or modify the review for this user
  books[isbn].reviews[username] = review;
  
  return res.status(200).json({message: "Review added/updated successfully"});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  
  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  
  // Check if user has a review for this book
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({message: "Review not found for this user"});
  }
  
  // Delete the user's review
  delete books[isbn].reviews[username];
  
  return res.status(200).json({message: "Review deleted successfully"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
