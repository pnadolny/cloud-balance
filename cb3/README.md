# Cloud Balance v3 (cb3)

Modern refactor of Cloud Balance using Go/Gin backend and Angular 17+ frontend.

## Architecture

### Backend (Go + Gin)
- **Language**: Go 1.22+
- **Framework**: Gin Web Framework
- **Database**: Google Cloud Datastore (shared with cb2)
- **Deployment**: Google App Engine Standard Environment

### Frontend (Angular 17+)
- **Framework**: Angular 17+ with standalone components
- **UI**: Angular Material Design v17
- **State Management**: RxJS Signals
- **Build**: Angular CLI with AOT compilation

## Project Structure

```
cb3/
├── backend/           # Go backend
│   ├── main.go       # Application entry point
│   ├── models.go     # Datastore models
│   ├── handlers.go   # HTTP handlers
│   ├── app.yaml      # App Engine configuration
│   └── go.mod        # Go dependencies
└── frontend/         # Angular frontend (to be created)
```

## Backend Setup

### Prerequisites
- Go 1.22 or higher
- Google Cloud SDK
- Access to `mycloudbalance` GCP project

### Local Development

1. **Install dependencies:**
   ```bash
   cd cb3/backend
   go mod download
   ```

2. **Run locally:**
   ```bash
   go run .
   ```
   Server starts on `http://localhost:8080`

3. **Test with existing cb2 frontend:**
   Update `cb2/proxy.conf.json` to point to `http://localhost:8080`

### API Endpoints

All endpoints match the existing cb2 API:

- `GET /ng/resources/transaction?month=X&year=Y` - List transactions
- `PUT /ng/resources/transaction` - Create/update transaction
- `DELETE /ng/resources/transaction?id=X&parentid=Y` - Delete transaction
- `GET /ng/resources/payee?year=Y` - List payees
- `PUT /ng/resources/payee` - Create/update payee
- `DELETE /ng/resources/payee?id=X` - Delete payee
- `GET /ng/resources/user` - Get user info

### Deploy to App Engine

```bash
cd cb3/backend
gcloud app deploy
```

## Frontend Setup (Coming Soon)

### Prerequisites
- Node.js 18+ and npm
- Angular CLI 17+

### Local Development
```bash
cd cb3/frontend
npm install
npm start
```

### Production Build
```bash
npm run build
```

## Data Model

### Hierarchy
```
AccountName (root)
  └── Payee
      └── Transaction
```

### Transaction Types
- `i` - Income
- `s` - Static (recurring bills)
- `d` - Discretionary (variable spending)
- `f` - Future (planned expenses)

## Migration from cb2

### Phase 1: Backend (Current)
- ✅ Go module initialized
- ✅ Datastore models created
- ✅ REST endpoints implemented
- ✅ App Engine configuration
- ⏳ Dependencies installing

### Phase 2: Frontend (Next)
- [ ] Create Angular 17 project
- [ ] Migrate components to standalone
- [ ] Update Material Design to v17
- [ ] Implement reactive patterns with Signals

### Phase 3: Deployment
- [ ] Deploy backend to `/cb3`
- [ ] Deploy frontend to `/cb3`
- [ ] Test with production data
- [ ] Gradual user migration

## Key Improvements

### Backend
- **Performance**: Go is faster and more efficient than Java
- **Simplicity**: Cleaner codebase, easier to maintain
- **Deployment**: Single binary, faster cold starts
- **Type Safety**: Strong typing with Go

### Frontend
- **Modern Angular**: Latest features (Signals, standalone components)
- **Better DX**: Improved tooling and debugging
- **Performance**: Faster builds and runtime
- **Material v17**: Latest design system

## Development Notes

### Date Handling
- Backend stores dates in UTC
- Frontend displays in user timezone
- ISO format: `YYYY-MM-DDTHH:mm:ss.SSSZ`
- Transaction dates normalized to 6 AM UTC

### Datastore Compatibility
- Uses same entity structure as cb2
- No data migration needed
- Can run cb2 and cb3 in parallel

### CORS
- Configured for local development
- Allows cross-origin requests from Angular dev server

## Testing

### Backend Tests
```bash
cd cb3/backend
go test ./...
```

### Frontend Tests
```bash
cd cb3/frontend
npm test           # Unit tests
npm run e2e        # E2E tests
```

## Troubleshooting

### Go Dependencies
If `go get` times out, try:
```bash
go mod download
```

### Datastore Connection
Ensure you're authenticated:
```bash
gcloud auth application-default login
```

### Port Conflicts
Change port in `main.go` or set `PORT` environment variable

## Resources

- [Gin Documentation](https://gin-gonic.com/docs/)
- [Cloud Datastore Go Client](https://pkg.go.dev/cloud.google.com/go/datastore)
- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
