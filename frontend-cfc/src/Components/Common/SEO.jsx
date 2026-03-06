import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

/**
 * Dynamic SEO Component for Code for Change Nepal
 * @param {string} title - Page title
 * @param {string} description - Meta description
 * @param {string} image - OG Image URL
 * @param {string} type - Page type (website, article)
 * @param {Object} jsonLd - Optional custom JSON-LD schema
 * @param {Array} breadcrumbs - Optional breadcrumb array [{name, path}]
 */
const SEO = ({ 
  title, 
  description, 
  image, 
  type = "website", 
  jsonLd,
  breadcrumbs 
}) => {
  const { pathname } = useLocation();
  const siteName = "Code for Change";
  const baseUrl = window.location.origin;
  const fullUrl = `${baseUrl}${pathname}`;
  const defaultDescription = "Code for Change (CFC) is a movement of changemakers uniting IT students and professionals for technological transition and social impact in Nepal.";
  const defaultImage = `${baseUrl}/logo.png`;

  const seoTitle = title ? `${title} | ${siteName}` : siteName;
  const seoDescription = description || defaultDescription;
  const seoImage = image || defaultImage;
  const seoKeywords = "CFC, codeforchange, Code for Change Nepal, IT Students Nepal, Tech Community Nepal, Hackathons Nepal, Workshops Nepal";

  // Generate Breadcrumb List Schema
  const breadcrumbSchema = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.path.startsWith('http') ? crumb.path : `${baseUrl}${crumb.path}`
    }))
  } : null;

  // Default Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Code for Change Nepal",
    "url": baseUrl,
    "logo": defaultImage,
    "sameAs": [
      "https://facebook.com/codeforchangenepal",
      "https://linkedin.com/company/codeforchangenepal",
      "https://instagram.com/codeforchangenepal"
    ]
  };

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
