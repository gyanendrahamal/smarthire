import prisma from '../config/db.js';
import { emitToUser } from '../sockets/socketHandler.js';

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedApplicationId = null,
  relatedInterviewId = null,
}) => {
  try {
    // Check if duplicate unread notification exists within the last 1 minute to prevent spamming
    const recentDuplicate = await prisma.notification.findFirst({
      where: {
        userId,
        type,
        relatedApplicationId,
        isRead: false,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000),
        },
      },
    });

    if (recentDuplicate) {
      return recentDuplicate;
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedApplicationId,
        relatedInterviewId,
        deliveries: {
          create: {
            channel: 'IN_APP',
            deliveryStatus: 'SENT',
            sentAt: new Date(),
          },
        },
      },
      include: {
        deliveries: true,
      },
    });

    // Real-time delivery
    emitToUser(userId, 'new_notification', notification);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};
