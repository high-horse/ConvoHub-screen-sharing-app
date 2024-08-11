package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var (
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	clients     = make(map[string]*Client)
	clientsLock sync.RWMutex
	updateChan  = make(chan struct{}, 1)
)


func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	defer conn.Close()

	clientID := fmt.Sprintf("%d", time.Now().UnixNano())
	client := &Client{
		ID:   clientID,
		Conn: conn,
		done: make(chan struct{}),
	}

	// add client to register
	clientsLock.Lock()
	clients[clientID] = client
	clientsLock.Unlock()
	
	// Notify all clients about the new connection
	updateChan <- struct{}{}

	ctx, cancel := context.WithCancel(context.Background())
	
	go func() {
        <-client.done
        cancel()
    }()
	defer func() {
	 	cancel()
        conn.Close()
		// remove client on disconnect
		clientsLock.Lock()
		delete(clients, clientID)
		clientsLock.Unlock()
		
		// Notify all clients about the disconnection
		updateChan <- struct{}{}
		
		log.Printf("Client %s disconnected", clientID)
	}()
	
 	go readPump(ctx, client)
    go writePump(ctx, client)

    <-ctx.Done()	
}

func readPump(ctx context.Context, client *Client) {
	defer close(client.done)
	
    for {
        select {
        case <-ctx.Done():
            return
        default:
            _, msg, err := client.Conn.ReadMessage()
            if err != nil {
                log.Printf("Error reading message from client %s: %v", client.ID, err)
                return
            }
            var event Event
            if err := json.Unmarshal(msg, &event); err != nil {
                log.Printf("Error unmarshaling message from client %s: %v", client.ID, err)
                continue
            }
            handleEvent(client, event)
        }
    }
}


func writePump(ctx context.Context, client *Client) {
    ticker := time.NewTicker(30 * time.Second)
    defer ticker.Stop()
	// defer close(client.done)
    
    for {
        select {
        case <-ctx.Done():
            return
        case <-ticker.C:
            if err := client.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
                log.Printf("Error sending ping to client %s: %v", client.ID, err)
                return
            }
        }
    }
}


func parseEvent(msg string) Event {
	parts := strings.SplitN(msg, ":", 2)
	if len(parts) != 2 {
		return Event{
			Type:    "unknown",
			Payload: msg,
		}
	}
	return Event{
		Type:    parts[0],
		Payload: parts[1],
	}
}

// handleEvent processes events based on their type
func handleEvent(client *Client, event Event) {
	switch event.Type {
	case EventTypeImage:
		HandleImageEvent(client, event.Payload)
	case EventTypeText:
		handleTextEvent(client, event.Payload)
	default:
		log.Printf("Unknown event type: %s", event.Type)
	}
}

func broadcastClientUpdate() {
	clientsLock.RLock()
	defer clientsLock.RUnlock()
	
	var clientIDs []string
	for id := range clients {
		clientIDs = append(clientIDs, id)
	}
	
	log.Printf("Broadcasting client update. Current clients: %v", clientIDs)
	
	updateEvent := Event {
		Type: EventTypeUpdateClient,
		Payload: strings.Join(clientIDs, ","),
	}
	
	for _, client := range clients {
		err := sendMessage(client.Conn, updateEvent)
		if err != nil {
			log.Printf("Error sending update to client %s: %v", client.ID, err)
		}
	}
}

func sendMessage(conn *websocket.Conn, event Event)error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return conn.WriteMessage(websocket.TextMessage, data)
}

func startUpdateListener(ctx context.Context) {
    go func() {
        for {
            select {
            case <-ctx.Done():
                return
            case <-updateChan:
                broadcastClientUpdate()
            }
        }
    }()
}