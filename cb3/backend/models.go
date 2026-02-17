package main

import (
	"time"

	"cloud.google.com/go/datastore"
)

const (
	// Entity kinds
	KindTransaction = "Transaction"
	KindPayee       = "Payee"
	KindAccountName = "AccountName"

	// Default account
	DefaultAccount = "Default Account"
)

// Transaction types
const (
	TypeIncome        = "i" // Income
	TypeStatic        = "s" // Static/recurring bills
	TypeDiscretionary = "d" // Discretionary spending
	TypeFuture        = "f" // Future/planned expenses
)

// AccountName represents the root entity in the hierarchy
type AccountName struct {
	Name string `datastore:"-"` // Key name
}

// Payee represents a payee entity
type Payee struct {
	Name string `datastore:"-"` // Key name
	Type string `datastore:"type"`
}

// Transaction represents a financial transaction
type Transaction struct {
	ID     int64     `datastore:"-" json:"name"`           // Key ID
	Payee  string    `datastore:"payee" json:"payee"`      // Payee name
	Amount float64   `datastore:"amount" json:"amount"`    // Transaction amount
	Date   time.Time `datastore:"date" json:"date"`        // Transaction date
	Memo   string    `datastore:"memo" json:"memo"`        // Optional memo
	Type   string    `datastore:"-" json:"type"`           // Transaction type (derived from payee)
	Marked string    `datastore:"marked" json:"marked"`    // Starred flag (y/n)
}

// TransactionKey creates a datastore key for a transaction
func TransactionKey(payeeName string, id int64) *datastore.Key {
	accountKey := datastore.NameKey(KindAccountName, DefaultAccount, nil)
	accountKey.Namespace = ""
	
	payeeKey := datastore.NameKey(KindPayee, payeeName, accountKey)
	payeeKey.Namespace = ""
	
	if id == 0 {
		// Incomplete key for new entities
		return datastore.IncompleteKey(KindTransaction, payeeKey)
	}
	
	txKey := datastore.IDKey(KindTransaction, id, payeeKey)
	txKey.Namespace = ""
	return txKey
}

// PayeeKey creates a datastore key for a payee
func PayeeKey(name string) *datastore.Key {
	accountKey := datastore.NameKey(KindAccountName, DefaultAccount, nil)
	accountKey.Namespace = ""
	
	payeeKey := datastore.NameKey(KindPayee, name, accountKey)
	payeeKey.Namespace = ""
	return payeeKey
}

// AccountNameKey creates a datastore key for an account
func AccountNameKey(name string) *datastore.Key {
	key := datastore.NameKey(KindAccountName, name, nil)
	key.Namespace = ""
	return key
}

// LoadKey loads the key into the entity after a datastore operation
func (t *Transaction) LoadKey(k *datastore.Key) error {
	t.ID = k.ID
	return nil
}

// Load implements PropertyLoadSaver for Transaction
func (t *Transaction) Load(ps []datastore.Property) error {
	return datastore.LoadStruct(t, ps)
}

// Save implements PropertyLoadSaver for Transaction
func (t *Transaction) Save() ([]datastore.Property, error) {
	return datastore.SaveStruct(t)
}
