package main

import (
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"
	"strings"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize: 	1024,
	WriteBufferSize:	1024,
	CheckOrigin: func(r *http.Request) bool {
        return true
    },
}


func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	defer conn.Close()
	
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			return
		}
		
		// Remove the data URL prefix
		base64data := strings.TrimPrefix(string(msg), "data:image/jpeg;base64,")
		
		// Decode base64 to image data
		imageData, err := base64.StdEncoding.DecodeString(base64data)
		if err != nil {
			log.Println("decode error", err)
			continue
		}
		capturesDir := "./captures"
		err = os.MkdirAll(capturesDir, os.ModePerm)
		if err != nil {
			log.Fatalf("failed to create directory, %v",err)
		}
		
		filename :=fmt.Sprintf("captured_image_%d.jpg",time.Now().UnixNano())
		filePath := path.Join(capturesDir, filename)
		
		err =os.WriteFile(filePath, imageData, 0644)
		if err != nil {
			log.Println("file write error", err)
			continue
		}
		// conn.WriteMessage(websocket.TextMessage, msg)
		log.Printf("image saved : %s \n", filename)
	}
}