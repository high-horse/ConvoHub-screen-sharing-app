package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var (
	upgrader = websocket.Upgrader{
		ReadBufferSize:  10 * 1024 * 1024,
		WriteBufferSize: 10 * 1024 * 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	clients     = make(map[string]*Client)
	clientsLock sync.RWMutex
	broadcast   = make(chan Event)
)

var (
	pairedClients = make(map[string]string)
    pairMutex     sync.RWMutex
)

func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error upgrading connection: %v", err)
		http.Error(w, "Could not open websocket connection", http.StatusBadRequest)
		// http.NotFound(w, r)
		return
	}
	defer conn.Close()

	client := &Client{
		ID:   fmt.Sprintf("%d", time.Now().UnixNano()),
		Conn: conn,
		Send: make(chan Event),
	}

	// add client to register
	clientsLock.Lock()
	clients[client.ID] = client
	clientsLock.Unlock()

	log.Printf("New client connected: %s", client.ID)

	go client.writePump()
	go client.readPump()

	select {}
}

func (c *Client) readPump() {
	defer func() {
		c.Conn.Close()
		log.Printf("READClient %s disconnected", c.ID)
		clientsLock.Lock()
		delete(clients, c.ID)
		clientsLock.Unlock()
		broadcast <- Event{Type: EventTypeUpdateClient, Payload: getClientIDs()}
	}()

	c.Conn.SetReadLimit(int64(readLimit))
	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second)) // Update deadline dynamically
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second)) // Reset deadline on pong
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Unexpected close error: %v", err)
			}
			break
		}

		// log.Printf("Received message from client %s: %s", c.ID, string(message))

		var event Event
		if err := json.Unmarshal(message, &event); err != nil {
			log.Printf("Error unmarshaling message: %v", err)
			log.Printf("error : %v", err)
			continue
		}
		log.Printf("Parsed event from client %s: Type: %s, Payload length: %d", c.ID, event.Type, len(event.Payload))
		handleEvent(c, event)
		// Handle the message...
		// // Stop listening once the client is ready
        if event.Type == EventTypeReady {
            broadcast <- Event{Type: EventTypeUpdateClient, Payload: getClientIDs()}
        }
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
		log.Printf("WRITEClient %s disconnected", c.ID)
	}()

	for {
		select {
		case event, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second)) // Update deadline dynamically
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			json.NewEncoder(w).Encode(event)

			if err := w.Close(); err != nil {
				log.Printf("Error closing writer: %v", err)
				return
			}

			log.Printf("Sent message to client %s: %+v", c.ID, event)

		case <-ticker.C:
			clientsLock.RLock()
			_, exists := clients[c.ID]
			clientsLock.RUnlock()
			if exists {
				c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second)) // Update deadline dynamically
				if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
					log.Printf("Error sending ping to client %s: %v", c.ID, err)
					c.removeClient()
					return
				}
			}
		}
	}
}

// removeClient safely removes a client from the clients map
func (c *Client) removeClient() {
	clientsLock.Lock()
	defer clientsLock.Unlock()
	
	// cleanup pair register.
	unpairClient(c.ID)
	
	delete(clients, c.ID)
	close(c.Send)
	log.Printf("Client %s removed", c.ID)
	broadcast <- Event{Type: EventTypeUpdateClient, Payload: getClientIDs()}
}

// handleEvent processes events based on their type
func handleEvent(client *Client, event Event) {
	log.Printf("Handling event from client %s: Type: %s\n", client.ID, event.Type)
	switch event.Type {
	case EventTypeReady:
		newClient := Event{
			Type:    EventNewConnection,
			Payload: client.ID,
		}
		client.Send <- newClient
		// broadcast <- Event{Type: EventTypeUpdateClient, Payload: getClientIDs()}

	case EventTypeImage:
		HandleImageEvent(client, event.Payload)
	case EventTypeText:
		handleTextEvent(client, event.Payload)
	case EventPeerRequest:
		HandlePeerRequestEvent(client, event.Payload)
	case EventPeerRequestResponse: 
		HandlePeerRequestResponseEvent(client, event.Payload)
	case EventStreamImagePeer:
		HandleStreamImagePeerEvent(client, event.Payload)
	case EventDisconnectStreamPair:
		HandlePeerDisconnectEvent(client, event)
		break
		
	default:
		log.Printf("Unknown event type: %s \t\t %s\n", event.Type, event.Payload)
	}
}

func broadcastHandler() {
	for {
		event := <-broadcast
		log.Printf("Broadcasting event: %+v", event)
		clientsLock.RLock()
		for _, client := range clients {
			select {
			case client.Send <- event:
				log.Printf("Sent broadcast to client %s", client.ID)

			// default:
			// 	log.Printf("Failed to send broadcast to client %s, removing client", client.ID)
			// 	close(client.Send)
			// 	delete(clients, client.ID)
			
			case <-time.After(time.Second * 5): // Timeout to prevent blocking indefinitely
				log.Printf("Failed to send broadcast to client %s, removing client", client.ID)
				close(client.Send)
				delete(clients, client.ID)
			}
		}
		clientsLock.RUnlock()
	}
}
