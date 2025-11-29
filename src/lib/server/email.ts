import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import { formatPaymentMethod } from '$lib/utils/payment.utils';

const resend = new Resend(env.RESEND_API_KEY);
const ADMIN_EMAIL = env.ADMIN_EMAIL || 'admin@example.com';

export const sendOrderPendingEmail = async ({
	to,
	customerName,
	orderId,
	items,
	totalPayment,
	paymentMethod,
	paymentNumber,
	expiredAt,
	subtotal,
	discount,
	fee
}: {
	to: string;
	customerName: string;
	orderId: string;
	items: Array<{ name: string; quantity: number; price: number; originalPrice: number }>;
	totalPayment: number;
	paymentMethod: string;
	paymentNumber: string;
	expiredAt: string;
	subtotal: number;
	discount: number;
	fee: number;
}) => {
	try {
		const formatter = new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		});

		const formattedTotal = formatter.format(totalPayment);
		const formattedSubtotal = formatter.format(subtotal);
		const formattedDiscount = formatter.format(discount);
		const formattedFee = formatter.format(fee);
		const formattedExpired = new Date(expiredAt).toLocaleString('id-ID', {
			dateStyle: 'full',
			timeStyle: 'short'
		});

		// Generate QR Code URL if method is QRIS
		let paymentDisplay = '';
		if (paymentMethod.toLowerCase() === 'qris') {
			const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentNumber)}`;
			paymentDisplay = `
        <div style="text-align: center; margin: 15px 0;">
          <img src="${qrUrl}" alt="QRIS Code" style="width: 200px; height: 200px; border: 1px solid #ddd; padding: 10px; background: white;" />
          <p style="font-size: 0.8em; color: #6b7280; margin-top: 5px;">Scan QRIS di atas untuk membayar</p>
        </div>
      `;
		} else {
			paymentDisplay = `
        <div style="background: #fff; padding: 10px; border: 1px solid #bfdbfe; border-radius: 4px; font-family: monospace; font-size: 1.2em; text-align: center; letter-spacing: 1px;">
          ${paymentNumber}
        </div>
      `;
		}

		// Personalize Name (First Name only)
		const firstName = customerName.split(' ')[0];

		// Generate Items Rows
		const itemsRows = items
			.map(
				(item) => `
      <tr>
        <td style="padding: 8px 0; color: #4b5563;">
          ${item.name} <span style="color: #9ca3af; font-size: 0.9em;">(x${item.quantity})</span>
          ${
						item.originalPrice > item.price
							? `<br><span style="text-decoration: line-through; font-size: 0.8em; color: #9ca3af;">${formatter.format(item.originalPrice * item.quantity)}</span>`
							: ''
					}
        </td>
        <td style="padding: 8px 0; text-align: right; color: #1f2937;">
          ${formatter.format(item.price * item.quantity)}
        </td>
      </tr>
    `
			)
			.join('');

		const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background-color: #111827; padding: 30px 20px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Menunggu Pembayaran</h2>
          <p style="color: #9ca3af; margin: 10px 0 0 0;">Order #${orderId}</p>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151;">Halo <strong>${firstName}</strong>,</p>
          <p style="color: #4b5563; line-height: 1.6;">Terima kasih telah memesan di AdverFI. Mohon selesaikan pembayaran Anda sebelum <strong>${formattedExpired}</strong>.</p>
          
          <!-- Order Summary -->
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #1f2937; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Rincian Pesanan</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              ${itemsRows}
              <tr style="border-top: 1px solid #e5e7eb;">
                <td style="padding: 8px 0; color: #4b5563; font-weight: 500;">Subtotal</td>
                <td style="padding: 8px 0; text-align: right; color: #1f2937;">${formattedSubtotal}</td>
              </tr>
              ${
								discount > 0
									? `
              <tr>
                <td style="padding: 8px 0; color: #16a34a;">Diskon</td>
                <td style="padding: 8px 0; text-align: right; color: #16a34a;">-${formattedDiscount}</td>
              </tr>
              `
									: ''
							}
              <tr>
                <td style="padding: 8px 0; color: #4b5563;">Biaya Layanan</td>
                <td style="padding: 8px 0; text-align: right; color: #1f2937;">${formattedFee}</td>
              </tr>
              <tr style="border-top: 2px solid #e5e7eb;">
                <td style="padding: 15px 0 0 0; font-weight: bold; color: #1f2937;">Total Pembayaran</td>
                <td style="padding: 15px 0 0 0; text-align: right; font-weight: bold; color: #dc2626; font-size: 18px;">${formattedTotal}</td>
              </tr>
            </table>
          </div>

          <!-- Payment Instructions -->
          <div style="border: 1px solid #bfdbfe; background-color: #eff6ff; border-radius: 8px; padding: 20px; text-align: center;">
            <h3 style="margin-top: 0; color: #1e40af; font-size: 16px;">Instruksi Pembayaran</h3>
            <p style="margin: 5px 0; color: #1e3a8a;">Metode: <strong>${formatPaymentMethod(paymentMethod)}</strong></p>
            
            ${paymentDisplay}
            
            <p style="margin-top: 15px; font-size: 0.9em; color: #6b7280;">Bayar sebelum: <br><strong>${formattedExpired}</strong></p>
          </div>

          <p style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 0.9em;">
            Jika Anda sudah melakukan pembayaran, mohon abaikan email ini. Konfirmasi akan dikirim otomatis setelah pembayaran diterima.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; ${new Date().getFullYear()} AdverFI. All rights reserved.</p>
        </div>
      </div>
    `;

		const data = await resend.emails.send({
			from: 'AdverFI <no-reply@reg.weddify.biz.id>',
			to: [to],
			subject: `Menunggu Pembayaran - Order #${orderId}`,
			html: html
		});

		console.log('Email sent to user:', data);
		return data;
	} catch (error) {
		console.error('Failed to send user email:', error);
		return null;
	}
};

export const sendAdminNewOrderEmail = async ({
	orderId,
	customerName,
	productName,
	quantity,
	totalPayment,
	status
}: {
	orderId: string;
	customerName: string;
	productName: string;
	quantity: number;
	totalPayment: number;
	status: string;
}) => {
	try {
		const formatter = new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		});

		const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Order Baru Masuk! 🚀</h2>
        <p>Ada pesanan baru dari <strong>${customerName}</strong>.</p>
        <ul>
          <li><strong>Order ID:</strong> ${orderId}</li>
          <li><strong>Produk:</strong> ${productName} (x${quantity})</li>
          <li><strong>Total:</strong> ${formatter.format(totalPayment)}</li>
          <li><strong>Status:</strong> ${status}</li>
        </ul>
        <p>Cek dashboard admin untuk detail selengkapnya.</p>
      </div>
    `;

		const data = await resend.emails.send({
			from: 'AdverFI System <no-reply@reg.weddify.biz.id>',
			to: [ADMIN_EMAIL],
			subject: `[New Order] #${orderId} - ${customerName}`,
			html: html
		});

		console.log('Email sent to admin:', data);
		return data;
	} catch (error) {
		console.error('Failed to send admin email:', error);
		return null;
	}
};
