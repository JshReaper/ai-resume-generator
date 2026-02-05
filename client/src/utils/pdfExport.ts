// Text-based PDF export using browser print functionality
// This generates actual searchable, copyable PDFs (not images like html2pdf)

export const exportResumeToPdf = (filename: string = 'resume.pdf') => {
  const element = document.getElementById('resume-content');

  if (!element) {
    console.error('Resume content element not found');
    return;
  }

  // Use browser's native print dialog which generates text-based PDFs
  // This is better than html2pdf because:
  // 1. The PDF contains actual text (not images)
  // 2. Text is searchable and copyable
  // 3. File size is much smaller
  // 4. Better compatibility with PDF editors

  // Set document title for the PDF filename
  const originalTitle = document.title;
  document.title = filename.replace('.pdf', '');

  // Trigger print dialog
  window.print();

  // Restore original title
  document.title = originalTitle;
};

export const exportCoverLetterToPdf = (filename: string = 'cover-letter.pdf') => {
  const element = document.getElementById('cover-letter-content');

  if (!element) {
    console.error('Cover letter content element not found');
    return;
  }

  const originalTitle = document.title;
  document.title = filename.replace('.pdf', '');

  window.print();

  document.title = originalTitle;
};
