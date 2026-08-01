import { relations } from 'drizzle-orm';
import { clinics } from './clinics';
import { users } from './users';
import { memberships } from './memberships';
import { staffProfiles } from './staffProfiles';
import { subscriptions } from './subscriptions';
import { patients } from './patients';
import { appointments } from './appointments';
import { notifications } from './notifications';
import { invoices } from './invoices';
import { invoiceItems } from './invoiceItems';
import { auditLogs } from './auditLogs';

// platformUsers deliberately has no relations defined — see platformUsers.ts

export const clinicsRelations = relations(clinics, ({ many, one }) => ({
  memberships: many(memberships),
  patients: many(patients),
  appointments: many(appointments),
  notifications: many(notifications),
  invoices: many(invoices),
  auditLogs: many(auditLogs),
  subscription: one(subscriptions, {
    fields: [clinics.id],
    references: [subscriptions.clinicId],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(memberships),
}));

export const membershipsRelations = relations(memberships, ({ one, many }) => ({
  clinic: one(clinics, { fields: [memberships.clinicId], references: [clinics.id] }),
  user: one(users, { fields: [memberships.userId], references: [users.id] }),
  staffProfile: one(staffProfiles, {
    fields: [memberships.id],
    references: [staffProfiles.membershipId],
  }),
  doctorAppointments: many(appointments, { relationName: 'doctorAppointments' }),
  createdAppointments: many(appointments, { relationName: 'createdAppointments' }),
  doctorInvoices: many(invoices, { relationName: 'doctorInvoices' }),
  auditLogs: many(auditLogs),
}));

export const staffProfilesRelations = relations(staffProfiles, ({ one }) => ({
  membership: one(memberships, {
    fields: [staffProfiles.membershipId],
    references: [memberships.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  clinic: one(clinics, { fields: [subscriptions.clinicId], references: [clinics.id] }),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  clinic: one(clinics, { fields: [patients.clinicId], references: [clinics.id] }),
  appointments: many(appointments),
  notifications: many(notifications),
  invoices: many(invoices),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  clinic: one(clinics, { fields: [appointments.clinicId], references: [clinics.id] }),
  patient: one(patients, { fields: [appointments.patientId], references: [patients.id] }),
  doctor: one(memberships, {
    fields: [appointments.doctorMembershipId],
    references: [memberships.id],
    relationName: 'doctorAppointments',
  }),
  createdBy: one(memberships, {
    fields: [appointments.createdByMembershipId],
    references: [memberships.id],
    relationName: 'createdAppointments',
  }),
  notifications: many(notifications),
  invoices: many(invoices),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  clinic: one(clinics, { fields: [notifications.clinicId], references: [clinics.id] }),
  appointment: one(appointments, {
    fields: [notifications.appointmentId],
    references: [appointments.id],
  }),
  patient: one(patients, { fields: [notifications.patientId], references: [patients.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  clinic: one(clinics, { fields: [invoices.clinicId], references: [clinics.id] }),
  patient: one(patients, { fields: [invoices.patientId], references: [patients.id] }),
  appointment: one(appointments, {
    fields: [invoices.appointmentId],
    references: [appointments.id],
  }),
  doctor: one(memberships, {
    fields: [invoices.doctorMembershipId],
    references: [memberships.id],
    relationName: 'doctorInvoices',
  }),
  items: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceItems.invoiceId], references: [invoices.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  clinic: one(clinics, { fields: [auditLogs.clinicId], references: [clinics.id] }),
  actor: one(memberships, {
    fields: [auditLogs.actorMembershipId],
    references: [memberships.id],
  }),
}));
