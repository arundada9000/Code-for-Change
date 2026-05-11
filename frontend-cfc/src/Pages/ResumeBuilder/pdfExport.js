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

  // To fix html-to-image truncating off-screen content, we temporarily
  // modify the parent's overflow and reset scroll position.
  const parent = previewElement.parentElement;
  let originalStyles = {};
  let originalScrollTop = 0;

  if (parent) {
    originalStyles = {
      overflow: parent.style.overflow,
      height: parent.style.height,
      maxHeight: parent.style.maxHeight,
    };
    originalScrollTop = parent.scrollTop;

    parent.style.overflow = "visible";
    parent.style.height = "auto";
    parent.style.maxHeight = "none";
    parent.scrollTop = 0;

    // Small delay to allow the browser to re-layout the DOM
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  try {
    // Capture at 2x scale for crisp text
    const pixelRatio = 2;

    const dataUrl = await toPng(previewElement, {
      quality: 1,
      pixelRatio,
      backgroundColor: "#ffffff",
      width: previewElement.scrollWidth,
      height: previewElement.scrollHeight,
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
        margin: "0",
      },
      // Filter out any interactive elements that shouldn't appear in PDF
      filter: (node) => {
        if (node.tagName === "BUTTON") return false;
        return true;
      },
    });

    // A4 dimensions in mm
    const pageWidth = 210;
    const pageHeight = 297;
    const marginBottom = 15; // 15mm margin at the bottom
    const usableHeight = pageHeight - marginBottom;

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

    // Calculate exactly how many pages are needed, using a small tolerance 
    // to prevent a tiny spillover from creating a completely blank last page.
    const tolerance = 2; // mm
    const totalPages = Math.max(1, Math.ceil((pdfHeight - tolerance) / pageHeight));

    for (let i = 0; i < totalPages; i++) {
      if (i > 0) pdf.addPage();

      const yOffset = i * usableHeight;
      pdf.addImage(dataUrl, "PNG", 0, -yOffset, pdfWidth, pdfHeight);
      
      // Draw a white rectangle at the bottom to act as a margin
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, usableHeight, pageWidth, marginBottom, "F");
    }

    pdf.save(`${fileName}.pdf`);
  } finally {
    // Revert parent styles
    if (parent) {
      parent.style.overflow = originalStyles.overflow;
      parent.style.height = originalStyles.height;
      parent.style.maxHeight = originalStyles.maxHeight;
      parent.scrollTop = originalScrollTop;
    }
  }
}
