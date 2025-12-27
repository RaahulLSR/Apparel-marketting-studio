
import { Order, OrderStatus } from '../types';

/**
 * Simulates sending an email notification via SMTP.
 * In a production environment, this would call a backend API that uses 
 * process.env.SMTP_EMAIL, process.env.SMTP_PASSWORD, etc.
 */
export const sendNotification = (order: Order, type: 'status_update' | 'new_order' | 'revision') => {
  const subject = `[ApparelCreative] Order Update: ${order.title}`;
  let body = '';

  switch (type) {
    case 'status_update':
      body = `Your order status has changed to: ${order.status}.`;
      if (order.status === OrderStatus.AWAITING_FEEDBACK) {
        body += "\n\nAdmin has uploaded creative results. Please log in to review and provide feedback.";
      }
      break;
    case 'new_order':
      body = `A new order has been created: ${order.title}.`;
      break;
    case 'revision':
      body = `The customer has requested revisions for order: ${order.title}.\n\nNotes: ${order.notes || 'No specific notes.'}`;
      break;
  }

  console.log(`%c[SMTP SIMULATION] To: ${order.customerId}@brand.com\nSubject: ${subject}\n\n${body}`, "color: #4f46e5; font-weight: bold; border: 1px solid #4f46e5; padding: 8px; border-radius: 4px;");
  
  // In a real app, this would be:
  // fetch('/api/send-email', { method: 'POST', body: JSON.stringify({ to: '...', subject, body }) });
};
