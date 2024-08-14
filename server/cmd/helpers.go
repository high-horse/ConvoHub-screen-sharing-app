package main

import (
	"fmt"
	"strings"
)



func getClientIDs() string {
	clientsLock.RLock()
	defer clientsLock.RUnlock()

	var ids []string
	for id := range clients {
		ids = append(ids, id)
	}
	clientList := strings.Join(ids, ",")
	fmt.Printf("Current clients: %s", clientList)
	return clientList
}



func pairClients(client1ID, client2ID string) error {
	fmt.Println("pairing: %s \t and %s\t", client1ID, client2ID)
    pairMutex.Lock()
    defer pairMutex.Unlock()

    if _, exists := pairedClients[client1ID]; exists {
        return fmt.Errorf("client %s is already paired", client1ID)
    }
    if _, exists := pairedClients[client2ID]; exists {
        return fmt.Errorf("client %s is already paired", client2ID)
    }

    pairedClients[client1ID] = client2ID
    pairedClients[client2ID] = client1ID
    return nil
}

func unpairClient(clientID string) {
    pairMutex.Lock()
    defer pairMutex.Unlock()

    if pairedID, exists := pairedClients[clientID]; exists {
        delete(pairedClients, clientID)
        delete(pairedClients, pairedID)
    }
}

func getPairedClient(clientID string) (string, bool) {
    pairMutex.RLock()
    defer pairMutex.RUnlock()

    pairedID, exists := pairedClients[clientID]
    return pairedID, exists
}

func logAllPairedClients() {
    pairMutex.RLock()
    defer pairMutex.RUnlock()
    println("")
    println("")
    fmt.Println("Current paired clients:")
    if len(pairedClients) == 0 {
        fmt.Println("No clients are currently paired.")
    } else {
        for client1, client2 := range pairedClients {
            fmt.Printf("Client %s is paired with Client %s\n", client1, client2)
        }
    }
    fmt.Println("End of paired clients list")
}
