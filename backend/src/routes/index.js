// routes/index.js
const express = require("express")
const bookRouter = require("./book").router
const userRouter = require("./users").router

const apiV1 = express.Router()

// Register routes
apiV1.use("/book", bookRouter)
apiV1.use("/user", userRouter)

module.exports = { apiV1 }
