import { IEmailService } from "@application/services/IEmailService";
import { StudentModel } from "@infrastructure/database/models/student/student.model";
import { INotificationRepository } from "@domain/repositories/INotificationRepository";
import { Notification } from "@domain/entities/Notification";
import { NotificationRole } from "@domain/enums/NotificationRole.enum";
import { NotificationType } from "@domain/enums/NotificationType.enum";

export class SendPlacementReadinessReminderUseCase {
  constructor(
    private readonly emailService: IEmailService,
    private readonly notificationRepository: INotificationRepository
  ) {}

  async execute(collegeId: string, studentId: string, recommendedAction: string): Promise<boolean> {
    const student = await StudentModel.findOne({ _id: studentId, collegeId, isDeleted: false });
    if (!student) {
      throw new Error("Student not found or unauthorized");
    }

    const studentName = `${student.firstName} ${student.lastName}`;

    // Create In-App Notification
    await this.notificationRepository.create({
      recipientId: studentId,
      role: NotificationRole.STUDENT,
      title: "Placement Readiness Update",
      message: `Your college placement cell has recommended an action to improve your placement readiness: ${recommendedAction}`,
      type: NotificationType.INFO,
      link: "/student/profile",
      isRead: false
    } as any);

    // Send Email
    if (student.email) {
      await this.emailService.sendPlacementReadinessReminder(student.email, studentName, recommendedAction);
    }

    return true;
  }
}
