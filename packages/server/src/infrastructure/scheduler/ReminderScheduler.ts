import cron from 'node-cron';
import { ReminderService } from '../../services/ReminderService';

export class ReminderScheduler {
  private reminderService: ReminderService;

  constructor(reminderService: ReminderService) {
    this.reminderService = reminderService;
  }

  start(): void {
    // Run every minute
    cron.schedule('* * * * *', async () => {
      console.log('[ReminderScheduler] Running 1-minute reminder check...');

      try {
        // Run both reminder checks in parallel
        await Promise.all([
          this.reminderService.sendEventAttendanceReminders(),
          this.reminderService.sendRegistrationDeadlineReminders()
        ]);
      } catch (error) {
        console.error('[ReminderScheduler] Error in scheduled reminder check:', error);
      }
    });

    console.log('[ReminderScheduler] Reminder scheduler started (runs every minute)');
  }
}
