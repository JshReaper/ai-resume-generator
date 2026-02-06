import { jsPDF } from 'jspdf';
import { ParsedCvData } from '../types/cv';
import { ResumeResponse } from '../types/resume';
import { getTranslation } from '../translations';

interface PDFExportOptions {
  cvData: ParsedCvData;
  resumeData: ResumeResponse;
  language: string;
  filename?: string;
}

export const exportResumeToPdf = (options: PDFExportOptions) => {
  const { cvData, resumeData, language, filename } = options;
  const t = getTranslation(language);

  // Create new PDF document (A4, portrait)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper to add text with word wrap
  const addText = (text: string, fontSize: number, isBold: boolean = false, color: string = '#000000') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');

    // Parse color
    const r = parseInt(color.substring(1, 3), 16);
    const g = parseInt(color.substring(3, 5), 16);
    const b = parseInt(color.substring(5, 7), 16);
    doc.setTextColor(r, g, b);

    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.4;

    lines.forEach((line: string) => {
      if (yPosition + lineHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    doc.setTextColor(0, 0, 0); // Reset to black
  };

  const addSpace = (space: number) => {
    yPosition += space;
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  const addSection = (title: string) => {
    addSpace(4);
    addText(title, 14, true, '#4f46e5');

    // Add underline
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition + 1, pageWidth - margin, yPosition + 1);

    addSpace(5);
  };

  // === HEADER ===
  if (cvData.fullName) {
    addText(cvData.fullName, 22, true, '#1a1a1a');
    addSpace(2);
  }

  // Contact info
  const contactInfo: string[] = [];
  if (cvData.email) contactInfo.push(cvData.email);
  if (cvData.phone) contactInfo.push(cvData.phone);
  if (cvData.linkedIn) contactInfo.push(cvData.linkedIn);

  if (contactInfo.length > 0) {
    addText(contactInfo.join('  •  '), 10, false, '#666666');
    addSpace(3);
  }

  // === PROFESSIONAL SUMMARY ===
  if (resumeData.generatedSummary) {
    addSection(t.template.professionalSummary);
    addText(resumeData.generatedSummary, 10, false);
  }

  // === EXPERIENCE ===
  if (resumeData.enhancedExperiences && resumeData.enhancedExperiences.length > 0) {
    addSection(t.template.experience);

    resumeData.enhancedExperiences.forEach((exp, index) => {
      if (index > 0) addSpace(4);

      // Job title and company
      addText(exp.jobTitle, 11, true);
      addText(exp.company, 10, false, '#666666');

      // Dates
      const endDate = exp.endDate || t.template.present;
      addText(`${exp.startDate} - ${endDate}`, 9, false, '#666666');
      addSpace(2);

      // Responsibilities
      if (exp.enhancedResponsibilities && exp.enhancedResponsibilities.length > 0) {
        exp.enhancedResponsibilities.forEach((resp) => {
          const bulletText = `• ${resp}`;
          addText(bulletText, 9, false);
        });
      }
    });
  }

  // === EDUCATION ===
  if (cvData.educations && cvData.educations.length > 0) {
    addSection(t.template.education);

    cvData.educations.forEach((edu, index) => {
      if (index > 0) addSpace(3);

      if (edu.degree) addText(edu.degree, 11, true);
      if (edu.institution) addText(edu.institution, 10, false, '#666666');

      const details: string[] = [];
      if (edu.graduationYear) details.push(edu.graduationYear);
      if (edu.fieldOfStudy) details.push(edu.fieldOfStudy);

      if (details.length > 0) {
        addText(details.join(' • '), 9, false, '#666666');
      }
    });
  }

  // === SKILLS ===
  const allSkills = [
    ...(resumeData.existingSkills || []),
    ...(resumeData.suggestedSkills || [])
  ];

  if (allSkills.length > 0) {
    addSection(t.template.skills);

    // Create skills text (comma-separated)
    const skillsText = allSkills.join(', ');
    addText(skillsText, 10, false);
  }

  // Save PDF
  const pdfFilename = filename || `resume-${cvData.fullName?.replace(/\s+/g, '-') || 'download'}.pdf`;
  doc.save(pdfFilename);
};

export const exportCoverLetterToPdf = (
  content: string,
  language: string,
  filename: string = 'cover-letter.pdf'
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const lines = doc.splitTextToSize(content, contentWidth);
  let yPosition = margin;
  const lineHeight = 5;

  lines.forEach((line: string) => {
    if (yPosition + lineHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });

  doc.save(filename);
};
