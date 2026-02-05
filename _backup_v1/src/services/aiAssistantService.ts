import { getOpenAIClient } from './gemini';
import { financeService } from './financeService';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    action?: {
        type: 'navigate';
        payload: string;
    };
}

const SYSTEM_PROMPT = `
Eres VitaBot, el asistente inteligente de VitaFinance Pro (Software de Gestión Dental).
Tu misión es ayudar al doctor/dueño con 3 roles principales:

1. ORÁCULO FINANCIERO 📊:
   - Tienes acceso a datos financieros (se te pasarán en el contexto).
   - Responde preguntas sobre Ingresos, Gastos, Producción y Metas.
   - Sé preciso con los números. Usa emojis para ser amable.

2. CONCIERGE / NAVEGADOR 🛎️:
   - Si el usuario quiere ir a una pantalla, GENERA UNA ACCIÓN JSON.
   - Rutas disponibles:
     - / (Inicio)
     - /caja-diaria (Caja Diaria)
     - /finanzas (Finanzas / Reportes)
     - /egresos (Gastos)
     - /produccion (Producción / Doctores)
     - /metas (Objetivos)
     - /pacientes (Lista Pacientes)
     - /configuracion (Ajustes)

3. ASISTENTE CLÍNICO 🦷:
   - Ayuda a buscar pacientes o resumir información clínica básica (simulada por ahora).

FORMATO DE RESPUESTA:
Siempre responde en texto natural, amable y breve.
SI EL USUARIO PIDE NAVEGAR, agrega al final de tu respuesta UN BLOQUE JSON ESTRICTO así:
\`\`\`json
{"navigate": "/ruta-aqui"}
\`\`\`
NO inventes rutas que no estén en la lista.

CONTEXTO ACTUAL DEL USUARIO:
`;

export const aiAssistantService = {
    async chat(history: ChatMessage[], contextData?: any) {
        const client = getOpenAIClient();

        // 1. Prepare Context
        let financialContext = "";
        try {
            if (!contextData) {
                const metrics = await financeService.getDashboardMetrics();
                financialContext = JSON.stringify(metrics);
            } else {
                financialContext = JSON.stringify(contextData);
            }
        } catch (e) {
            console.warn("Could not fetch fresh context for AI", e);
        }

        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPT + `\nDATOS FINANCIEROS EN TIEMPO REAL:\n${financialContext}`
            },
            ...history.map(msg => ({ role: msg.role, content: msg.content }))
        ];

        try {
            const response = await client.chat.completions.create({
                model: "google/gemini-2.0-flash-001",
                messages: messages as any
            });

            const rawText = response.choices[0].message.content || "Lo siento, no pude procesar eso.";

            // Extract Action if present
            let cleanText = rawText;
            let action = undefined;

            const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/) || rawText.match(/{[\s\S]*"navigate"[\s\S]*}/);

            if (jsonMatch) {
                try {
                    const jsonStr = jsonMatch[1] || jsonMatch[0];
                    const parsed = JSON.parse(jsonStr);
                    if (parsed.navigate) {
                        action = { type: 'navigate', payload: parsed.navigate };
                    }
                    // Remove JSON from displayed text
                    cleanText = rawText.replace(jsonMatch[0], '').trim();
                } catch (e) {
                    console.warn("Failed to parse AI action JSON", e);
                }
            }

            return {
                role: 'assistant',
                content: cleanText,
                action
            };

        } catch (error) {
            console.error("AI Chat Error:", error);
            return {
                role: 'assistant',
                content: "Tuve un error de conexión. ¿Puedes repetirlo?"
            };
        }
    }
};
