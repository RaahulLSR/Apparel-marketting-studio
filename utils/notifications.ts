
import { Order, OrderStatus } from '../types';

/**
 * Safely get environment variables across different build tools
 */
const getEnvVar = (key: string): string | undefined => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}
  return undefined;
};

/**
 * Simulates sending an email notification via SMTP.
 * In a production environment, this would call a backend API that uses 
 * GMAIL_USER and GMAIL_APP_PASSWORD.
 */
export const sendNotification = (order: Order, type: 'status_update' | 'new_order' | 'revision') => {
  const subject = `[ApparelCreative] Order Update: ${order.title}`;
  let body = '';

  const gmailUser = getEnvVar('GMAIL_USER') || 'Not Set';

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

  // Implementation uses GMAIL_USER and GMAIL_APP_PASSWORD for authentication in production
  console.log(`%c[SMTP SIMULATION] To: ${order.customerId}@brand.com\nSubject: ${subject}\nUsing Auth User: ${gmailUser}\n\n${body}`, "color: #4f46e5; font-weight: bold; border: 1px solid #4f46e5; padding: 8px; border-radius: 4px;");
};
