import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

export const exportDonationsToCSV = (filteredDonations) => {
  const csv = Papa.unparse(
    filteredDonations.map((d) => ({
      Donor: d.donorName,
      Amount: d.amount,
      Method: d.paymentMethod,
      Category: d.category || "General",
      "Transaction ID": d.transactionId,
      Receiver: d.receiverAccount,
      Province: d.province || "N/A",
      Status: d.status,
      Date: new Date(d.createdAt).toLocaleDateString(),
    }))
  );
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `CFC_Donations_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success("CSV Exported successfully");
};

export const exportDonationsToPDF = (filteredDonations) => {
  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129); // Emerald-500
  doc.text("Code For Change", 14, 20);
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Donation Financial Ledger", 14, 30);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);

  const tableColumn = [
    "Date",
    "Donor",
    "Province",
    "Amount",
    "Method",
    "Category",
    "Trx ID",
    "Status",
  ];
  const tableRows = filteredDonations.map((d) => [
    new Date(d.createdAt).toLocaleDateString(),
    d.donorName,
    d.province || "N/A",
    `Rs. ${d.amount}`,
    d.paymentMethod,
    d.category || "General",
    d.transactionId,
    d.status,
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: "grid",
    headStyles: { fillColor: [16, 185, 129], fontWeight: "bold" },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  doc.save(`CFC_Financial_Report_${Date.now()}.pdf`);
  toast.success("PDF Exported successfully");
};

export const exportDonationsToWord = (filteredDonations) => {
  let content = "CODE FOR CHANGE\nDONATION FINANCIAL REPORT\n\n";
  content += `Report Date: ${new Date().toLocaleString()}\n`;
  content += "==========================================\n\n";

  filteredDonations.forEach((d, index) => {
    content += `${index + 1}. CONTRIBUTOR PROFILE\n`;
    content += `   Name: ${d.donorName}\n`;
    content += `   Province: ${d.province || "N/A"}\n`;
    content += `   Amount: Rs. ${d.amount}\n`;
    content += `   Protocol: ${d.paymentMethod}\n`;
    content += `   Registry: ${d.category || "General"}\n`;
    content += `   Dossier ID: ${d.transactionId}\n`;
    content += `   Status: ${d.status}\n`;
    content += `   Timestamp: ${new Date(d.createdAt).toLocaleString()}\n`;
    content += "------------------------------------------\n";
  });

  const blob = new Blob([content], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `CFC_Donation_Report_${Date.now()}.doc`;
  link.click();
  toast.success("Word Document Exported successfully");
};
