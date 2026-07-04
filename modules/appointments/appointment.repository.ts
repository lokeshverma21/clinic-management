// Create new appointments
// Read/fetch appointments (by ID, date, doctor, patient, etc.)
// Update existing appointments
// Delete/cancel appointments

// appointment.repository.ts

// import { db } from '../db'; // your Drizzle database connection
// import { appointments } from '../schema/appointments'; // your table schema
// import { eq } from 'drizzle-orm';

// export class AppointmentRepository {
//   // Create a new appointment
//   async createAppointment(data: {
//     doctorId: number;
//     patientId: number;
//     date: Date;
//     status: string;
//   }) {
//     const result = await db.insert(appointments).values(data).returning();
//     return result[0];
//   }

//   // Find appointment by ID
//   async findById(id: number) {
//     const result = await db
//       .select()
//       .from(appointments)
//       .where(eq(appointments.id, id));
//     return result[0] || null;
//   }

//   // Find all appointments for a doctor
//   async findByDoctor(doctorId: number) {
//     return db
//       .select()
//       .from(appointments)
//       .where(eq(appointments.doctorId, doctorId));
//   }

//   // Update appointment
//   async updateAppointment(id: number, updates: Partial<typeof appointments.$inferInsert>) {
//     await db.update(appointments).set(updates).where(eq(appointments.id, id));
//   }

//   // Delete appointment
//   async deleteAppointment(id: number) {
//     await db.delete(appointments).where(eq(appointments.id, id));
//   }
// }
