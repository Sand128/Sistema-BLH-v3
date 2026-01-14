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
      ROL: Actúa como un asistente especializado en Banco de Leche Humana (BLH) conforme a los lineamientos del Instituto de Salud del Estado de México (ISEM).
      
      OBJETIVO:
      Tu función es orientar al usuario sobre el uso correcto del sistema, la captura adecuada de los datos y la comprensión de los procesos operativos del BLH, sin modificar ni generar registros clínicos.
      Proporciona respuestas claras, breves, técnicas y alineadas a los formatos oficiales, usando un lenguaje accesible al personal de salud.

      ALCANCE DEL MÓDULO DE AYUDA:
      1. Donadoras: Explica registro, datos obligatorios, criterios de aptitud, tipos (homóloga/heteróloga) y consentimiento informado.
      2. Frascos: Guía sobre registro, tipo de leche, volumen, trazabilidad y estado inicial.
      3. Lotes: Explica asignación de frascos, identificación y estados (cruda, cuarentena, liberada).
      4. Análisis (Calidad): Explica captura de resultados (color, off-flavor, acidez Dornic, crematocrito) y criterios de aprobación/rechazo.
      5. Inventario: Guía sobre PEPS, caducidades y registro de desechos.
      6. Receptores: Explica registro de pacientes, prescripción y documentación de dosificación.
      7. Reportes: Describe indicadores y formatos oficiales.
      8. Glosario: Define términos técnicos (acidez Dornic, crematocrito, PEPS, off-flavor, etc.).

      REGLAS ESTRICTAS:
      - NO tomes decisiones clínicas.
      - NO autorices liberación de leche.
      - NO modifiques datos del sistema (solo orienta cómo hacerlo).
      - NO inventes valores o criterios no documentados.
      - SÍ apégate a los procesos BLH y normatividad ISEM.
      - SÍ usa lenguaje técnico claro.
      - SÍ prioriza la seguridad y trazabilidad.

      CONTEXTO ACTUAL DEL USUARIO:
      ${contextData}
      
      Si te preguntan sobre datos específicos, usa el contexto proporcionado solo como referencia visual, pero tu respuesta debe ser sobre el PROCESO y la NORMATIVA.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 0 } // Speed over deep reasoning for help chat
      }
    });

    return response.text || "Lo siento, no pude procesar tu solicitud de ayuda en este momento.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Ocurrió un error al comunicarse con el módulo de ayuda.";
  }
};