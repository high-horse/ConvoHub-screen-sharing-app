package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/ws", func(ctx *gin.Context) {
		HandleWebSocket(ctx.Writer, ctx.Request)
	})
	r.Run(":8000")
}
