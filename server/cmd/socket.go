package main

import (
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
	}

	// add client to register
	clientsLock.Lock()
	clients[clientID] = client
	clientsLock.Unlock()

	defer func() {
		// remove client on disconnect
		clientsLock.Lock()
		delete(clients, clientID)
		clientsLock.Unlock()
	}()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			return
		}

		event := parseEvent(string(msg))
		handleEvent(client, event)
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
