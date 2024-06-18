const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  console.log("Request body:", req.body); // Log the request body for debugging

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username, password });
      console.log("User registered successfully:", { username, password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      console.log("User already exists:", username);
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  console.log("Unable to register user. Missing username or password.");
  return res.status(404).json({ message: "Unable to register user." });
});


// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    const getBooks = async () => {
      return books;
    };

    const allBooks = await getBooks();
    res.send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    res.status(500).send("Error fetching books");
  }
});


// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  const findBookByIsbn = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("ISBN not found");
    }
  });

  findBookByIsbn
    .then((book) => res.send(book))
    .catch((error) => res.status(404).send(error));
});


// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  const author = req.params.author;

  try {
    const findByAuthor = async () => {
      return Object.values(books).filter((book) => book.author === author);
    };

    const booksByAuthor = await findByAuthor();
    if (booksByAuthor.length > 0) {
      res.send(booksByAuthor);
    } else {
      res.status(404).send("Books not found for this author");
    }
  } catch (error) {
    res.status(500).send("Error fetching books by author");
  }
});


// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;

  const findByTitle = new Promise((resolve, reject) => {
    const booksByTitle = Object.values(books).filter((book) => book.title === title);
    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      reject("Books not found for this title");
    }
  });

  findByTitle
    .then((books) => res.send(books))
    .catch((error) => res.status(404).send(error));
});


//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const review = books[isbn]?.reviews;
  if (review) {
    res.send(review);
  } else {
    res.send("Review is not found for this isbn");
  }
});

module.exports.general = public_users;