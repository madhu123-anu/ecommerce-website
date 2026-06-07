const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: parseInt(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection
transporter.verify((error) => {
  if (error) {
    console.warn('⚠️  Email transport not configured:', error.message);
  } else {
    console.log('✅ Email transport ready');
  }
});

const emailStyle = `
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8f9fa; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 32px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 24px; letter-spacing: 1px; }
  .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; }
  .body { padding: 32px; color: #374151; }
  .body h2 { font-size: 20px; margin-top: 0; color: #111827; }
  .btn { display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
  .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
  .footer { background: #f3f4f6; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; }
  .order-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
  .badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
`;

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'ModernShop Pro <noreply@modernshoppro.com>',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email send error:', error.message);
    // Don't throw — email failures shouldn't break app flow
  }
};

const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify Your ModernShop Pro Account',
    html: `
      <style>${emailStyle}</style>
      <div class="container">
        <div class="header">
          <h1>🛒 ModernShop Pro</h1>
          <p>Premium E-Commerce Experience</p>
        </div>
        <div class="body">
          <h2>Welcome, ${user.name}! 🎉</h2>
          <p>Thank you for creating an account. Please verify your email to get started.</p>
          <div style="text-align:center">
            <a href="${verifyUrl}" class="btn">Verify Email Address</a>
          </div>
          <hr class="divider">
          <p style="font-size:13px; color:#6b7280">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
        </div>
        <div class="footer">© 2024 ModernShop Pro. All rights reserved.</div>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request — ModernShop Pro',
    html: `
      <style>${emailStyle}</style>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset</h1>
          <p>ModernShop Pro Security</p>
        </div>
        <div class="body">
          <h2>Hi ${user.name},</h2>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <div style="text-align:center">
            <a href="${resetUrl}" class="btn">Reset My Password</a>
          </div>
          <hr class="divider">
          <p style="font-size:13px; color:#6b7280">This link expires in 1 hour. If you didn't request this, your account is safe — ignore this email.</p>
        </div>
        <div class="footer">© 2024 ModernShop Pro. All rights reserved.</div>
      </div>
    `,
  });
};

const sendOrderConfirmationEmail = async (user, order) => {
  const itemsHtml = order.items
    .map(
      (item) => `
      <div class="order-item">
        <span>${item.title} × ${item.quantity}</span>
        <span><strong>$${((item.discountPrice || item.price) * item.quantity).toFixed(2)}</strong></span>
      </div>
    `
    )
    .join('');

  await sendEmail({
    to: user.email,
    subject: `Order Confirmed — ${order.orderNumber} | ModernShop Pro`,
    html: `
      <style>${emailStyle}</style>
      <div class="container">
        <div class="header">
          <h1>✅ Order Confirmed!</h1>
          <p>Thank you for shopping with ModernShop Pro</p>
        </div>
        <div class="body">
          <h2>Hi ${user.name}!</h2>
          <p>Your order <strong>${order.orderNumber}</strong> has been placed successfully.</p>
          <span class="badge">Order Confirmed</span>
          <hr class="divider">
          <h3>Order Summary</h3>
          ${itemsHtml}
          <hr class="divider">
          <div style="text-align:right">
            <p>Subtotal: <strong>$${order.itemsPrice.toFixed(2)}</strong></p>
            ${order.discountAmount > 0 ? `<p>Discount: <strong>-$${order.discountAmount.toFixed(2)}</strong></p>` : ''}
            <p>Shipping: <strong>${order.shippingPrice === 0 ? 'FREE' : '$' + order.shippingPrice.toFixed(2)}</strong></p>
            <p>Tax: <strong>$${order.taxPrice.toFixed(2)}</strong></p>
            <p style="font-size:18px">Total: <strong>$${order.totalPrice.toFixed(2)}</strong></p>
          </div>
          <hr class="divider">
          <h3>Shipping To</h3>
          <p>${order.shippingAddress.name}<br>${order.shippingAddress.street}<br>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}</p>
          <div style="text-align:center; margin-top:24px">
            <a href="${process.env.CLIENT_URL}/orders/${order._id}" class="btn">Track Your Order</a>
          </div>
        </div>
        <div class="footer">© 2024 ModernShop Pro. All rights reserved.</div>
      </div>
    `,
  });
};

const sendOrderStatusEmail = async (user, order) => {
  const statusMessages = {
    confirmed: { emoji: '✅', msg: 'Your order has been confirmed and is being prepared.' },
    packed: { emoji: '📦', msg: 'Your order has been packed and is ready for pickup.' },
    shipped: { emoji: '🚚', msg: 'Your order is on its way!' },
    out_for_delivery: { emoji: '🏃', msg: 'Your order is out for delivery today!' },
    delivered: { emoji: '🎉', msg: 'Your order has been delivered. Enjoy!' },
    cancelled: { emoji: '❌', msg: 'Your order has been cancelled.' },
    returned: { emoji: '↩️', msg: 'Your return has been processed.' },
  };

  const info = statusMessages[order.status] || { emoji: '📋', msg: 'Your order status has been updated.' };

  await sendEmail({
    to: user.email,
    subject: `Order Update — ${order.orderNumber} | ModernShop Pro`,
    html: `
      <style>${emailStyle}</style>
      <div class="container">
        <div class="header">
          <h1>${info.emoji} Order Update</h1>
          <p>${order.orderNumber}</p>
        </div>
        <div class="body">
          <h2>Hi ${user.name},</h2>
          <p>${info.msg}</p>
          <div style="text-align:center">
            <a href="${process.env.CLIENT_URL}/orders/${order._id}" class="btn">View Order Details</a>
          </div>
        </div>
        <div class="footer">© 2024 ModernShop Pro. All rights reserved.</div>
      </div>
    `,
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
};
