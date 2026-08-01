// modules/billing/billing.types.ts
import type { Invoice, InvoiceItem, Patient } from '@/db/schema';

export type { Invoice, InvoiceItem } from '@/db/schema';
export type InvoiceStatusType = Invoice['status'];

export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number; // per-item discount
  tax?: number; // per-item tax
}

export interface CreateInvoiceInput {
  patientId: string;
  doctorMembershipId?: string | null;
  appointmentId?: string | null;
  issuedAt?: string;
  dueAt?: string | null;
  notes?: string | null;
  paymentMethod?: string | null;
  discount?: number; // invoice-level discount
  tax?: number; // invoice-level tax
  amountPaid?: number;
  items: InvoiceItemInput[];
}

export interface UpdateInvoiceInput {
  patientId?: string;
  doctorMembershipId?: string | null;
  appointmentId?: string | null;
  issuedAt?: string;
  dueAt?: string | null;
  status?: InvoiceStatusType;
  notes?: string | null;
  paymentMethod?: string | null;
  discount?: number;
  tax?: number;
  amountPaid?: number;
  items?: InvoiceItemInput[];
}

export interface ListInvoicesFilters {
  search?: string;
  patientId?: string;
  doctorMembershipId?: string;
  status?: InvoiceStatusType;
  paymentMethod?: string;
  from?: string; // date string YYYY-MM-DD
  to?: string; // date string YYYY-MM-DD
  page: number;
  pageSize: number;
  sortBy?: 'issuedAt' | 'totalAmount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface InvoiceWithDetails extends Invoice {
  patient: Pick<Patient, 'id' | 'fullName' | 'phone' | 'email'>;
  doctor: {
    membershipId: string;
    fullName: string;
    email: string;
  } | null;
  items: InvoiceItem[];
}

export interface ListInvoicesResult {
  invoices: InvoiceWithDetails[];
  total: number;
  page: number;
  pageSize: number;
}

export interface InvoiceStats {
  totalRevenue: number;
  outstandingPayments: number;
  invoicesGeneratedThisMonth: number;
  averageInvoiceValue: number;
  paidCount: number;
  unpaidCount: number;
  partiallyPaidCount: number;
  cancelledCount: number;
}
