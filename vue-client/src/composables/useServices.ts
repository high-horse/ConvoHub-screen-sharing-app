// useServices.ts
import { createWebSocketService } from './useWebSocket';
import { createPeerManagementService } from './usePeerManagement';
import { createEventService } from './useEvents';
import { createScreenCaptureService } from './useScreenCapture';

export function useServices() {
  const webSocketService = createWebSocketService({} as any, {} as any);
  const peerManagementService = createPeerManagementService(webSocketService);
  const eventService = createEventService(peerManagementService, webSocketService);
  const screenCaptureService = createScreenCaptureService(webSocketService);

  // Update webSocketService with the created services
  Object.assign(webSocketService, { 
    peerManagementService, 
    eventService 
  });

  return {
    webSocketService,
    peerManagementService,
    eventService,
    screenCaptureService,
  };
}


/*

The recursion is occurring due to circular dependencies between your composables. Here’s how it happens:

    useWebSocket.ts imports and uses usePeerManagement.ts and useEvents.ts.
    usePeerManagement.ts imports and uses useWebSocket.ts.
    useEvents.ts imports and uses both usePeerManagement.ts and useWebSocket.ts.

This creates a circular dependency, causing an infinite loop when these composables try to instantiate each other.
Simplified Circular Dependency Explanation

    useWebSocket.ts calls usePeerManagement().
    usePeerManagement.ts calls useWebSocket().
    useWebSocket.ts then calls usePeerManagement() again, leading to a loop.

Resolving the Circular Dependency

To resolve this, you need to break the circular dependency.

*/