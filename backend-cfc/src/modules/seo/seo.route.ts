import { Router } from "express";
import * as seoController from "./seo.controller.js";

const router = Router();

// These routes should be available at the root for SEO purposes
router.get("/sitemap.xml", seoController.getSitemap);
router.get("/robots.txt", seoController.getRobots);

export default router;
