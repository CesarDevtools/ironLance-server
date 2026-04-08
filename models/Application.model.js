const { Schema, model } = require("mongoose");

const applicationSchema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User", // Debe ser un usuario con role: "IRONHACKER"
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "IN PROCESS", "REJECTED", "HIRED"],
      default: "PENDING",
    },
    message: {
      type: String,
      maxLength: 3000, // Una introducción para la empresa
    },
  }
);

// Evitar que un Ironhacker aplique dos veces al mismo Job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const Application = model("Application", applicationSchema);

module.exports = Application;