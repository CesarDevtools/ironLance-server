const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["IRONHACKER", "COMPANY"],
    required: true,
  },
  // Campos para Ironhackers
  firstName: String,
  lastName: String,
  bootcamp: {
    type: String,
    enum: [
      "Web Development",
      "UX/UI",
      "Cloud Engineer",
      "Data Science and Machine Learning",
    ],
  },
  campus: { type: String, enum: ["Madrid", "Barcelona", "Remote"] },
  portfolioUrl: String,
  linkedinUrl: String,
  // Campos para Empresas
  companyName: String,
  website: String,
  logo: { type: String },
});

const User = model("User", userSchema);

module.exports = User;
