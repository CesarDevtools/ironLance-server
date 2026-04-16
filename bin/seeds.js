require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const Job = require("../models/Job.model");
const Application = require("../models/Application.model");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ironLance-server";

const saltRounds = 10;
const password = bcrypt.hashSync("Password123", saltRounds);

const LOREM_EXTENDED = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.";

// 1. Definimos las 3 empresas
const companies = [
  {
    email: "google@google.com",
    password,
    role: "COMPANY",
    companyName: "Google",
    about: "Google's mission is to organize the world's information and make it universally accessible and useful. " + LOREM_EXTENDED,
    website: "https://google.com",
    logo: "https://cours-informatique-gratuit.fr/wp-content/uploads/2014/05/google.png"
  },
  {
    email: "meta@meta.com",
    password,
    role: "COMPANY",
    companyName: "Meta",
    about: "Meta builds technologies that help people connect, find communities, and grow businesses. " + LOREM_EXTENDED,
    website: "https://meta.com",
    logo: "https://cdn.pixabay.com/photo/2021/12/14/22/29/meta-6871457_960_720.png"
  },
  {
    email: "amazon@amazon.com",
    password,
    role: "COMPANY",
    companyName: "Amazon",
    about: "Amazon is guided by four principles: customer obsession rather than competitor focus, passion for invention, commitment to operational excellence, and long-term thinking. " + LOREM_EXTENDED,
    website: "https://amazon.com",
    logo: "https://icon-icons.com/download-file?file=https%3A%2F%2Fimages.icon-icons.com%2F2429%2FPNG%2F256%2Famazon_logo_icon_147320.png&id=147320&pack_or_individual=pack"
  }
];

// 2. Generamos 20 Ironhackers
const ironhackers = Array.from({ length: 20 }, (_, i) => ({
  email: `estudiante${i + 1}@ironhackers.com`,
  password,
  role: "IRONHACKER",
  firstName: `Ironhacker_${i + 1}`,
  lastName: "Developer",
  isPublic: true,
  about: `I am an enthusiastic Full Stack Developer #${i + 1} with a focus on modern JavaScript frameworks. ` + LOREM_EXTENDED,
  bootcamp: ["Web Development", "UX/UI Design", "Data Analytics"][i % 3],
  campus: ["Madrid", "Barcelona", "Remote"][i % 3],
  portfolioUrl: `https://portfolio-${i + 1}.com`,
  linkedinUrl: `https://linkedin.com/in/student-${i + 1}`,
  logo: `https://i.pravatar.cc/150?u=${i}`
}));

// 3. Generamos 30 Trabajos (10 para cada empresa después)
const jobTitles = ["Full Stack", "Frontend", "Backend", "UX Designer", "AI Specialist", "Data Analyst", "DevOps Engineer", "Mobile Developer", "Security Expert", "Product Manager"];
const requirementsList = ["React", "Node.js", "Python", "Figma", "MongoDB", "Java", "Docker", "AWS", "TypeScript", "SQL"];

const jobsRaw = Array.from({ length: 30 }, (_, i) => ({
  title: `${jobTitles[i % jobTitles.length]} Engineer #${i + 1}`,
  description: `We are looking for a dedicated ${jobTitles[i % jobTitles.length]} to join our growing innovation team. ` + LOREM_EXTENDED,
  requirements: [requirementsList[i % 10], requirementsList[(i + 1) % 10], requirementsList[(i + 2) % 10]],
  salary: `${35000 + (i * 800)}€`,
  location: i % 3 === 0 ? "Remote" : i % 3 === 1 ? "Madrid" : "Barcelona",
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
    console.log("Creando 3 Empresas y 20 Ironhackers...");
    return User.create([...companies, ...ironhackers]);
  })
  .then((createdUsers) => {
    const createdCompanies = createdUsers.filter(u => u.role === "COMPANY");
    const students = createdUsers.filter(u => u.role === "IRONHACKER");

    console.log("Creando 30 puestos de trabajo (10 por empresa)...");
    
    // Repartimos los 30 trabajos entre las 3 empresas (10 cada una)
    const jobsWithOwners = jobsRaw.map((job, index) => {
      const ownerCompany = createdCompanies[index % createdCompanies.length];
      return { ...job, owner: ownerCompany._id };
    });
    
    return Promise.all([Job.create(jobsWithOwners), students]);
  })
  .then(([createdJobs, students]) => {
    console.log(`Generando aplicaciones (600 en total)...`);
    
    const applications = [];
    
    // Todos los estudiantes aplican a todos los trabajos
    createdJobs.forEach(job => {
      students.forEach(student => {
        applications.push({
          job: job._id,
          applicant: student._id,
          status: "PENDING",
          message: "I am very interested in this position because I have the necessary skills and I am eager to contribute to your company. " + LOREM_EXTENDED
        });
      });
    });

    return Application.create(applications);
  })
  .then((createdApps) => {
    console.log(`--- SEED COMPLETADA ---`);
    console.log(`Usuarios: 3 Empresas, 20 Ironhackers`);
    console.log(`Trabajos: 30 creados (10 por cada empresa)`);
    console.log(`Aplicaciones: ${createdApps.length} (20 alumnos x 30 trabajos)`);
  })
  .catch((err) => {
    console.error("Error en el seed: ", err);
  })
  .finally(() => {
    mongoose.connection.close();
    console.log("Conexión cerrada.");
  });