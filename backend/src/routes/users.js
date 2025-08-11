const router = require("express")();
const { BookModel } = require("../models/book");
const { UserModel } = require("../models/user");

const omitPassword = (user) => {
  const { password, ...rest } = user;
  return rest;
};

// Get all users (without passwords)
router.get("/", async (req, res, next) => {
  try {
    const users = await UserModel.find({});
    return res.status(200).json({ users: users.map((user) => omitPassword(user.toJSON())) });
  } catch (err) {
    next(err);
  }
});

// Borrow a book
router.post("/borrow", async (req, res, next) => {
  try {
    const { isbn, userId } = req.body;

    const book = await BookModel.findOne({ isbn });
    if (!book) return res.status(404).json({ error: "Book not found" });

    if (book.borrowedBy.length >= book.quantity) {
      return res.status(400).json({ error: "Book is not available" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (book.borrowedBy.some((id) => id.equals(user._id))) {
      return res.status(400).json({ error: "You've already borrowed this book" });
    }

    book.borrowedBy.push(user._id);
    await book.save();

    return res.status(200).json({
      book: {
        ...book.toJSON(),
        availableQuantity: book.quantity - book.borrowedBy.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Return a book
router.post("/return", async (req, res, next) => {
  try {
    const { isbn, userId } = req.body;

    const book = await BookModel.findOne({ isbn });
    if (!book) return res.status(404).json({ error: "Book not found" });

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!book.borrowedBy.some((id) => id.equals(user._id))) {
      return res.status(400).json({ error: "You need to borrow this book first!" });
    }

    book.borrowedBy = book.borrowedBy.filter((id) => !id.equals(user._id));
    await book.save();

    return res.status(200).json({
      book: {
        ...book.toJSON(),
        availableQuantity: book.quantity - book.borrowedBy.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get books borrowed by logged-in user
router.get("/borrowed-books", async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const books = await BookModel.find({ borrowedBy: req.session.userId });
    return res.status(200).json({ books });
  } catch (err) {
    next(err);
  }
});

// Get profile of logged-in user
router.get("/profile", async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await UserModel.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json({ user: omitPassword(user.toJSON()) });
  } catch (err) {
    next(err);
  }
});

// Login user
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await UserModel.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    // TODO: Use hashed password check here (bcrypt) in production
    if (user.password !== password) {
      return res.status(400).json({ error: "Invalid password" });
    }

    req.session.userId = user._id;
    return res.status(200).json({ user: omitPassword(user.toJSON()) });
  } catch (err) {
    next(err);
  }
});

// Logout user
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    return res.status(200).json({ success: true });
  });
});

module.exports = { router };
