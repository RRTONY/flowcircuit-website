import jsPDF from "jspdf";
import { Role, roleDescriptions } from "./surveyData";

interface ReportData {
  name: string;
  role: Role;
  score: number;
  percentage: number;
  birthData?: {
    date: string;
    time: string;
    city: string;
  };
  answers: Record<number, string>;
}

export const generatePDFReport = (data: ReportData) => {
  const doc = new jsPDF();
  const roleInfo = roleDescriptions[data.role];

  // --- Cover Page ---
  doc.setFillColor(0, 0, 0); // Black background
  doc.rect(0, 0, 210, 297, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(40);
  doc.setFont("helvetica", "bold");
  doc.text("THE FLOW CIRCUIT", 105, 60, { align: "center" });

  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text("OPERATIONAL PHYSICS DOSSIER", 105, 75, { align: "center" });

  // User Name & Role
  doc.setFontSize(30);
  doc.setTextColor(250, 204, 21); // Yellow-400
  doc.text(data.name.toUpperCase(), 105, 140, { align: "center" });
  
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(`DOMINANT FREQUENCY: ${data.role.toUpperCase()}`, 105, 155, { align: "center" });

  // Birth Data (if present)
  if (data.birthData) {
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`TEMPORAL ORIGIN: ${data.birthData.city} | ${data.birthData.date} | ${data.birthData.time}`, 105, 270, { align: "center" });
  }

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("CONFIDENTIAL // FOR AUTHORIZED EYES ONLY", 105, 285, { align: "center" });

  // --- Page 2: The Analysis ---
  doc.addPage();
  doc.setFillColor(255, 255, 255); // White background for readability
  doc.rect(0, 0, 210, 297, "F");
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(`PROFILE: ${data.role.toUpperCase()}`, 20, 30);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Fit Score: ${data.percentage}%`, 20, 40);

  // Description
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("CORE FUNCTION", 20, 60);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const splitDesc = doc.splitTextToSize(roleInfo.description, 170);
  doc.text(splitDesc, 20, 70);

  // Advice
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("OPERATIONAL ADVICE", 20, 100);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const splitAdvice = doc.splitTextToSize(roleInfo.advice, 170);
  doc.text(splitAdvice, 20, 110);

  // Who to go to
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("CIRCUIT CONNECTION", 20, 140);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const splitConnection = doc.splitTextToSize(roleInfo.whoToGoTo.replace(/\*\*/g, ""), 170); // Strip markdown
  doc.text(splitConnection, 20, 150);

  // Communication Guide
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("COMMUNICATION PROTOCOLS", 20, 180);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const cleanGuide = roleInfo.communicationGuide.replace(/###/g, "").replace(/\*/g, "•").trim();
  const splitGuide = doc.splitTextToSize(cleanGuide, 170);
  doc.text(splitGuide, 20, 190);

  // Save
  doc.save(`${data.name.replace(/\s+/g, "_")}_Flow_Circuit_Dossier.pdf`);
};
