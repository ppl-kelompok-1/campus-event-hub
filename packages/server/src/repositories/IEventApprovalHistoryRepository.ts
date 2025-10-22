import { EventApprovalHistory, CreateEventApprovalHistoryDto } from '../models/EventApprovalHistory';

export interface IEventApprovalHistoryRepository {
  // Create a new approval history record
  create(dto: CreateEventApprovalHistoryDto): EventApprovalHistory;

  // Find all history records for a specific event
  findByEventId(eventId: number): EventApprovalHistory[];

  // Find all history records by a specific performer
  findByPerformer(performerId: number): EventApprovalHistory[];

  // Find the most recent approval action for an event
  findLatestByEventId(eventId: number): EventApprovalHistory | undefined;

  // Find a specific history record by ID
  findById(id: number): EventApprovalHistory | undefined;
}
