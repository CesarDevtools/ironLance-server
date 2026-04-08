const router = require("express").Router();
const Application = require("../models/Application.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const { isIronhacker, isCompany, verifyJobOwnership } = require("../middleware/route-guard.middleware");

// 1. POST /api/applications - Aplicar a una oferta
// Solo accesible para IRONHACKERS
router.post("/applications", isAuthenticated, isIronhacker, (req, res, next) => {
  const { job, message } = req.body;
  const applicant = req.payload._id; // ID del Ironhacker 

  Application.create({ job, applicant, message })
    .then((newApp) => res.status(201).json(newApp))
    .catch((err) => {
      // Si el error es por el índice único (ya aplicó)
      if (err.code === 11000) {
        return res.status(400).json({ message: "Ya has aplicado a esta oferta anteriormente." });
      }
      next(err);
    });
});

// 2. GET /api/my-applications - Ver MIS aplicaciones (como Ironhacker)
router.get("/my-applications", isAuthenticated, isIronhacker, (req, res, next) => {
  const applicantId = req.payload._id;

  Application.find({ applicant: applicantId })
    .populate({
      path: "job",
      populate: { path: "owner", select: "companyName logo" } // Deep populate para ver quién es la empresa
    })
    .then((apps) => res.status(200).json(apps))
    .catch((err) => next(err));
});

// 3. GET /api/jobs/:jobId/applications - Ver aplicantes de un Job concreto (como Empresa)
router.get("/jobs/:jobId/applications", isAuthenticated, isCompany, verifyJobOwnership, (req, res, next) => {
  const { jobId } = req.params;

  Application.find({ job: jobId })
    .populate("applicant", "firstName lastName bootcamp portfolioUrl linkedinUrl logo")
    .then((apps) => res.status(200).json(apps))
    .catch((err) => next(err));
});

// 4. PUT /api/applications/:id - Cambiar el estado de una application (Empresa)
router.put("/applications/:id", isAuthenticated, isCompany, (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  // 1. Buscamos la aplicación y "poblamos" el Job para ver quién es el dueño
  Application.findById(id)
    .populate("job")
    .then((foundApp) => {
      if (!foundApp) {
        return res.status(404).json({ message: "Aplicación no encontrada" });
      }

      // 2. Verificamos si el usuario logueado es el dueño del Job relacionado
      if (foundApp.job.owner.toString() !== req.payload._id) {
        return res.status(403).json({ message: "No tienes permiso para gestionar esta aplicación." });
      }

      // 3. Si es el dueño, procedemos a actualizar
      return Application.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    })
    .then((updatedApp) => res.status(200).json(updatedApp))
    .catch((err) => next(err));
});
module.exports = router;