import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Blog } from "../blogs/blog.model.js";
import { Event } from "../events/event.model.js";
import { Impact } from "../impact/impact.model.js";
import { ENV } from "../../shared/configs/env.js";

/**
 * Generate Dynamic Sitemap.xml
 */
export const getSitemap = asyncHandler(async (req: Request, res: Response) => {
  const blogs = await Blog.find({ isPublished: true }).select("slug updatedAt");
  const events = await Event.find({ status: { $in: ["Published", "Upcoming", "Live"] } }).select("slug updatedAt");
  const impacts = await Impact.find().select("_id updatedAt");

  const baseUrl = ENV.FRONTEND_URL || "https://codeforchangenepal.com";
  
  const staticPages = [
    "",
    "/about",
    "/events",
    "/blog",
    "/our-impact",
    "/provinces",
    "/internships",
    "/contact-us",
    "/join-us",
    "/faq",
    "/certificate-verification",
    "/donate-us",
    "/register"
  ];

  const provinces = [
    "kathmandu", "pokhara", "rupandehi", "dang", "birgunj", 
    "farwest", "koshi", "chitwan", "lb-karnali"
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Add Static Pages
  staticPages.forEach(page => {
    xml += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === "" ? "1.0" : "0.8"}</priority>
  </url>`;
  });

  // Add Blogs
  blogs.forEach((blog: any) => {
    xml += `
  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${new Date(blog.updatedAt || new Date()).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  // Add Impacts
  impacts.forEach((impact: any) => {
    xml += `
  <url>
    <loc>${baseUrl}/our-impact/${impact._id}</loc>
    <lastmod>${new Date(impact.updatedAt || new Date()).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });

  // Add Provinces
  provinces.forEach(province => {
    xml += `
  <url>
    <loc>${baseUrl}/provinces/${province}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });

  xml += `
</urlset>`;

  res.header("Content-Type", "application/xml");
  res.status(200).send(xml);
});

/**
 * Generate Robots.txt
 */
export const getRobots = asyncHandler(async (req: Request, res: Response) => {
  const baseUrl = ENV.FRONTEND_URL || "https://codeforchangenepal.com";
  
  const robots = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
`;

  res.header("Content-Type", "text/plain");
  res.status(200).send(robots);
});
