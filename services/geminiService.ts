import { GoogleGenAI } from "@google/genai";

// Initialize the API client
// Note: In a production environment, ensure the key is properly scoped or proxied.
const getClient = () => {
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) {
    console.warn("API Key for Gemini is missing. AI features will be disabled.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateAssistantResponse = async (
  message: string, 
  contextData: string
): Promise<string> => {
  try {
    const client = getClient();
    if (!process.env.API_KEY) return "Error: Configuración de API Key faltante.";

    const systemInstruction = `
      Eres un asistente experto en gestión de Bancos de Leche Humana y lactancia materna para el Estado de México.
      Tu objetivo es ayudar al personal administrativo y médico a tomar decisiones, redactar reportes o aclarar dudas sobre protocolos.
      Utiliza un tono profesional, empático y médico cuando sea necesario.
      
      Datos actuales del sistema (Contexto):
      ${contextData}
      
      Si te preguntan sobre datos, usa el contexto proporcionado. Si te preguntan sobre protocolos médicos generales, usa tu conocimiento.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 0 } // Speed over deep reasoning for chat
      }
    });

    return response.text || "Lo siento, no pude procesar tu solicitud en este momento.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Ocurrió un error al comunicarse con el asistente inteligente.";
  }
};