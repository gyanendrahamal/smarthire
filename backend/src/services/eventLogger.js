import prisma from '../config/db.js';
import { emitToUser } from '../sockets/socketHandler.js';

export const logApplicationEvent = async ({
  applicationId,
  actorId = null,
  eventType,
  previousStatus = null,
  newStatus = null,
  metadata = null,
}) => {
  try {
    const event = await prisma.applicationEvent.create({
      data: {
        applicationId,
        actorId,
        eventType,
        previousStatus,
        newStatus,
        metadata: metadata ? (typeof metadata === 'object' ? JSON.stringify(metadata) : String(metadata)) : null,
      },
      include: {
        actor: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    // Notify candidate that application status or timeline has updated
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { candidateId: true },
    });

    if (app?.candidateId) {
      emitToUser(app.candidateId, 'application_updated', {
        applicationId,
        eventType,
        newStatus,
        event,
      });
    }

    return event;
  } catch (error) {
    console.error('Error logging application event:', error);
    return null;
  }
};
