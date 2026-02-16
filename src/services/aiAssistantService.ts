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
      `- ${t.name}: $${t.price} (Mat: $${t.supplyCost?.toFixed(2) || '0'}, Lab: $${t.labCost?.toFixed(2) || '0'}, Margen: ${t.margin?.toFixed(0)}%)`
    ).join('\n            ');

    // Construct System Prompt
    return `
            Actúa como **VitaBot AI**, el asistente financiero–gerencial central de VitaFinance Pro.

            ────────────────────────
            📌 CONTEXTO DEL NEGOCIO
            ────────────────────────
            • Clínica odontológica
            • Pago a doctores mediante **ARANCELES DINÁMICOS** (Prioridad: Tratamiento > Especialidad > Base).
            • Si un doctor tiene una regla específica por **Nombre de Tratamiento** (ej: "Corona Zirconia"), esa regla manda.
            • Los aranceles se calculan sobre el **VALOR REAL COBRADO** al paciente en cada transacción.
            • Costos Fijos Mensuales: $${clinicConfig.FIXED_COSTS_MONTHLY}
            • Horas Operativas: ${clinicConfig.OPERATIONAL_HOURS_MONTHLY}h/mes
            • Costo Operativo por Minuto: $${(supplyAnalysis.config?.costPerMinute || 0).toFixed(2)}
            • **IMPORTANTE**: Los pagos a doctores (aranceles) se calculan sobre el **(Precio - Costo Laboratorio)**. Los materiales clínicos no afectan el pago al doctor.

            ────────────────────────
            📈 REGLAS DE ARANCEL (SISTEMA DE PAGOS)
            ────────────────────────
            Las reglas actuales configuradas son:
            ${context.doctorCommissions.map((r: any) => `- ${r.name || r.doctor_name}: ${r.category === '_default' ? 'BASE' : r.category} -> ${r.commission_rate}%`).join('\n            ')}

            ────────────────────────
            📊 MÓDULOS ACTIVOS
            ────────────────────────
            1. Finanzas, Producción, Laboratorio, Metas, Pacientes, Aranceles.
            2. **PAGOS**: Permite ver un **Desglose de Producción** (lista de tratamientos con su % y arancel final).
            3. **NUEVO**: Auditoría SRI (Impuestos) y Análisis de Rentabilidad Real (Laboratorio).

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

            📝 **ÚLTIMOS MOVIMIENTOS (TRANSACCIONES)**:
            ${transactionsList}

            👥 **PACIENTES RECIENTES / ACTIVOS**:
            ${patientsList}

            💉 **CATÁLOGO Y MÁRGENES (Top 50)**:
            ${treatmentsList}
        
            ────────────────────────
            🎯 TUS OBJETIVOS
            ────────────────────────
            1. Responder con autoridad gerencial y financiera.
            2. Si preguntan "¿Cuánto se le debe pagar al Dr. X?", revisa sus **REGLAS DE ARANCEL**.
            3. Recuerda que la prioridad es: Tratamiento específico > Especialidad > Tasa Base.
            4. Si preguntan por impuestos, usa la sección ESTADO FISCAL.
            5. Si preguntan por precios, usa la lista con MÁRGENES reales.
            6. Detectar alertas y proponer soluciones basadas en datos reales.
            
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
