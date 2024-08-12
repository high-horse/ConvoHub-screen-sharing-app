package main

import (
	"time"

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
)

var readDeadlineLimit = time.Now().Add(60 * time.Second)
var writeDeadlineLimit = time.Now().Add(10 * time.Second)
var readLimit = 10 * 1024 * 1024