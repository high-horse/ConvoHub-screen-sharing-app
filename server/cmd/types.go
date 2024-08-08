package main

import "github.com/gorilla/websocket"

type Client struct {
	ID string
	Conn *websocket.Conn
}

type Event struct {
	Type string
	Payload string
}

const (
	EventTypeImage = "IMAGE"
	EventTypeText = "TEXT"
)