const router = require("express").Router();
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const { isCompany } = require("../middleware/route-guard.middleware");

// GET /api/users/ironhackers
// Obtiene la lista de alumnos que han decidido ser públicos
router.get("/ironhackers", isAuthenticated, isCompany, (req, res, next) => {
  User.find({ role: "IRONHACKER", isPublic: true })
    .select("firstName lastName bootcamp campus about portfolioUrl linkedinUrl logo")
    .then((ironhackers) => {
      res.status(200).json(ironhackers);
    })
    .catch((err) => {
      console.error("Error fetching ironhackers board", err);
      next(err);
    });
});

// GET /api/users/:userId
// Obtiene los detalles de un usuario específico por su ID
router.get("/:userId", isAuthenticated, (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId)
    .select("-password")
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    })
    .catch((err) => {
      console.error("Error fetching user details", err);
      next(err);
    });
});

module.exports = router;