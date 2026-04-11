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
    about: "Google es una compañía tecnológica multinacional especializada en servicios y productos relacionados con Internet, software, dispositivos electrónicos y otras tecnologías. Nuestro ecosistema abarca desde la búsqueda avanzada y publicidad online hasta soluciones de computación en la nube (Google Cloud) y hardware de vanguardia.",
    website: "https://google.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
  },
  {
    email: "empresa2@ironhack.com",
    password,
    role: "COMPANY",
    companyName: "Ironhack",
    about: "Ironhack es una escuela de tecnología global que ofrece bootcamps intensivos y cursos en desarrollo web, diseño UX/UI, análisis de datos y ciberseguridad. Nos dedicamos a transformar el sector educativo conectando a estudiantes apasionados con las habilidades digitales más demandadas por el mercado laboral actual.",
    website: "https://ironhack.com",
    logo: "https://www.ironhack.com/favicon.ico"
  },
  {
    email: "empresa3@spacex.com",
    password,
    role: "COMPANY",
    companyName: "SpaceX",
    about: "SpaceX diseña, fabrica y lanza los cohetes y naves espaciales más avanzados del mundo. La empresa fue fundada en 2002 para revolucionar la tecnología espacial, con el objetivo último de permitir que las personas vivan en otros planetas.",
    website: "https://spacex.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/36/SpaceX-Logo-Xonly.svg"
  },
  {
    email: "estudiante@ironhackers.com",
    password,
    role: "IRONHACKER",
    firstName: "Cesar",
    lastName: "Developer",
    about: "Desarrollador Full Stack apasionado por el ecosistema MERN. Graduado de Ironhack, enfocado en crear soluciones tecnológicas que resuelvan problemas reales mediante código limpio y eficiente.",
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