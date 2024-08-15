package main

import (
	"github.com/gorilla/websocket"
)

// type ClientID string

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
	EventPeerPaired = "PEER_PAIRED"
	EventStreamImagePeer = "STREAM_IMAGE_PEER"
	EventDisconnectStreamPair = "DISCONNECT_PAIR_SHARING"
)

var readLimit = 10 * 1024 * 1024

type PairRequest struct {
	PeerID string `json:"peerId"`
	Message string 	`json:"message"`
}