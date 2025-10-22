// Event approval action types
export type ApprovalAction = 'submitted' | 'approved' | 'revision_requested';

// Domain model for EventApprovalHistory entity
export interface EventApprovalHistory {
  id: number;
  eventId: number;
  action: ApprovalAction;
  performedBy: number;
  performerName: string; // Cached for historical accuracy
  comments?: string;
  statusBefore: string;
  statusAfter: string;
  createdAt: Date;
}

// DTO for creating approval history record
export interface CreateEventApprovalHistoryDto {
  eventId: number;
  action: ApprovalAction;
  performedBy: number;
  performerName: string;
  comments?: string;
  statusBefore: string;
  statusAfter: string;
}

// Response for API
export interface EventApprovalHistoryResponse {
  id: number;
  eventId: number;
  action: ApprovalAction;
  performedBy: number;
  performerName: string;
  comments?: string;
  statusBefore: string;
  statusAfter: string;
  createdAt: string; // ISO 8601 string
}
