// Define enum for event types
enum EventType {
  IMAGE = 'image',
  TEXT = 'text',
  // Add more event types as needed
}

// Define an interface for events
Object  Event  = {
  type: EventType;
  payload: string;
}
