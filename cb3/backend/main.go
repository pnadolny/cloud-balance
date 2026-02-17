package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"cloud.google.com/go/datastore"
)

var (
	datastoreClient *datastore.Client
	projectID       string
)

func main() {
	// Get project ID from environment or default
	projectID = os.Getenv("GOOGLE_CLOUD_PROJECT")
	if projectID == "" {
		projectID = "mycloudbalance"
	}

	// Initialize Datastore client
	ctx := context.Background()
	var err error
	datastoreClient, err = datastore.NewClient(ctx, projectID)
	if err != nil {
		log.Fatalf("Failed to create datastore client: %v", err)
	}
	defer datastoreClient.Close()

	// Set up Gin router
	router := gin.Default()

	// CORS middleware
	router.Use(corsMiddleware())

	// API routes under /ng/resources (matching existing API)
	api := router.Group("/ng/resources")
	{
		// Transaction endpoints
		api.GET("/transaction", getTransactions)
		api.PUT("/transaction", createOrUpdateTransaction)
		api.DELETE("/transaction", deleteTransaction)

		// Payee endpoints
		api.GET("/payee", getPayees)
		api.PUT("/payee", createOrUpdatePayee)
		api.DELETE("/payee", deletePayee)

		// User endpoint
		api.GET("/user", getUser)
	}

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Printf("Starting server on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// CORS middleware
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
