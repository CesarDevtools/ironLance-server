const router = require("express").Router();
const Job = require("../models/Job.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const { isCompany, verifyJobOwnership } = require("../middleware/route-guard.middleware");

// GET /api/jobs - Lista todas las ofertas (Público)
router.get("/jobs", (req, res, next) => {
  Job.find({ active: true })
    .populate("owner", "companyName logo") 
    .then((jobs) => res.status(200).json(jobs))
    .catch((err) => next(err));
});

// GET /api/jobs/:id - Detalle de una oferta (Público)
router.get("/jobs/:id", (req, res, next) => {
  const { id } = req.params;

  Job.findById(id)
    .populate("owner", "companyName logo website about") 
    .then((job) => {
      if (!job) {
        return res.status(404).json({ message: "Puesto no encontrado" });
      }
      res.status(200).json(job);
    })
    .catch((err) => next(err));
});

// POST /api/jobs - Crear oferta (Solo Empresas)
router.post("/jobs", isAuthenticated, isCompany, (req, res, next) => {
  const { title, description, requirements, salary, location,level } = req.body;
  const owner = req.payload._id; // El ID del token JWT

  Job.create({ title, description, requirements, salary, location, level, owner })
    .then((newJob) => res.status(201).json(newJob))
    .catch((err) => next(err));
});

// PUT /api/jobs/:id - Editar oferta (Solo Empresa Dueña)
router.put("/jobs/:id", isAuthenticated, isCompany, verifyJobOwnership, (req, res, next) => {
  const { id } = req.params;

  Job.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
    .then((updatedJob) => res.status(200).json(updatedJob))
    .catch((err) => next(err));
});

// DELETE /api/jobs/:id - Borrar oferta y sus aplicaciones (Solo Empresa Dueña)
router.delete("/jobs/:id", isAuthenticated, isCompany, verifyJobOwnership, (req, res, next) => {
  const { id } = req.params;

  // borrar el Job y borrar todas sus Applications
  Promise.all([
    Job.findByIdAndDelete(id),
    Application.deleteMany({ job: id })
  ])
    .then(() => {
      res.status(200).json({ 
        message: "Job offer and all associated applications deleted successfully." 
      });
    })
    .catch((err) => next(err));
});

// GET /api/my-jobs - Ver ofertas creadas por la empresa logueada
router.get("/my-jobs", isAuthenticated, isCompany, (req, res, next) => {
  const ownerId = req.payload._id;

  Job.find({ owner: ownerId })
    .then((myJobs) => res.status(200).json(myJobs))
    .catch((err) => next(err));
});

module.exports = router;