const router = require("express").Router();
const Application = require("../models/Application.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const { isIronhacker, isCompany, verifyJobOwnership } = require("../middleware/route-guard.middleware");
const Job = require("../models/Job.model");

// 1 POST /api/applications - Aplicar a una oferta
router.post("/applications", isAuthenticated, isIronhacker, (req, res, next) => {
  const { job, message } = req.body; // 'job' es el ID del puesto
  const applicant = req.payload._id;

  // 1. Verificación Crítica: ¿Existe el Job?
  Job.findById(job)
    .then((foundJob) => {
      if (!foundJob) {
        // Si el job no existe, devolvemos error 404 y NO creamos la aplicación
        return res.status(404).json({ message: "This job offer no longer exists." });
      }

      //Está la oferta activa
      if (!foundJob.active) {
        return res.status(400).json({ message: "This job offer is no longer accepting applications." });
      }

      // Si todo está bien, procedemos a crear la aplicación
      return Application.create({ job, applicant, message });
    })
    .then((newApp) => {
      if (newApp) res.status(201).json(newApp);
    })
    .catch((err) => {
      if (err.code === 11000) {
        return res.status(400).json({ message: "You have already applied for this job offer." });
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
        return res.status(404).json({ message: "Application not found." });
      }

      // 2. Verificamos si el usuario logueado es el dueño del Job relacionado
      if (foundApp.job.owner.toString() !== req.payload._id) {
        return res.status(403).json({ message: "You do not have permission to manage this application." });
      }

      // 3. Si es el dueño, procedemos a actualizar
      return Application.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    })
    .then((updatedApp) => res.status(200).json(updatedApp))
    .catch((err) => next(err));
});

module.exports = router;