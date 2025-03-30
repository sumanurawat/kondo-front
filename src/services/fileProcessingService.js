import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Process files using Gemini Pro Vision multimodal model
 */
export const createFileProcessingService = () => {
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
  
  /**
   * Extract text from an uploaded file using Gemini multimodal API
   * @param {File} file - The uploaded file (PDF or image)
   * @returns {Promise<string>} Extracted text content
   */
  const extractTextFromFile = async (file) => {
    try {
      console.log(`Processing ${file.name} (${file.type}, ${Math.round(file.size/1024)}KB)`);
      
      // Convert file to base64 for API submission
      const base64Data = await fileToBase64(file);
      
      // Initialize Gemini API
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      
      // Select the right model - using Gemini 1.5 Pro for multimodal capabilities
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      // Prepare the content parts for the API request
      const fileType = file.type;
      let mimeType = file.type;
      
      // Adjust mime type if needed
      if (fileType === 'application/pdf') {
        mimeType = 'application/pdf';
      }
      
      // Create appropriate prompt based on file type
      let prompt = "";
      if (fileType === 'application/pdf') {
        prompt = "Extract all text from this PDF document. Format it properly, preserving paragraphs, headings, and structure.";
      } else if (fileType.startsWith('image/')) {
        prompt = "Extract all text visible in this image. Format the text in a readable manner, preserving paragraphs and structure.";
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }
      
      // Create multimodal request
      const result = await model.generateContent({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data.split(',')[1] // Remove data URL prefix
                }
              }
            ]
          }
        ]
      });
      
      // Get the response
      const response = await result.response;
      const extractedText = response.text();
      
      console.log("Successfully extracted text");
      return extractedText;
    } catch (error) {
      console.error("Error processing file:", error);
      throw new Error(`Failed to process file: ${error.message}`);
    }
  };
  
  /**
   * Convert a File object to base64 encoding
   * @param {File} file - File to convert
   * @returns {Promise<string>} Base64 data URL
   */
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };
  
  return {
    extractTextFromFile
  };
};