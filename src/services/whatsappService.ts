/**
 * WhatsApp Integration Service
 * Generates formatted links for sharing reports via WhatsApp Click-to-Chat
 */

export const whatsappService = {
    /**
     * Generates a link to share the financial summary
     */
    shareDailyReport: (data: any) => {
        if (!data || !data.actual) return;

        const date = new Date().toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        // Format numbers clearly
        const income = data.actual.billing.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        const utility = data.actual.netUtility.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        const expenses = (data.actual.billing - data.actual.netUtility).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

        // Construct the message
        let message = `📊 *Reporte Financiero VitaFinance*\n`;
        message += `📅 ${date}\n\n`;
        message += `📈 *Ingresos:* ${income}\n`;
        message += `📉 *Gastos:* ${expenses}\n`;
        message += `💰 *Utilidad Neta:* ${utility}\n\n`;

        if (data.details && data.details.alerts && data.details.alerts.length > 0) {
            message += `⚠️ *Alertas:*\n`;
            data.details.alerts.forEach((alert: any) => {
                message += `- ${alert.title}\n`;
            });
        }

        message += `\n_Generado por VitaFinance Pro_`;

        // Encode for URL
        const encodedMessage = encodeURIComponent(message);

        // Open WhatsApp Web/App
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    }
};
