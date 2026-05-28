'use client';

import { jsPDF } from 'jspdf';
import type { BillingStatement } from './types';
import { formatPeso, formatDate } from './utils';

/**
 * Generate a PDF invoice for a Statement of Account and trigger download.
 * Uses jsPDF — runs entirely client-side, no server needed.
 */
export function generateSOAPdf(soa: BillingStatement, propertyName: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;

  // ----- HEADER -----
  doc.setFillColor(31, 29, 26); // charcoal
  doc.rect(0, 0, pageWidth, 72, 'F');

  doc.setTextColor(250, 247, 242); // ivory
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('DUROS', margin, 32);
  doc.setFontSize(9);
  doc.setTextColor(201, 169, 120); // champagne
  doc.text('PROPERTY CONCIERGE+', margin, 46);

  doc.setTextColor(250, 247, 242);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(propertyName, pageWidth - margin, 32, { align: 'right' });
  doc.setFontSize(8);
  doc.text('Statement of Account', pageWidth - margin, 46, { align: 'right' });

  // ----- TITLE -----
  let y = 110;
  doc.setTextColor(31, 29, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Statement of Account', margin, y);

  y += 22;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(138, 138, 146);
  doc.text(`Reference: ${soa.reference}`, margin, y);
  y += 14;
  doc.text(
    `Period: ${formatDate(soa.periodStart)} — ${formatDate(soa.periodEnd)}`,
    margin,
    y
  );

  // ----- BILL TO -----
  y += 28;
  doc.setTextColor(138, 138, 146);
  doc.setFontSize(8);
  doc.text('BILL TO', margin, y);
  y += 14;
  doc.setTextColor(31, 29, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(soa.resident.name, margin, y);
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 100);
  doc.text(`Unit ${soa.unitNumber}`, margin, y);

  // ----- DUE DATE (right) -----
  doc.setTextColor(138, 138, 146);
  doc.setFontSize(8);
  doc.text('DUE DATE', pageWidth - margin, y - 28, { align: 'right' });
  doc.setTextColor(31, 29, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(formatDate(soa.dueDate), pageWidth - margin, y - 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 100);
  doc.text('Net 14 days', pageWidth - margin, y, { align: 'right' });

  // ----- METERS -----
  y += 36;
  doc.setTextColor(138, 138, 146);
  doc.setFontSize(8);
  doc.text('METER READINGS', margin, y);
  y += 16;

  soa.meters.forEach((m) => {
    doc.setTextColor(31, 29, 26);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const label = m.type === 'water' ? 'Water' : 'Electric';
    doc.text(label, margin, y);
    doc.setTextColor(90, 90, 100);
    doc.text(`Prev ${m.previous} ${m.unit}`, margin + 80, y);
    doc.text(`Curr ${m.current} ${m.unit}`, margin + 180, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 29, 26);
    doc.text(`Usage: ${m.current - m.previous} ${m.unit}`, pageWidth - margin, y, {
      align: 'right',
    });
    y += 16;
  });

  // ----- CHARGES TABLE -----
  y += 16;
  doc.setDrawColor(31, 29, 26);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 18;

  doc.setTextColor(138, 138, 146);
  doc.setFontSize(8);
  doc.text('CHARGES', margin, y);
  doc.text('AMOUNT', pageWidth - margin, y, { align: 'right' });
  y += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  soa.charges.forEach((c) => {
    doc.setTextColor(31, 29, 26);
    doc.text(c.label, margin, y);
    doc.text(formatPeso(c.amount), pageWidth - margin, y, { align: 'right' });
    y += 18;
  });

  if (soa.previousBalance > 0) {
    doc.setTextColor(181, 72, 72);
    doc.text('Previous Balance', margin, y);
    doc.text(formatPeso(soa.previousBalance), pageWidth - margin, y, { align: 'right' });
    y += 18;
  }

  // ----- TOTAL -----
  y += 8;
  doc.setFillColor(243, 237, 227); // ivory-deep
  doc.roundedRect(margin, y, pageWidth - margin * 2, 56, 8, 8, 'F');
  doc.setTextColor(90, 90, 100);
  doc.setFontSize(9);
  doc.text('TOTAL AMOUNT DUE', margin + 16, y + 22);
  doc.setTextColor(31, 29, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(formatPeso(soa.totalDue), pageWidth - margin - 16, y + 34, { align: 'right' });

  // ----- FOOTER -----
  const footerY = doc.internal.pageSize.getHeight() - 48;
  doc.setDrawColor(220, 215, 205);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 16, pageWidth - margin, footerY - 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(138, 138, 146);
  doc.text(
    'Pay via bank transfer, GCash, or at the property admin office.',
    margin,
    footerY
  );
  doc.text(
    'Questions? Reply via the Home AI app.',
    margin,
    footerY + 12
  );
  doc.setTextColor(201, 169, 120);
  doc.text('DUROS PROPERTY CONCIERGE+', pageWidth - margin, footerY + 12, {
    align: 'right',
  });

  // ----- TRIGGER DOWNLOAD -----
  doc.save(`${soa.reference}.pdf`);
}
