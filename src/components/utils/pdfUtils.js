/**
 * Creates and downloads a PDF of the timetable from a DOM element
 * @param {HTMLElement} element - The DOM element to capture
 */
export const captureElementAsPDF = async (element) => {
    if (!element) return;
  
    try {
      // Dynamically import libraries
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');
      
      // Store original display style
      const originalDisplay = element.style.display;
      element.style.display = "flex"; // Ensure it's not hidden
    
      // Detect current theme
      const isDarkMode = document.documentElement.classList.contains("dark");
    
      // Apply theme to ensure correct colors are captured
      if (isDarkMode) {
        element.classList.add("dark");
      } else {
        element.classList.remove("dark");
      }
    
      // Capture the element as an image
      const canvas = await html2canvas(element, {
        scale: 2, // Increase resolution
        useCORS: true,
        backgroundColor: isDarkMode ? "#000" : "#fff",
      });
    
      // Restore original display
      element.style.display = originalDisplay;
    
      // Convert canvas to image
      const imgData = canvas.toDataURL("image/png");
    
      // Match the width of the timetable in the PDF
      const imgWidth = canvas.width / 3;
      const imgHeight = canvas.height / 3;
    
      // Create a PDF with the same width as the captured table
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? "l" : "p",
        unit: "px",
        format: [imgWidth, imgHeight],
      });
    
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("TimeTable.pdf");
    
    } catch (error) {
      console.error("Error capturing element as PDF:", error);
    }
  };
  
  /**
   * Forces desktop width before capturing PDF then restores original width
   * @param {Function} captureFunction - The function that captures the PDF
   */
  export const downloadWithOptimizedLayout = (captureFunction) => {
    const originalWidth = document.body.style.width;
    document.body.style.width = "1440px"; // Force desktop width
  
    // Ensure styles are applied before rendering PDF
    setTimeout(() => {
      captureFunction();
      document.body.style.width = originalWidth; // Restore original width after download
    }, 100); // Small delay to apply styles
  };