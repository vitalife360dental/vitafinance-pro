import { financeService } from './financeService';
import { getOpenAIClient } from './gemini';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export const aiAssistantService = {

  async generateSystemPrompt() {
    // Gather Context
    console.log('Gathering context for VitaBot... (Fixes Applied v2)');
    // @ts-ignore
    const context = await financeService.getAiContext();

    const { actual, goals } = context.goals;
    const { doctors, treatments: topTreatments } = context.production;
    const goalsData = context.goals;
    const { taxAudit, supplyAnalysis, clinicConfig, financialHistory } = context;

    // Format transactions for AI
    const transactionsList = context.transactions.map((t: any) =>
      `- ${new Date(t.date).toLocaleDateString()}: $${t.amount} | ${t.description || t.treatment_name || 'Venta'} | Dr: ${t.doctor_name || 'N/A'} | P: ${t.patient_name || 'N/A'}`
    ).join('\n            ');

    console.log("AI CONTEXT TRANSACTIONS:\n", transactionsList); // DEBUG: Check what AI sees

    // Format Patients for AI
    const patientsList = context.patients.map((p: any) =>
      `- ${p.name} (${p.phone})`
    ).join('\n            ');

    // Format Treatments for AI
    const treatmentsList = context.treatments.map((t: any) =>
      `- ${t.name}: $${t.price} (Costo: $${t.totalCost?.toFixed(2) || '?'}, Margen: ${t.margin?.toFixed(0)}%)`
    ).join('\n            ');

    // Construct System Prompt
    return `
            Actúa como **VitaBot AI**, el asistente financiero–gerencial central de VitaFinance Pro.

            ────────────────────────
            📌 CONTEXTO DEL NEGOCIO
            ────────────────────────
            • Clínica odontológica
            • Pago a doctores mediante **ARANCELES FIJOS**
            • Costos Fijos Mensuales: $${clinicConfig.FIXED_COSTS_MONTHLY}
            • Horas Operativas: ${clinicConfig.OPERATIONAL_HOURS_MONTHLY}h/mes
            • Costo Operativo por Minuto: $${(supplyAnalysis.config?.costPerMinute || 0).toFixed(2)}

            ────────────────────────
            📊 MÓDULOS ACTIVOS
            ────────────────────────
            1. Finanzas, Producción, Insumos, Metas, Pacientes, Aranceles.
            2. **NUEVO**: Auditoría SRI (Impuestos) y Análisis de Rentabilidad Real (Insumos).

            ────────────────────────
            🚨 ALERTAS CRÍTICAS ACTUALES
            ────────────────────────
            ${taxAudit.alerts.map((a: any) => `• [${a.level.toUpperCase()}] ${a.title}: ${a.message}`).join('\n            ')}
            ${goalsData.alerts.map((a: any) => `• [META] ${a.title}: ${a.message}`).join('\n            ')}

            ────────────────────────
            🏭 PRODUCCIÓN Y RENTABILIDAD
            ────────────────────────
            • Tratamiento Estrella: ${topTreatments[0]?.name || 'N/A'} (Margen ${(topTreatments[0]?.margin || 0).toFixed(0)}%)
            • Doctor Top: ${doctors[0]?.name || 'N/A'} (Aporte Neto: $${doctors[0]?.netContribution.toLocaleString()})
            • Rentabilidad/Hora Actual: $${(goalsData.actual?.efficiency?.hourly || 0).toFixed(0)} (Meta: $${goals.EFFICIENCY?.HOURLY_UTILITY || 0})

            ────────────────────────
            ⚖️ ESTADO FISCAL (AUDITORÍA SRI)
            ────────────────────────
            • Ingreso Real: $${taxAudit.summary.totalProduction.toLocaleString()} vs Fiscal: $${taxAudit.summary.totalInvoiced.toLocaleString()}
            • Brecha Sin Facturar: $${(taxAudit.summary?.subInvoicingGap || 0).toLocaleString()} (${(taxAudit.summary?.subInvoicingPercent || 0).toFixed(1)}%)
            • Gastos No Deducibles: $${taxAudit.summary.nonDeductibleExpenses.toLocaleString()}
            • Riesgo Fiscal: ${taxAudit.summary.riskLevel}

            ────────────────────────
            DATOS EN TIEMPO REAL:
            ────────────────────────
            - **Fecha**: ${new Date().toLocaleDateString('es-EC')}
            - **Facturación Mes**: $${actual.billing.month.toLocaleString()} (Meta: $${goals.BILLING.MONTHLY.toLocaleString()})
            - **Proyección Cierre**: $${actual.billing.projected.toLocaleString()}
            - **Utilidad Neta**: $${(actual.utility?.month || 0).toLocaleString()} (Margen: ${((actual.utility?.month / (actual.billing?.month || 1)) * 100).toFixed(1)}%)

            📊 **HISTORIAL FINANCIERO (Últimos Meses)**:
            ${financialHistory.map((h: any) => `- ${h.month}: Ingresos $${h.income} | Gastos $${h.expenses}`).join('\n            ')}

            📝 **ÚLTIMOS MOVIMIENTOS**:
            ${transactionsList}

            👥 **PACIENTES RECIENTES / ACTIVOS**:
            ${patientsList}

            💉 **CATÁLOGO Y MÁRGENES (Top 50)**:
            ${treatmentsList}
        
            ────────────────────────
            🎯 TUS OBJETIVOS
            ────────────────────────
            1. Responder con autoridad gerencial.
            2. Si preguntan por impuestos, usa la sección ESTADO FISCAL.
            3. Si preguntan por precios, usa la lista con MÁRGENES reales.
            4. Detectar alertas y proponer soluciones.
            
            NO inventes datos. Si falta info, pídelo.
        `;
  },

  async sendMessage(history: ChatMessage[], newMessage: string) {
    try {
      const systemPrompt = await this.generateSystemPrompt();

      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: newMessage }
      ];

      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "google/gemini-2.0-flash-001",
        messages: messages as any
      });

      return completion.choices[0].message.content || "Lo siento, no pude procesar eso.";
    } catch (error) {
      console.error("AI Assistant Error:", error);
      return "Tuve un error de conexión con mi cerebro digital. Intenta de nuevo.";
    }
  }
};
