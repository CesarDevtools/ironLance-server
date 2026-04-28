const express = require("express");
const router = express.Router();
const Job = require("../models/Job.model"); 

router.get("/sitemap.xml", async (req, res) => {
  const baseUrl = "https://ironlance.vercel.app";

  try {
    // Solo traemos los campos necesarios de jobs activos
    const jobs = await Job.find({ active: true }, "_id updatedAt");

    // Páginas estáticas públicas
    const staticUrls = [
      { path: "/", changefreq: "weekly", priority: "1.0" },
      { path: "/jobs", changefreq: "daily", priority: "0.9" },
    ];

    // Una URL por cada oferta activa en MongoDB
    const jobUrls = jobs.map((job) => ({
      loc: `${baseUrl}/jobs/${job._id}`,
      lastmod: job.updatedAt.toISOString().split("T")[0],
      changefreq: "weekly",
      priority: "0.8",
    }));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${staticUrls
  .map(
    (u) => `  <url>
    <loc>${baseUrl}${u.path}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}

${jobUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}

</urlset>`;

    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600"); // Google no lo recrawlea cada visita
    res.send(xml);
  } catch (err) {
    console.error("Error generating sitemap:", err);
    res.status(500).send("Error generating sitemap");
  }
});

module.exports = router;