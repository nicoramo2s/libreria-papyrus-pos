import type { Sale, SaleItem } from '@papyrus/shared';
import { settingsService } from '../services/settings';

interface PrintTicketOptions {
  sale: Sale;
}

const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
});

const paymentLabels: Record<string, string> = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
};

function ticketHtml(sale: Sale, settings: Record<string, string>) {
  const businessName = settings.business_name || 'Librería POS';
  const businessAddress = settings.business_address || '';
  const businessPhone = settings.business_phone || '';
  const ticketMessage = settings.ticket_message || '';
  const date = new Date(sale.createdAt);
  const dateStr = date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const paymentLabel = paymentLabels[sale.paymentMethod] ?? sale.paymentMethod;

  const itemsHtml = sale.items
    .map(
      (item: SaleItem) =>
        `<tr>
          <td class="qty">${item.quantity}</td>
          <td class="name">${item.productName}</td>
          <td class="price">${currency.format(item.subtotal)}</td>
        </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Ticket ${sale.ticketNumber}</title>
<style>
  @page {
    margin: 0;
    size: 80mm auto;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Courier New', 'Courier', monospace;
    font-size: 11px;
    line-height: 1.4;
    color: #000;
    width: 72mm;
    margin: 0 auto;
    padding: 2mm 3mm;
  }
  .header { text-align: center; margin-bottom: 4mm; }
  .header h1 {
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .header p {
    font-size: 10px;
    color: #444;
  }
  .divider {
    border: none;
    border-top: 1px dashed #000;
    margin: 3mm 0;
  }
  .divider-thick {
    border: none;
    border-top: 2px solid #000;
    margin: 3mm 0;
  }
  .title {
    text-align: center;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: 3mm;
  }
  .meta {
    font-size: 10px;
    margin-bottom: 3mm;
  }
  .meta-row {
    display: flex;
    justify-content: space-between;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10px;
  }
  thead th {
    border-bottom: 1px dashed #000;
    padding: 1mm 0;
    text-align: left;
    text-transform: uppercase;
    font-size: 9px;
  }
  thead th.qty { width: 8mm; text-align: center; }
  thead th.price { width: 22mm; text-align: right; }
  tbody td {
    padding: 0.5mm 0;
    vertical-align: top;
  }
  tbody td.qty { text-align: center; }
  tbody td.price { text-align: right; white-space: nowrap; }
  tbody td.name { padding-left: 1mm; }
  .totals {
    margin-top: 2mm;
    font-size: 10px;
  }
  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5mm 0;
  }
  .total-row.discount { color: #c00; }
  .grand-total {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    font-weight: 700;
    padding: 1mm 0;
  }
  .payment {
    font-size: 10px;
    margin-top: 2mm;
  }
  .payment-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5mm 0;
  }
  .footer {
    text-align: center;
    font-size: 10px;
    margin-top: 4mm;
    padding-top: 2mm;
  }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(businessName)}</h1>
    ${businessAddress ? `<p>${escapeHtml(businessAddress)}</p>` : ''}
    ${businessPhone ? `<p>Tel: ${escapeHtml(businessPhone)}</p>` : ''}
  </div>

  <hr class="divider-thick" />

  <div class="title">Ticket de Venta</div>

  <div class="meta">
    <div class="meta-row"><span>Ticket</span><strong>${sale.ticketNumber}</strong></div>
    <div class="meta-row"><span>Fecha</span><span>${dateStr} ${timeStr}</span></div>
  </div>

  <hr class="divider" />

  <table>
    <thead>
      <tr>
        <th class="qty">Cant</th>
        <th>Producto</th>
        <th class="price">Importe</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <hr class="divider" />

  <div class="totals">
    <div class="total-row">
      <span>Subtotal</span>
      <span>${currency.format(sale.subtotal)}</span>
    </div>
    ${sale.discountAmount > 0
      ? `<div class="total-row discount">
          <span>Descuento</span>
          <span>-${currency.format(sale.discountAmount)}</span>
        </div>`
      : ''}
  </div>

  <hr class="divider-thick" />

  <div class="grand-total">
    <span>TOTAL</span>
    <span>${currency.format(sale.total)}</span>
  </div>

  <hr class="divider" />

  <div class="payment">
    <div class="payment-row">
      <span>${paymentLabel}</span>
      <span>${currency.format(sale.total)}</span>
    </div>
    ${sale.cashReceived != null
      ? `<div class="payment-row">
          <span>Recibido</span>
          <span>${currency.format(sale.cashReceived)}</span>
        </div>
        <div class="payment-row">
          <span>Vuelto</span>
          <span>${currency.format(sale.changeGiven ?? 0)}</span>
        </div>`
      : ''}
  </div>

  ${ticketMessage
    ? `<hr class="divider" />
       <div class="footer">
         ${escapeHtml(ticketMessage)}
       </div>`
    : ''}

  <hr class="divider-thick" />
  <div class="footer" style="font-size: 9px; color: #666; margin-top: 2mm;">
    Gracias por su visita
  </div>

  <script>
    window.onload = function () {
      window.focus();
      window.print();
      window.onafterprint = function () { window.close(); };
      setTimeout(function () { window.close(); }, 3000);
    };
  <\/script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function printTicket({ sale }: PrintTicketOptions): Promise<void> {
  let settings: Record<string, string> = {};
  try {
    settings = await settingsService.getSettings();
  } catch {
    // Use defaults if settings fail to load
  }

  const html = ticketHtml(sale, settings);
  const printWindow = window.open('', '_blank', 'width=400,height=600,scrollbars=yes');

  if (!printWindow) {
    // Fallback if popup is blocked
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${sale.ticketNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();
}
