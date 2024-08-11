package main

import "github.com/gorilla/websocket"

type Client struct {
	ID string
	Conn *websocket.Conn
	done chan struct{}
}

type Event struct {
	Type string 	`json:"type"`
	Payload string 	`json:"payload"`
}

const (
	EventTypeImage = "IMAGE"
	EventTypeText = "TEXT"
	EventTypeUpdateClient = "UPDATE_CLIENT"
)