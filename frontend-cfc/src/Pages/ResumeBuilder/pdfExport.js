import { toPng } from "html-to-image";
import jsPDF from "jspdf";

/**
 * Exports the resume preview DOM element to a PDF file.
 * Uses html-to-image for pixel-perfect capture, then places
 * the image on an A4 jsPDF page.
 *
 * @param {HTMLElement} previewElement - The DOM node to capture
 * @param {string} fileName - Output file name (without .pdf)
 */
export async function exportResumeToPDF(previewElement, fileName = "resume") {
  if (!previewElement) {
    throw new Error("No preview element provided for PDF export.");
  }

  // Capture at 2x scale for crisp text
  const pixelRatio = 2;

  const dataUrl = await toPng(previewElement, {
    quality: 1,
    pixelRatio,
    backgroundColor: "#ffffff",
    // Filter out any interactive elements that shouldn't appear in PDF
    filter: (node) => {
      if (node.tagName === "BUTTON") return false;
      return true;
    },
  });

  // A4 dimensions in mm
  const pageWidth = 210;
  const pageHeight = 297;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Calculate image dimensions to fit A4 width
  const img = new Image();
  img.src = dataUrl;

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const imgAspect = img.height / img.width;
  const pdfWidth = pageWidth;
  const pdfHeight = pdfWidth * imgAspect;

  // If content is taller than one page, we need multiple pages
  if (pdfHeight <= pageHeight) {
    pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
  } else {
    // Multi-page: slice the image
    let remainingHeight = pdfHeight;
    let yOffset = 0;

    while (remainingHeight > 0) {
      if (yOffset > 0) pdf.addPage();

      pdf.addImage(dataUrl, "PNG", 0, -yOffset, pdfWidth, pdfHeight);
      yOffset += pageHeight;
      remainingHeight -= pageHeight;
    }
  }

  pdf.save(`${fileName}.pdf`);
}
