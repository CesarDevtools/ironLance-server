require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const Job = require("../models/Job.model");
const Application = require("../models/Application.model");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ironLance-server";

const saltRounds = 10;
const password = bcrypt.hashSync("Password123", saltRounds);

// 1. Definimos la empresa principal
const company = {
  email: "google@google.com",
  password,
  role: "COMPANY",
  companyName: "Google",
  about: "Compañía tecnológica líder mundial.",
  website: "https://google.com",
  logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
};

// 2. Generamos 20 Ironhackers dinámicamente
const ironhackers = Array.from({ length: 20 }, (_, i) => ({
  email: `estudiante${i + 1}@ironhackers.com`,
  password,
  role: "IRONHACKER",
  firstName: `Ironhacker_${i + 1}`,
  lastName: "Developer",
  about: "Desarrollador Full Stack apasionado por el código limpio.",
  bootcamp: ["Web Development", "UX/UI Design", "Data Analytics"][i % 3],
  campus: ["Madrid", "Barcelona", "Remote"][i % 3],
  portfolioUrl: `https://portfolio-${i + 1}.com`,
  linkedinUrl: `https://linkedin.com/in/student-${i + 1}`
}));

// 3. Generamos 20 Trabajos dinámicamente
const jobTitles = ["Full Stack", "Frontend", "Backend", "UX Designer", "AI Specialist", "Data Analyst"];
const requirementsList = ["React", "Node.js", "Python", "Figma", "MongoDB", "Java"];

const jobsRaw = Array.from({ length: 20 }, (_, i) => ({
  title: `${jobTitles[i % jobTitles.length]} Engineer #${i + 1}`,
  description: "Buscamos talento excepcional para nuestro equipo de ingeniería.",
  requirements: [requirementsList[i % 6], requirementsList[(i + 1) % 6]],
  salary: `${30000 + (i * 1000)}€`,
  location: i % 2 === 0 ? "Remote" : "Madrid",
  level: ["Entry", "Intermediate", "Expert"][i % 3]
}));

mongoose
  .connect(MONGO_URI)
  .then((x) => {
    console.log(`Conectado a la DB: "${x.connections[0].name}"`);
    return Promise.all([
      User.deleteMany(),
      Job.deleteMany(),
      Application.deleteMany()
    ]);
  })
  .then(() => {
    console.log("DB limpia. Creando 1 Empresa y 20 Ironhackers...");
    return User.create([company, ...ironhackers]);
  })
  .then((createdUsers) => {
    const google = createdUsers.find(u => u.role === "COMPANY");
    const students = createdUsers.filter(u => u.role === "IRONHACKER");

    console.log("Creando 20 puestos de trabajo...");
    const jobsWithOwners = jobsRaw.map(job => ({ ...job, owner: google._id }));
    
    return Promise.all([Job.create(jobsWithOwners), students]);
  })
  .then(([createdJobs, students]) => {
    console.log(`Generando aplicaciones (400 en total)...`);
    
    const applications = [];
    
    // Doble bucle: Para cada trabajo, aplicamos todos los estudiantes
    createdJobs.forEach(job => {
      students.forEach(student => {
        applications.push({
          job: job._id,
          applicant: student._id,
          status: "PENDING"
        });
      });
    });

    return Application.create(applications);
  })
  .then((createdApps) => {
    console.log(`--- SEED COMPLETADA ---`);
    console.log(`Usuarios: 1 Empresa, 20 Ironhackers`);
    console.log(`Trabajos: 20 creados por Google`);
    console.log(`Aplicaciones: ${createdApps.length} (20 apps por cada trabajo)`);
  })
  .catch((err) => {
    console.error("Error en el seed: ", err);
  })
  .finally(() => {
    mongoose.connection.close();
    console.log("Conexión cerrada.");
  });