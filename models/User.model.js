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
  // Campo de visibilidad para el board de Ironhackers
  isPublic: {
    type: Boolean,
    default: false
  },
  about: { 
    type: String, 
    maxLength: 3000
  },
  // Campos para Ironhackers
  firstName: String,
  lastName: String,
  bootcamp: {
    type: String,
    enum: [
      "Web Development",
      "UX/UI Design",
      "Cloud Engineering",
      "Machine Learning",
      "Data Analytics",
      "AI Consultant",
      "Cybersecurity",
      "Data Engineering"
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