package main

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"cloud.google.com/go/datastore"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"
)

// getTransactions handles GET /ng/resources/transaction
func getTransactions(c *gin.Context) {
	ctx := context.Background()

	// Parse query parameters
	monthStr := c.Query("month")
	yearStr := c.Query("year")

	// Build query
	query := datastore.NewQuery(KindTransaction).Order("date")

	// Apply date filters if provided
	if monthStr != "" && yearStr != "" {
		month, _ := strconv.Atoi(monthStr)
		year, _ := strconv.Atoi(yearStr)

		// Start of month
		startDate := time.Date(year, time.Month(month+1), 1, 0, 0, 0, 0, time.UTC)
		// End of month
		endDate := time.Date(year, time.Month(month+1)+1, 0, 23, 59, 59, 0, time.UTC)

		query = query.Filter("date >=", startDate).Filter("date <=", endDate)
	}

	// Get all payees to map types
	payeeMap := make(map[string]string)
	payeeQuery := datastore.NewQuery(KindPayee)
	payeeIter := datastoreClient.Run(ctx, payeeQuery)
	for {
		var p Payee
		key, err := payeeIter.Next(&p)
		if err == iterator.Done {
			break
		}
		if err != nil {
			continue
		}
		p.Name = key.Name
		payeeMap[p.Name] = p.Type
	}

	// Execute query
	var transactions []Transaction
	iter := datastoreClient.Run(ctx, query)
	for {
		var t Transaction
		key, err := iter.Next(&t)
		if err == iterator.Done {
			break
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Filter by Default Account (check parent hierarchy)
		if key.Parent != nil && key.Parent.Parent != nil {
			if key.Parent.Parent.Name == DefaultAccount {
				t.ID = key.ID
				t.Type = payeeMap[t.Payee]
				transactions = append(transactions, t)
			}
		}
	}

	c.JSON(http.StatusOK, transactions)
}

// createOrUpdateTransaction handles PUT /ng/resources/transaction
func createOrUpdateTransaction(c *gin.Context) {
	ctx := context.Background()

	// Parse query parameters
	name := c.Query("name")
	payee := c.Query("payee")
	amountStr := c.Query("amount")
	dateStr := c.Query("date")
	memo := c.Query("memo")

	// Parse amount
	amount, err := strconv.ParseFloat(amountStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid amount"})
		return
	}

	// Parse date (ISO format: "2006-01-02T15:04:05.000Z")
	date, err := time.Parse("2006-01-02T15:04:05.000Z", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}

	// Create transaction
	transaction := &Transaction{
		Payee:  payee,
		Amount: amount,
		Date:   date,
		Memo:   memo,
		Marked: "n",
	}

	var key *datastore.Key
	if name == "" {
		// New transaction
		key = TransactionKey(payee, 0)
	} else {
		// Update existing transaction
		id, _ := strconv.ParseInt(name, 10, 64)
		key = TransactionKey(payee, id)
	}

	// Save to datastore
	key, err = datastoreClient.Put(ctx, key, transaction)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return entity with key
	c.JSON(http.StatusOK, gin.H{
		"key": gin.H{
			"id":   key.ID,
			"name": key.Name,
		},
	})
}

// deleteTransaction handles DELETE /ng/resources/transaction
func deleteTransaction(c *gin.Context) {
	ctx := context.Background()

	id := c.Query("id")
	parentid := c.Query("parentid")

	if id == "" || parentid == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing id or parentid"})
		return
	}

	// Parse ID
	txID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id"})
		return
	}

	// Create key
	key := TransactionKey(parentid, txID)

	// Delete from datastore
	if err := datastoreClient.Delete(ctx, key); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Transaction deleted successfully."})
}

// getPayees handles GET /ng/resources/payee
func getPayees(c *gin.Context) {
	ctx := context.Background()

	// Query all payees
	query := datastore.NewQuery(KindPayee)
	var payees []Payee

	iter := datastoreClient.Run(ctx, query)
	for {
		var p Payee
		key, err := iter.Next(&p)
		if err == iterator.Done {
			break
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		p.Name = key.Name
		payees = append(payees, p)
	}

	c.JSON(http.StatusOK, payees)
}

// createOrUpdatePayee handles PUT /ng/resources/payee
func createOrUpdatePayee(c *gin.Context) {
	ctx := context.Background()

	name := c.Query("name")
	payeeType := c.Query("type")

	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing name"})
		return
	}

	payee := &Payee{
		Type: payeeType,
	}

	key := PayeeKey(name)
	_, err := datastoreClient.Put(ctx, key, payee)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payee saved successfully."})
}

// deletePayee handles DELETE /ng/resources/payee
func deletePayee(c *gin.Context) {
	ctx := context.Background()

	name := c.Query("id")
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing id"})
		return
	}

	// Check if payee has transactions
	query := datastore.NewQuery(KindTransaction).Ancestor(PayeeKey(name)).Limit(1)
	iter := datastoreClient.Run(ctx, query)
	_, err := iter.Next(nil)
	if err != iterator.Done {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"message": "Cannot delete payee with existing transactions",
			},
		})
		return
	}

	// Delete payee
	key := PayeeKey(name)
	if err := datastoreClient.Delete(ctx, key); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payee deleted successfully."})
}

// getUser handles GET /ng/resources/user
func getUser(c *gin.Context) {
	// Mock user data for now - in production, use App Engine Users API
	c.JSON(http.StatusOK, []gin.H{
		{
			"email":     "user@example.com",
			"logoutURL": "/_ah/logout",
		},
	})
}
