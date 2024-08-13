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