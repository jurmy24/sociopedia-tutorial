import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { createPost } from "./controllers/posts.js";
import { register } from "./controllers/auth.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url); // stores the path to this index.js file
const __dirname = path.dirname(__filename); // stores the path to this directory
dotenv.config(); // loads environment variables from a .env file in the project directory
const app = express(); // creates instance of Express.js application
app.use(express.json()); // adds middleware to parse incoming requests as json data
app.use(helmet()); // adds middleware to secure application by setting HTTP headers
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // configures helmet to allow cross-origin requests for all resources
app.use(morgan("common")); // adds middleware that logs info about incoming requests to server
app.use(bodyParser.json({ limit: "30mb", extended: true })); // adds middleware that parses incoming request bodies to easier access the data sent in the request
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true })); // adds middleware that parses url encoded data
app.use(cors); // adds middleware that allows you to define which origins can access your servers resources
app.use("/assets", express.static(path.join(__dirname, "public/assets"))); // adds middleware that can serve static files from public/assets when the server receives requests with the /assets path

/* FILE STORAGE */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb is a callback function
    cb(null, "public/assets"); // null indicates no error
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001; // the second one is a backup
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port ${PORT}`));

    /* APP DATA ADDED ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch((error) => console.log(`${error} did not connect`));
