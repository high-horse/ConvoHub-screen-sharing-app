package main

import (
	"encoding/base64"
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

	filename :=fmt.Sprintf("captured_image_%d.jpg",time.Now().UnixNano())
	filePath := path.Join(capturesDir, filename)

	err =os.WriteFile(filePath, imageData, 0644)
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