package main

import (
	"github.com/gorilla/websocket"
)

type Client struct {
	ID string
	Conn *websocket.Conn
	Send chan Event
}

type Event struct {
    Type    string `json:"type"`
    Payload string `json:"payload"`
}

const (
	EventTypeImage = "IMAGE"
	EventTypeText = "TEXT"
	EventTypeUpdateClient = "UPDATE_CLIENT"
	EventNewConnection = "NEW_CONNECTION"
	EventTypeReady = "CLIENT_READY"
	EventPeerRequest = "PEER_REQUEST_SEND"
	EventPeerRequestResponse = "PEER_REQUEST_RESPONSE"
)

// var readDeadlineLimit = time.Now().Add(60 * time.Second)
// var writeDeadlineLimit = time.Now().Add(10 * time.Second)
var readLimit = 10 * 1024 * 1024

type PairRequest struct {
	PeerID string `json:"peerId"`
	Message string 	`json:"message"`
}