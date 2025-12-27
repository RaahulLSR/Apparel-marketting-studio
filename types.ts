
export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER'
}

export enum OrderStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  AWAITING_FEEDBACK = 'Awaiting Customer Feedback',
  COMPLETED = 'Completed',
  REVISIONS_REQUESTED = 'Revisions Requested'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface Brand {
  id: string;
  customerId: string;
  name: string;
  logoUrl?: string;
  tagline?: string;
  description: string;
  colorPalette: string[];
  isPrimary: boolean;
  referenceAssets: string[];
}

export interface Attachment {
  id: string;
  orderId: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'result';
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  brandId: string;
  title: string;
  description: string;
  creativeExpectations: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  // Essential Details
  colors: string;
  sizes: string;
  features: string;
  targetAudience: string;
  usage: string;
  notes?: string;
  // Results
  adminNotes?: string;
  resultFiles?: Attachment[];
}
