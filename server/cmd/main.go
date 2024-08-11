package main

import (
	"context"
	"github.com/gin-gonic/gin"
)

func main() {
	
	// Create a root context that will be used to manage the lifecycle of the update listener
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel() // Ensure all resources are cleaned up when main exits

	// Start the update listener
	startUpdateListener(ctx)
	
	r := gin.Default()
	r.GET("/ws", func(ctx *gin.Context) {
		HandleWebSocket(ctx.Writer, ctx.Request)
	})
	r.Run(":8000")
}
