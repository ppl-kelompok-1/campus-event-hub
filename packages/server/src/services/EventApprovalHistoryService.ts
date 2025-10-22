import { IEventApprovalHistoryRepository } from '../repositories/IEventApprovalHistoryRepository';
import { EventApprovalHistory, CreateEventApprovalHistoryDto, EventApprovalHistoryResponse, ApprovalAction } from '../models/EventApprovalHistory';

export class EventApprovalHistoryService {
  constructor(
    private approvalHistoryRepository: IEventApprovalHistoryRepository
  ) {}

  // Record a submission for approval
  recordSubmission(
    eventId: number,
    performedBy: number,
    performerName: string,
    statusBefore: string,
    statusAfter: string
  ): EventApprovalHistory {
    const dto: CreateEventApprovalHistoryDto = {
      eventId,
      action: 'submitted' as ApprovalAction,
      performedBy,
      performerName,
      statusBefore,
      statusAfter
    };

    return this.approvalHistoryRepository.create(dto);
  }

  // Record an approval
  recordApproval(
    eventId: number,
    performedBy: number,
    performerName: string,
    statusBefore: string,
    statusAfter: string
  ): EventApprovalHistory {
    const dto: CreateEventApprovalHistoryDto = {
      eventId,
      action: 'approved' as ApprovalAction,
      performedBy,
      performerName,
      statusBefore,
      statusAfter
    };

    return this.approvalHistoryRepository.create(dto);
  }

  // Record a revision request
  recordRevisionRequest(
    eventId: number,
    performedBy: number,
    performerName: string,
    comments: string,
    statusBefore: string,
    statusAfter: string
  ): EventApprovalHistory {
    const dto: CreateEventApprovalHistoryDto = {
      eventId,
      action: 'revision_requested' as ApprovalAction,
      performedBy,
      performerName,
      comments,
      statusBefore,
      statusAfter
    };

    return this.approvalHistoryRepository.create(dto);
  }

  // Get full approval history for an event
  async getEventHistory(eventId: number): Promise<EventApprovalHistoryResponse[]> {
    const history = this.approvalHistoryRepository.findByEventId(eventId);
    return history.map(this.toHistoryResponse);
  }

  // Get most recent approval action for an event
  async getLatestAction(eventId: number): Promise<EventApprovalHistoryResponse | null> {
    const latest = this.approvalHistoryRepository.findLatestByEventId(eventId);
    return latest ? this.toHistoryResponse(latest) : null;
  }

  // Get all actions performed by a specific user
  async getPerformerHistory(performerId: number): Promise<EventApprovalHistoryResponse[]> {
    const history = this.approvalHistoryRepository.findByPerformer(performerId);
    return history.map(this.toHistoryResponse);
  }

  // Helper to convert to response format
  private toHistoryResponse(history: EventApprovalHistory): EventApprovalHistoryResponse {
    return {
      id: history.id,
      eventId: history.eventId,
      action: history.action,
      performedBy: history.performedBy,
      performerName: history.performerName,
      comments: history.comments,
      statusBefore: history.statusBefore,
      statusAfter: history.statusAfter,
      createdAt: history.createdAt.toISOString()
    };
  }
}
