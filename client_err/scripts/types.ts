// Define enum for event types
export enum EventType {
  IMAGE = 'image',
  TEXT = 'text',
  // Add more event types as needed
}

// Define an interface for events
export interface Event {
  type: EventType;
  payload: string;
}
