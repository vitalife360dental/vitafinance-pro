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
            Actúa como un asistente contable experto en facturación de Ecuador y Latinoamérica. Analiza esta imagen de una factura/recibo y extrae los datos con ALTA PRECISIÓN.

            Contexto Local (Ecuador):
            - **Número de Factura**: BUSCA ESTRICTAMENTE el formato de 15 dígitos (ej: 001-002-123456789 o 208-003-000625705). Se llama "No.", "Factura", o "Secuencial". Si está separado (ej: 208 003 000625705), únelo con guiones. NO uses la "Autorización" como número de factura si existe el secuencial.
            - **RUC Emisor**: Busca el RUC de la empresa que emite (ej: 1791984722001). Suele estar en el encabezado.
            - **Fecha**: Formato DD/MM/YYYY.
            - **Monto**: Total a pagar final.

            Extrae el siguiente JSON estrictamente:
            {
                "amount": "Monto TOTAL (numérico, ej: 19.35)",
                "date": "Fecha ISO YYYY-MM-DD",
                "invoice_number": "El número de 15 dígitos con guiones (XXX-XXX-XXXXXXXXX).",
                "issuer_ruc": "El RUC del emisor (13 dígitos).",
                "concept": "Resumen compra (max 5 palabras)",
                "category": "Categoría inferida",
                "method": "EFECTIVO, TARJETA, TRANSFERENCIA"
            }

            Si algún campo es ilegible, null.
            Responde SOLO JSON.
        `;

        const openai = getOpenAIClient();
        const response = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-001",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: `data:${file.type || 'image/jpeg'};base64,${base64Str}` } }
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
