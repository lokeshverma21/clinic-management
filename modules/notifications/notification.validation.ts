import { z } from 'zod';

export const updateNotificationSettingsSchema = z.object({
  autoEmailRemindersEnabled: z.boolean(),
});
