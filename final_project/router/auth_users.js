const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some((user) => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, "access", { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization["username"];
  const isbn = req.params.isbn;
  const review = req.body.review;

  if (!review) {
    return res.status(400).send("Review content is required");
  }

  if (books[isbn]) {
    books[isbn].reviews = books[isbn].reviews || {};
    books[isbn].reviews[username] = review;
    return res.status(200).send(`Review for book with ISBN ${isbn} added/updated successfully.`);
  } else {
    return res.status(404).send("Book not found");
  }
});

// Delete a review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization["username"];
  const isbn = req.params.isbn;

  if (books[isbn] && books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).send(`Review for book with ISBN ${isbn} deleted successfully.`);
  } else {
    return res.status(404).send("Review not found or book not found");
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
