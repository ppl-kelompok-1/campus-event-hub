export interface IReminderLogRepository {
  createLog(eventId: number, userId: number | null, reminderType: ReminderType): Promise<void>;
  hasReminderBeenSent(eventId: number, userId: number | null, reminderType: ReminderType): Promise<boolean>;
  getReminderLogs(eventId: number): Promise<ReminderLog[]>;
}

export enum ReminderType {
  EVENT_ATTENDANCE = 'event_attendance',
  REGISTRATION_DEADLINE = 'registration_deadline'
}

export interface ReminderLog {
  id: number;
  eventId: number;
  userId: number | null;
  reminderType: ReminderType;
  sentAt: Date;
  createdAt: Date;
}
