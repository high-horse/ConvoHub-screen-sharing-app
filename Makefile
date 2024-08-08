.PHONY: server client help npm-compile npm-run

server:
	cd server/cmd && go run .

client:
	cd client && node client.js
	
npm-compile:
	cd clients && npm run build
	
npm-run:
	cd clients &&npm start

help:
	@echo "Usage:"
	@echo "  make server  - Run the server"
	@echo "  make client  - Run the client"
	@echo "  make help    - Show this help message"
