require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const Job = require("../models/Job.model");
const Application = require("../models/Application.model");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ironLance-server";

const saltRounds = 10;
const password = bcrypt.hashSync("Password123", saltRounds);

const users = [
  {
    email: "empresa1@google.com",
    password,
    role: "COMPANY",
    companyName: "Google",
    website: "https://google.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
  },
  {
    email: "empresa2@ironhack.com",
    password,
    role: "COMPANY",
    companyName: "Ironhack Corp",
    website: "https://ironhack.com",
    logo: "https://www.ironhack.com/favicon.ico"
  },
  {
    email: "estudiante@ironhackers.com",
    password,
    role: "IRONHACKER",
    firstName: "Cesar",
    lastName: "Developer",
    bootcamp: "Web Development",
    campus: "Madrid",
    portfolioUrl: "https://my-portfolio.com",
    linkedinUrl: "https://linkedin.com/in/cesar"
  }
];

const jobsRaw = [
  {
    title: "Junior Full Stack Developer",
    description: "Buscamos graduados con pasión por MERN Stack y ganas de crecer en un entorno dinámico.",
    requirements: ["React", "Node.js", "Express", "MongoDB"],
    salary: "28,000€ - 32,000€",
    location: "Remote",
    level: "Entry" // <--- Añadido
  },
  {
    title: "UX/UI Designer",
    description: "Únete a nuestro equipo de diseño para crear interfaces increíbles usando Figma y Mantine.",
    requirements: ["Figma", "Mantine UI", "User Research"],
    salary: "30,000€",
    location: "Madrid",
    level: "Intermediate" // <--- Añadido
  },
  {
    title: "Node.js Backend Engineer",
    description: "Especialista en escalabilidad y arquitectura de microservicios.",
    requirements: ["Node.js", "Redis", "Docker"],
    salary: "45,000€",
    location: "Barcelona",
    level: "Expert" // <--- Añadido
  },
  {
    title: "AI Consultant",
    description: "Ayuda a empresas a integrar soluciones de IA Generativa y optimizar flujos de trabajo.",
    requirements: ["OpenAI API", "Python", "Prompt Engineering"],
    salary: "Negotiable",
    location: "Remote",
    level: "Intermediate" // <--- Añadido
  }
];

mongoose
  .connect(MONGO_URI)
  .then((x) => {
    console.log(`Conectado a la DB: "${x.connections[0].name}"`);
    console.log("Limpiando base de datos completa...");
    return Promise.all([
      User.deleteMany(), 
      Job.deleteMany(), 
      Application.deleteMany()
    ]);
  })
  .then(() => {
    console.log("Base de datos vacía. Creando usuarios...");
    return User.create(users);
  })
  .then((createdUsers) => {
    const companies = createdUsers.filter(u => u.role === "COMPANY");
    
    const jobsWithOwners = jobsRaw.map((job, index) => {
      const ownerCompany = companies[index % companies.length];
      return { ...job, owner: ownerCompany._id };
    });

    return Job.create(jobsWithOwners);
  })
  .then((createdJobs) => {
    console.log(`¡Éxito! Creados ${createdJobs.length} puestos con sus niveles y base de datos saneada.`);
  })
  .catch((err) => {
    console.error("Error en el seed: ", err);
  })
  .finally(() => {
    mongoose.connection.close();
    console.log("Conexión cerrada.");
  });