/**
 * Format invoice number by replacing hyphens with slashes
 * Example: ADF-29112025-5ESM90W2 -> ADF/29112025/5ESM90W2
 */
export function formatInvoiceNumber(invoiceNumber: string): string {
	return invoiceNumber.replace(/-/g, '/');
}
