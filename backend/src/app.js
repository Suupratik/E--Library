const dotenv = require("dotenv")
dotenv.config()

const express = require("express")
const morgan = require("morgan")
const cookieParser = require("cookie-parser")
const sessions = require("express-session")
const mongoose = require("mongoose")
const cors = require("cors")
const { apiV1 } = require("./routes")
const { connectDb } = require("./db")
const { UserModel } = require("./models/user")

// Fix Mongoose strictQuery deprecation warning
mongoose.set("strictQuery", false)

const app = express()

// ---- CORS Configuration ----
const allowedOrigins = [
  "https://supratiklibrary.netlify.app", // production
  "http://localhost:3000" // local dev
]

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true) // allow Postman/curl
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error("CORS policy: Origin not allowed"))
  },
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.options("*", cors(corsOptions))
// ----------------------------

app.use(morgan("dev"))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))

app.use(
  sessions({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
    resave: false
  })
)

app.use("/v1", apiV1)

app.use((req, res) => {
  return res.status(404).json({ error: "Route not found" })
})

app.use((err, req, res, next) => {
  console.error("Error:", err)
  return res.status(500).json({ error: "Unknown server error" })
})

const PORT = process.env.PORT || 8080

connectDb()
  .then(async () => {
    const admin = await UserModel.findOne({ username: "admin" })
    if (!admin) {
      await UserModel.create({ username: "admin", password: "admin@6", role: "admin" })
    }
    const guest = await UserModel.findOne({ username: "guest" })
    if (!guest) {
      await UserModel.create({ username: "guest", password: "guest@6", role: "guest" })
    }
  })
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server is listening on http://localhost:${PORT}`)
    )
  })
  .catch((err) => {
    console.error("Failed to connect to database", err)
    process.exit(1)
  })
