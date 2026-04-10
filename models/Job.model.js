const { Schema, model } = require("mongoose");

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true
    },
    requirements: [String], // Array para listar habilidades (ej: ["React", "Node", "English"])
    salary: {
      type: String,
      default: "Negotiable.",
    },
    level: {
      type: String,
      enum: ["Entry", "Intermediate", "Expert"],
      default: "Intermediate",
      required: true
    },
    location: {
      type: String,
      default: "Remote",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User", // Debe ser un usuario con role: "COMPANY"
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true // Esto añade automáticamente createdAt y updatedAt
  }
);

const Job = model("Job", jobSchema);

module.exports = Job;