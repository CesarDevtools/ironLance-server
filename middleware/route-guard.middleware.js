// middleware/route-guard.js (continuación)
const Job = require("../models/Job.model");

const verifyJobOwnership = (req, res, next) => {
 const jobId = req.params.id || req.params.jobId; // El ID del Job que viene en la URL

  Job.findById(jobId)
    .then((foundJob) => {
      if (!foundJob) {
        return res.status(404).json({ message: "Job no encontrado" });
      }
      // Comparamos el ID del dueño del job con el ID del token
      // IMPORTANTE: .toString() porque los IDs de Mongo son objetos
      if (foundJob.owner.toString() !== req.payload._id) {
        return res.status(403).json({ message: "No tienes permiso para editar este recurso." });
      }

      next(); // Si todo está bien, pasamos a la ruta
    })
    .catch((err) => next(err));
};

// middleware/route-guard.js

const isCompany = (req, res, next) => {
  if (req.payload.role !== "COMPANY") {
    return res.status(403).json({ message: "Acceso denegado. Debes ser una empresa." });
  }
  next();
};

const isIronhacker = (req, res, next) => {
  if (req.payload.role !== "IRONHACKER") {
    return res.status(403).json({ message: "Acceso denegado. Debes ser un Ironhacker." });
  }
  next();
};

module.exports = {
  isCompany,
  isIronhacker,
  verifyJobOwnership
};