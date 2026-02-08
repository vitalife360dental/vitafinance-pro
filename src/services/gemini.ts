import OpenAI from "openai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize OpenRouter client
// Initialize OpenRouter client lazily
// Initialize OpenRouter client lazily
export const getOpenAIClient = () => {
    if (!API_KEY) {
        throw new Error("Falta la API Key (VITE_GEMINI_API_KEY)");
    }
    return new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: API_KEY,
        dangerouslyAllowBrowser: true
    });
};

export async function scanInvoiceWithGemini(file: File) {
    if (!API_KEY) {
        throw new Error("Falta la API Key (VITE_GEMINI_API_KEY)");
    }

    try {
        const base64Str = await fileToBase64(file);

        // Enhanced prompt for Latin American/Ecuadorian invoices
        const prompt = `
            Actúa como un asistente contable experto en facturación de Ecuador (SRI). Analiza este documento (Imagen o PDF) y extrae los datos con EXTREMA PRECISIÓN.

            Contexto Local (Ecuador):
            - **Número de Factura**: Formato OBLIGATORIO de 15 dígitos (ej: 001-002-123456789).
              * Si ves texto como "Factura No. 001-001-12345" -> Extráelo.
              * Si ves bloques separados "001" "001" "12345" -> Únelos con guiones.
              * IGNORA números de "Autorización" (son muy largos, >30 dígitos).
            - **RUC Emisor**: 13 dígitos numéricos terminados en 001 (ej: 1790012345001). Suele estar cerca del logo o encabezado.
            - **Monto**: El "TOTAL A PAGAR" final. Asegúrate de leer los decimales (el punto o coma).
            - **Fecha**: Busca la fecha de emisión.

            Extrae el siguiente JSON:
            {
                "amount": "Monto TOTAL (solo número, ej: 19.35)",
                "date": "Fecha ISO YYYY-MM-DD",
                "invoice_number": "XXX-XXX-XXXXXXXXX (15 dígitos)",
                "issuer_name": "Nombre comercial (ej: SUPERMAXI, FYBECA)",
                "issuer_ruc": "RUC de 13 dígitos",
                "concept": "Resumen breve de la compra (max 5 palabras)",
                "category": "Infiere una de: [General, Materiales, Servicios, Mantenimiento, Laboratorio, Nómina, Publicidad, Insumos]",
                "method": "EFECTIVO, TARJETA, TRANSFERENCIA"
            }

            Si un campo no es visible o claro, usa null. NO inventes datos.
            Responde ÚNICAMENTE con el bloque JSON.
        `;

        const openai = getOpenAIClient();
        const response = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-001",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                // Gemini supports PDF via Data URL if supported by the adapter. 
                                // If file.type is 'application/pdf', this constructs 'data:application/pdf;base64,...'
                                url: `data:${file.type || 'image/jpeg'};base64,${base64Str}`
                            }
                        }
                    ]
                }
            ]
        });

        const text = response.choices[0].message.content || "{}";
        const parsedData = cleanAndParseJSON(text);

        return {
            success: !!parsedData,
            data: parsedData,
            raw: text
        };

    } catch (error: any) {
        console.error("Error scanning invoice (OpenRouter):", error);
        return {
            success: false,
            data: null,
            raw: error.message || "Unknown Error",
            isError: true
        };
    }
}

// Helper: Convert File to clean Base64 string
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data:image/...;base64, prefix
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Helper: Parse JSON safely
function cleanAndParseJSON(text: string) {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);

        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return null;
    }
}
