const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User.model");

const { isAuthenticated } = require("../middleware/jwt.middleware.js");

// How many rounds should bcrypt run the salt (default - 10 rounds)
const saltRounds = 10;

/*****************************************************************/
/*****POST /auth/signup  - Creates a new user in the database*****/
/*****************************************************************/
router.post("/signup", (req, res, next) => {
  const {
    email,
    password,
    role,
    firstName, // Campos Ironhacker
    lastName,
    bootcamp,
    campus,
    portfolioUrl,
    linkedinUrl,
    companyName, // Campos Empresa
    website,
    logo,
  } = req.body;

  if (email === "" || password === "" || !role) {
    res.status(400).json({ message: "Provide email, password" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }
  // Check the users collection if a user with the same email already exists
  User.findOne({ email })
    .then((foundUser) => {
      // If the user with the same email already exists, send an error response
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      // If email is unique, proceed to hash the password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      return User.create({
        email,
        password: hashedPassword,
        role,
        firstName,
        lastName,
        bootcamp,
        campus,
        portfolioUrl,
        linkedinUrl,
        companyName,
        website,
        logo,
      });
    })
    .then((createdUser) => {
      // 4. IMPORTANTE: En el objeto que devolvemos al front, incluimos el role
      const { email, _id, role: userRole } = createdUser;
      const user = { email, _id, role: userRole };

      res.status(201).json({ user: user });
    })
    .catch((err) => next(err));
});

/*********************************************************************/
/**POST  /auth/login - Verifies email and password and returns a JWT**/
/*********************************************************************/

router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  if (email === "" || password === "") {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  // Check the users collection if a user with the same email exists
  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        res.status(401).json({ message: "User not found." });
        return;
      }

      // Compare the provided password with the one saved in the database
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        // Deconstruct the user object to omit the password
        const { _id, email, role, firstName, companyName } = foundUser;

        // Create an object that will be set as the token payload
        const payload = {
          _id,
          email,
          role,
          name: role === "IRONHACKER" ? firstName : companyName,
        };

        // Create a JSON Web Token and sign it
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });

        // Send the token as the response
        res.status(200).json({ authToken: authToken });
      } else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
    })
    .catch((err) => next(err));
});

// PUT /auth/update - Actualiza los datos y genera un nuevo token
router.put("/update", isAuthenticated, (req, res, next) => {
  const userId = req.payload._id;
  const {
    firstName, 
    lastName,
    about, 
    bootcamp,
    campus,
    portfolioUrl,
    linkedinUrl, 
    companyName, 
    website,
    logo, 
  } = req.body;

  // 1. Actualizamos el usuario
  User.findByIdAndUpdate(
    userId,
    {
      firstName,
      lastName,
      about,
      bootcamp,
      campus,
      portfolioUrl,
      linkedinUrl,
      companyName,
      website,
      logo,
    },
    { new: true, runValidators: true },
  )
    .then((updatedUser) => {
      // 2. Extraemos los datos necesarios para el NUEVO payload
      const { _id, email, role, firstName, companyName } = updatedUser;

      // 3. Creamos el nuevo payload 
      const payload = {
        _id,
        email,
        role,
        name: role === "IRONHACKER" ? firstName : companyName,
      };

      // 4. Firmamos el nuevo token
      const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: "6h",
      });

      // 5. Enviamos el nuevo token al frontend
      res.status(200).json({ authToken: authToken });
    })
    .catch((err) => next(err));
});

// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get("/verify", isAuthenticated, (req, res, next) => {
  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and is made available on `req.payload`
  console.log(`req.payload`, req.payload);

  // Send back the token payload object containing the user data
  res.status(200).json(req.payload);
});

module.exports = router;
