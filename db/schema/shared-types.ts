// db/schema/shared-types.ts
export type WeeklyHours = Partial<Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', string[]>>;