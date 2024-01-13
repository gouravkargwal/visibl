const express = require("express");
const { main } = require("./models/index");
const productRoute = require("./router/product");
const storeRoute = require("./router/store");
const purchaseRoute = require("./router/purchase");
const salesRoute = require("./router/sales");
const cors = require("cors");
const User = require("./models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
const PORT = 4000;
main();
app.use(express.json());
app.use(cors());

function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (token == null) return res.sendStatus(401); // if there's no token

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // if the token is invalid
    req.user = user;
    next(); // proceed to the next middleware/function
  });
}

// ------------- Signin --------------

app.post("/login", async (req, res) => {
  try {
    // Find user by email
    const user = await User.findOne({ email: req.body.email });

    // Check if user exists and password is correct
    if (user && (await bcrypt.compare(req.body.password, user.password))) {
      // Create JWT token
      const token = jwt.sign({ id: user._id }, "your_jwt_secret", {
        expiresIn: "2h",
      });

      // Set token in HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // use secure flag in production
        maxAge: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
      });

      // Send response
      res.send({ message: "Login successful", user: user._id });
    } else {
      res.status(401).send("Invalid Credentials");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error during login");
  }
});
app.post("/register", async (req, res) => {
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).send("User already exists with the given email.");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Create a new user
    let registerUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      phoneNumber: req.body.phoneNumber,
      imageUrl: req.body.imageUrl,
    });

    // Save the user and send response
    const newUser = await registerUser.save();

    // After successful registration, create a JWT token
    const token = jwt.sign({ id: newUser._id }, "your_jwt_secret", {
      expiresIn: "2h",
    });

    // Set token in an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // use secure flag in production
      maxAge: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
    });

    res.status(200).send({ message: "Signup successful", user: newUser });
  } catch (err) {
    // Handle validation errors
    if (err.name === "ValidationError") {
      let errors = {};

      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });

      return res.status(400).send(errors);
    }

    // Handle other errors
    res.status(500).send("Error during registration: " + err.message);
  }
});

app.get("/verifyToken", (req, res) => {
  const token = req.cookies.token; // Assuming the token is stored in a cookie
  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    // Optionally, you can fetch user details from the database using decoded.id
    // const user = await User.findById(decoded.id);
    // If user details are needed, send them back
    res.send({ valid: true, user: decoded.id });
  } catch (error) {
    res.status(400).send("Invalid token.");
  }
});

// Store API
app.use("/api/store", authenticateToken, storeRoute);

// Products API
app.use("/api/product", authenticateToken, productRoute);

// Purchase API
app.use("/api/purchase", authenticateToken, purchaseRoute);

// Sales API
app.use("/api/sales", authenticateToken, salesRoute);

// Here we are listening to the server
app.listen(PORT, () => {
  console.log("I am live again");
});
