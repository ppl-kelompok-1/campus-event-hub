import { Event, CreateEventDto, UpdateEventDto, EventStatus } from '../models/Event';

export interface IEventRepository {
  // Create operations
  create(eventData: CreateEventDto, createdBy: number): Promise<Event>;

  // Read operations
  findById(id: number): Promise<Event | null>;
  findAll(): Promise<Event[]>;
  findByCreator(createdBy: number): Promise<Event[]>;
  findByStatus(status: EventStatus): Promise<Event[]>;
  findPublishedEvents(): Promise<Event[]>;
  findPaginated(page: number, limit: number, status?: EventStatus): Promise<{
    events: Event[];
    total: number;
    page: number;
    totalPages: number;
  }>;

  // Update operations
  update(id: number, eventData: UpdateEventDto): Promise<Event | null>;
  updateStatus(id: number, status: EventStatus): Promise<boolean>;

  // Delete operations
  delete(id: number): Promise<boolean>;

  // Utility operations
  exists(id: number): Promise<boolean>;
  isCreator(eventId: number, userId: number): Promise<boolean>;
  getCreatorName(eventId: number): Promise<string | null>;
}