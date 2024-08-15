package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path"
	"strings"
	"time"
)

func HandleImageEvent(client *Client, payload string) {
	// Remove the data URL prefix
	base64data := strings.TrimPrefix(string(payload), "data:image/jpeg;base64,")

	// Decode base64 to image data
	imageData, err := base64.StdEncoding.DecodeString(base64data)
	if err != nil {
		log.Println("decode error", err)
		return
	}
	capturesDir := "./captures"
	err = os.MkdirAll(capturesDir, os.ModePerm)
	if err != nil {
		log.Printf("failed to create directory: %v", err)
	}

	filename := fmt.Sprintf("captured_image_%d.jpg", time.Now().UnixNano())
	filePath := path.Join(capturesDir, filename)

	err = os.WriteFile(filePath, imageData, 0644)
	if err != nil {
		log.Println("file write error", err)
		return
	}
	// conn.WriteMessage(websocket.TextMessage, msg)
	log.Printf("image saved : %s \n", filename)
}

func handleTextEvent(client *Client, payload string) {
	// Handle text event (example: just logging the text)
	log.Printf("Received text from client %s: %s\n", client.ID, payload)
}

func HandlePeerRequestEvent(client *Client, payload string) {
	pairReq := PairRequest{}

	err := json.Unmarshal([]byte(payload), &pairReq)
	if err != nil {
		log.Println("error decoding json:", err)
		return
	}
	newPayload, err := json.Marshal(PairRequest{
		PeerID:  client.ID,
		Message: pairReq.Message,
	})
	if err != nil {
		log.Println("error marshalling payload:", err)
		return
	}
	event := Event{
		Type:    EventPeerRequest,
		Payload: string(newPayload),
	}
	if client, exists := clients[pairReq.PeerID]; exists {
		client.Send <- event
	} else {
		fmt.Println("Client with ID %s not found.", pairReq.PeerID)
	}
}

func HandlePeerRequestResponseEvent(client *Client, payload string) {
	pairRes := PairRequest{}
	err := json.Unmarshal([]byte(payload), &pairRes)
	if err != nil {
		log.Println("error decoding json:", err)
		return
	}

	newPayload, err := json.Marshal(PairRequest{
		PeerID:  client.ID,
		Message: pairRes.Message,
	})
	if err != nil {
		log.Println("error marshalling payload:", err)
		return
	}

	event := Event{
		Type:    EventPeerRequestResponse,
		Payload: string(newPayload),
	}
	if peerClient, exists := clients[pairRes.PeerID]; exists {
		peerClient.Send <- event

		resMes := strings.Split(pairRes.Message, ":")
		if resMes[1] == "true" {

			err := pairClients(pairRes.PeerID, client.ID)
			if err != nil {
				log.Printf("Error pairing clients: %v", err)
				return
			}

			client.Send <- Event{
				Type:    EventPeerPaired,
				Payload: pairRes.PeerID,
			}
			peerClient.Send <- Event{
				Type:    EventPeerPaired,
				Payload: client.ID,
			}
			logAllPairedClients()
		}
	} else {
		fmt.Printf("Client with ID %s not found.\n", pairRes.PeerID)
	}
}

func HandleStreamImagePeerEvent(client *Client, payload string) {
	// get the pair id from pair, and stream it to the client id
	peerId, exists := getPairedClient(client.ID)
	if exists {
		if peerClient, exists := clients[peerId]; exists {

			peerClient.Send <- Event{
				Type:    EventStreamImagePeer,
				Payload: payload,
			}
		}
	} else {
		fmt.Printf("Client with ID %s or %s is not found in the pair registry.\n", peerId, client.ID)
	}
}


func HandlePeerDisconnectEvent(client *Client, event Event) {
	// disconnectRe := event.Payload
	// TODO : implement and cleanup
}
