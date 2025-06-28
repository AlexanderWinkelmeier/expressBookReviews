const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const public_users = express.Router();

public_users.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username and password are provided
  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  // Check if username already exists
  if (users.find((user) => user.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  // Register the new user
  users.push({ username: username, password: password });
  return res.status(201).json({ message: 'User registered successfully' });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    res.send(JSON.stringify(books[isbn], null, 4));
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const bookKeys = Object.keys(books);
  let booksByAuthor = {};

  bookKeys.forEach((key) => {
    if (books[key].author === author) {
      booksByAuthor[key] = books[key];
    }
  });

  if (Object.keys(booksByAuthor).length > 0) {
    res.send(JSON.stringify(booksByAuthor, null, 4));
  } else {
    res.status(404).json({ message: 'No books found by this author' });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const bookKeys = Object.keys(books);
  let booksByTitle = {};

  bookKeys.forEach((key) => {
    if (books[key].title === title) {
      booksByTitle[key] = books[key];
    }
  });

  if (Object.keys(booksByTitle).length > 0) {
    res.send(JSON.stringify(booksByTitle, null, 4));
  } else {
    res.status(404).json({ message: 'No books found with this title' });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    res.send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
});

// Get the book list available in the shop using Promise callbacks
public_users.get('/books-promise', function (req, res) {
  // Simulate an async operation using Promise
  const getBooks = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (books) {
        resolve(books);
      } else {
        reject(new Error('Books not found'));
      }
    }, 1000); // Simulate delay
  });

  getBooks
    .then((booksData) => {
      res.send(JSON.stringify(booksData, null, 4));
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: 'Error retrieving books', error: error.message });
    });
});

// Get the book list available in the shop using async-await
public_users.get('/books-async', async function (req, res) {
  try {
    // Simulate an async operation using async-await
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (books) {
            resolve(books);
          } else {
            reject(new Error('Books not found'));
          }
        }, 1000); // Simulate delay
      });
    };

    const booksData = await getBooks();
    res.send(JSON.stringify(booksData, null, 4));
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving books', error: error.message });
  }
});

// Get the book list using Axios (simulating external API call)
public_users.get('/books-axios', async function (req, res) {
  try {
    // In a real scenario, this would be an external API call
    // For demonstration, we'll simulate it by making a call to our own endpoint
    const response = await axios.get('http://localhost:5000/');
    res.send(response.data);
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving books with Axios',
      error: error.message,
    });
  }
});

// Get book details based on ISBN using Promise callbacks
public_users.get('/isbn-promise/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Simulate an async operation using Promise
  const getBookByISBN = new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check both string and number keys for compatibility
      if (books[isbn] || books[parseInt(isbn)]) {
        const book = books[isbn] || books[parseInt(isbn)];
        resolve(book);
      } else {
        reject(new Error('Book not found'));
      }
    }, 1000); // Simulate delay
  });

  getBookByISBN
    .then((bookData) => {
      res.send(JSON.stringify(bookData, null, 4));
    })
    .catch((error) => {
      res.status(404).json({ message: 'Book not found', error: error.message });
    });
});

// Get book details based on ISBN using async-await
public_users.get('/isbn-async/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    // Simulate an async operation using async-await
    const getBookByISBN = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Check both string and number keys for compatibility
          if (books[isbn] || books[parseInt(isbn)]) {
            const book = books[isbn] || books[parseInt(isbn)];
            resolve(book);
          } else {
            reject(new Error('Book not found'));
          }
        }, 1000); // Simulate delay
      });
    };

    const bookData = await getBookByISBN();
    res.send(JSON.stringify(bookData, null, 4));
  } catch (error) {
    res.status(404).json({ message: 'Book not found', error: error.message });
  }
});

// Get book details based on ISBN using Axios (simulating external API call)
public_users.get('/isbn-axios/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    // In a real scenario, this would be an external API call
    // For demonstration, we'll simulate it by making a call to our own endpoint
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    res.send(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ message: 'Book not found' });
    } else {
      res.status(500).json({
        message: 'Error retrieving book details with Axios',
        error: error.message,
      });
    }
  }
});

// Get book details based on Author using Promise callbacks
public_users.get('/author-promise/:author', function (req, res) {
  const author = req.params.author;

  // Simulate an async operation using Promise
  const getBooksByAuthor = new Promise((resolve, reject) => {
    setTimeout(() => {
      const bookKeys = Object.keys(books);
      let booksByAuthor = {};

      bookKeys.forEach((key) => {
        if (books[key].author === author) {
          booksByAuthor[key] = books[key];
        }
      });

      if (Object.keys(booksByAuthor).length > 0) {
        resolve(booksByAuthor);
      } else {
        reject(new Error('No books found by this author'));
      }
    }, 1000); // Simulate delay
  });

  getBooksByAuthor
    .then((booksData) => {
      res.send(JSON.stringify(booksData, null, 4));
    })
    .catch((error) => {
      res
        .status(404)
        .json({ message: 'No books found by this author', error: error.message });
    });
});

// Get book details based on Author using async-await
public_users.get('/author-async/:author', async function (req, res) {
  const author = req.params.author;

  try {
    // Simulate an async operation using async-await
    const getBooksByAuthor = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const bookKeys = Object.keys(books);
          let booksByAuthor = {};

          bookKeys.forEach((key) => {
            if (books[key].author === author) {
              booksByAuthor[key] = books[key];
            }
          });

          if (Object.keys(booksByAuthor).length > 0) {
            resolve(booksByAuthor);
          } else {
            reject(new Error('No books found by this author'));
          }
        }, 1000); // Simulate delay
      });
    };

    const booksData = await getBooksByAuthor();
    res.send(JSON.stringify(booksData, null, 4));
  } catch (error) {
    res
      .status(404)
      .json({ message: 'No books found by this author', error: error.message });
  }
});

// Get book details based on Author using Axios (simulating external API call)
public_users.get('/author-axios/:author', async function (req, res) {
  const author = req.params.author;

  try {
    // In a real scenario, this would be an external API call
    // For demonstration, we'll simulate it by making a call to our own endpoint
    const response = await axios.get(
      `http://localhost:5000/author/${encodeURIComponent(author)}`
    );
    res.send(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ message: 'No books found by this author' });
    } else {
      res.status(500).json({
        message: 'Error retrieving book details by author with Axios',
        error: error.message,
      });
    }
  }
});

// Get book details based on Title using Promise callbacks
public_users.get('/title-promise/:title', function (req, res) {
  const title = req.params.title;

  // Simulate an async operation using Promise
  const getBooksByTitle = new Promise((resolve, reject) => {
    setTimeout(() => {
      const bookKeys = Object.keys(books);
      let booksByTitle = {};

      bookKeys.forEach((key) => {
        if (books[key].title === title) {
          booksByTitle[key] = books[key];
        }
      });

      if (Object.keys(booksByTitle).length > 0) {
        resolve(booksByTitle);
      } else {
        reject(new Error('No books found with this title'));
      }
    }, 1000); // Simulate delay
  });

  getBooksByTitle
    .then((booksData) => {
      res.send(JSON.stringify(booksData, null, 4));
    })
    .catch((error) => {
      res.status(404).json({ message: 'No books found with this title', error: error.message });
    });
});

// Get book details based on Title using async-await
public_users.get('/title-async/:title', async function (req, res) {
  const title = req.params.title;

  try {
    // Simulate an async operation using async-await
    const getBooksByTitle = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const bookKeys = Object.keys(books);
          let booksByTitle = {};

          bookKeys.forEach((key) => {
            if (books[key].title === title) {
              booksByTitle[key] = books[key];
            }
          });

          if (Object.keys(booksByTitle).length > 0) {
            resolve(booksByTitle);
          } else {
            reject(new Error('No books found with this title'));
          }
        }, 1000); // Simulate delay
      });
    };

    const booksData = await getBooksByTitle();
    res.send(JSON.stringify(booksData, null, 4));
  } catch (error) {
    res.status(404).json({ message: 'No books found with this title', error: error.message });
  }
});

// Get book details based on Title using Axios (simulating external API call)
public_users.get('/title-axios/:title', async function (req, res) {
  const title = req.params.title;

  try {
    // In a real scenario, this would be an external API call
    // For demonstration, we'll simulate it by making a call to our own endpoint
    const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
    res.send(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ message: 'No books found with this title' });
    } else {
      res.status(500).json({
        message: 'Error retrieving book details by title with Axios',
        error: error.message,
      });
    }
  }
});

module.exports.general = public_users;
