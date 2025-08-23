import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// 1. Get the API Key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY!;

// 2. Correctly initialize the GoogleGenerativeAI client
const genAI = new GoogleGenerativeAI(apiKey);

// 3. Define the generation configuration
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// 4. Define safety settings using the imported enums for type safety
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  // You can add the other categories back if you need them
];

// 5. Get a model *object* using the correct model name
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

// 6. Start the chat session on the model *object*
export const chatSession = model.startChat({
  generationConfig,
  safetySettings,
  // You can add history here if needed
});