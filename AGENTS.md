# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview

**Cloud Balance** is a single-page web application for managing cash accounts, transactions, and computing cash flow. It's built as a full-stack application with a Java backend running on Google App Engine and an Angular frontend.

### Core Purpose
- Track financial transactions with payees
- Categorize transactions by type (Income, Static, Discretionary, Future)
- Calculate monthly cash flow and balances
- Provide insights into spending patterns and upcoming financial obligations

### Technology Stack

**Backend:**
- Java 8
- Google App Engine (Standard Environment)
- Jersey 2.16 (JAX-RS REST framework)
- Google App Engine Datastore (NoSQL database)
- Gson for JSON serialization
- Maven for build management

**Frontend:**
- Angular 4.4.4 (modern version in `cb2/` directory)
- Angular Material 2.0 (UI components)
- RxJS 5.0.1 (reactive programming)
- TypeScript 2.2.1
- Moment.js 2.17.1 (date handling)
- Immutable.js 3.7.6 (immutable data structures)
- Legacy AngularJS version exists in `src/main/webapp/ng/`

## Architecture

### Backend Structure

The backend follows a RESTful API design with clear separation of concerns:

```
src/main/java/com/appspot/cloudbalance/
├── Application.java          # Jersey application configuration (@ApplicationPath("ng"))
├── Domain Models:
│   ├── Transaction.java      # Transaction entity with CRUD operations
│   ├── Payee.java           # Payee entity management
│   ├── AccountName.java     # Account hierarchy
│   └── Predicate.java       # Query predicates
├── resources/               # REST endpoints
│   ├── TransactionResource.java  # /ng/resources/transaction
│   ├── PayeeResource.java        # /ng/resources/payee
│   ├── UserResource.java         # /ng/resources/user
│   └── ImportResource.java       # Data import functionality
├── filters/
│   └── NamespaceFilter.java # Request filtering
└── Util.java                # Datastore utilities
```

**Key Backend Patterns:**
- Entity models handle their own persistence logic
- Resources (controllers) are thin, delegating to entity classes
- Google App Engine Datastore uses Key-based parent-child relationships
- Transactions are children of Payees, which are children of AccountNames
- Date handling uses ISO format: `"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"`

### Frontend Structure (cb2/)

The modern Angular application uses reactive patterns and Material Design:

```
cb2/src/app/
├── app.component.ts         # Main component with transaction management
├── app.service.ts           # HTTP service for API calls
├── app.model.ts             # TypeScript interfaces and models
├── app.module.ts            # Angular module configuration
├── edit-transaction.ts      # Transaction dialog component
├── edit-payee.ts           # Payee dialog component
├── confirmation.ts         # Confirmation dialog
├── filters/                # Filter components
└── shared/                 # Shared utilities
```

**Key Frontend Patterns:**
- Uses RxJS BehaviorSubjects for state management
- Immutable.js Lists for transaction/payee collections
- Material Design dialogs for editing
- Moment.js for all date operations (UTC format: `"YYYY-MM-DD HH:mm:ss.SSS-05:00"`)
- Reactive filtering and sorting of transactions
- Real-time balance calculations

### Data Model

**Transaction:**
- Properties: name (ID), payee, amount, date, memo, type, marked (starred)
- Types: `i` (Income), `s` (Static), `d` (Discretionary), `f` (Future)
- Parent: Payee entity
- Sorted by date ascending

**Payee:**
- Properties: name, type
- Parent: AccountName entity
- Has many Transactions

**AccountName:**
- Default account: "Default Account"
- Root entity in hierarchy

## Building and Running

### Backend (Java/Maven)

**Development Server:**
```bash
mvn appengine:devserver
```
This starts the local App Engine development server with debugging enabled on port 8000.

**Build:**
```bash
mvn clean install
```

**Deploy to App Engine:**
```bash
mvn appengine:update
```

**Configuration:**
- `pom.xml` - Maven configuration, dependencies, App Engine plugin
- `src/main/webapp/WEB-INF/appengine-web.xml` - App Engine configuration
- `src/main/webapp/WEB-INF/web.xml` - Servlet configuration

### Frontend (Angular/npm)

**Development Server (with proxy to backend):**
```bash
cd cb2
npm install
npm run serve
```
This uses `proxy.conf.json` to proxy API requests to the backend.

**Production Build:**
```bash
cd cb2
npm run prod
```
Builds with AOT compilation to `cb2/dist/` with base href `/cb2/`.

**Testing:**
```bash
npm test        # Unit tests with Karma
npm run e2e     # End-to-end tests with Protractor
```

**Linting:**
```bash
npm run lint
```

## Development Conventions

### Code Style

**Java:**
- Package structure follows domain-driven design
- Entity classes contain business logic and persistence operations
- Resource classes are RESTful endpoints using JAX-RS annotations
- Use `Util` class for common Datastore operations
- Logging via `java.util.logging.Logger`

**TypeScript/Angular:**
- Components use reactive patterns with RxJS Observables
- State managed through BehaviorSubjects
- Immutable data structures for collections
- Material Design components for UI
- Services handle all HTTP communication
- Models defined as TypeScript interfaces/classes in `app.model.ts`

### Date Handling

**Critical Convention:**
- Backend stores dates in UTC
- Frontend displays dates in user's timezone
- ISO format used for API communication: `"YYYY-MM-DDTHH:mm:ss.SSSZ"`
- All date parsing/formatting uses Moment.js
- Transaction dates normalized to 6 AM UTC when saving

### API Patterns

**REST Endpoints:**
- Base path: `/ng/resources/`
- GET `/transaction?month=X&year=Y` - List transactions
- PUT `/transaction?name=&payee=&amount=&date=&memo=` - Create/update
- DELETE `/transaction?id=X&parentid=Y` - Delete transaction
- Similar patterns for `/payee` and `/user` endpoints

**Response Format:**
- Success: JSON array or object
- Error: JSON with `error` property containing message

### Transaction Types

When working with transaction categorization:
- `i` = Income (salary, payments received)
- `s` = Static (recurring bills, subscriptions)
- `d` = Discretionary (variable spending)
- `f` = Future (planned expenses)

### Cash Flow Calculations

The application computes:
- **Today's Balance**: Sum of all transactions up to today
- **Balance Before Income**: Balance just before next income transaction
- **Monthly Cash Flow**: Aggregated by month and transaction type

## Important Notes

- The project contains two Angular versions: legacy (`src/main/webapp/ng/`) and modern (`cb2/`)
- The modern version (`cb2/`) is the active development target
- Google App Engine Datastore uses eventual consistency
- Transactions use parent-child relationships for data locality
- The application requires Google App Engine authentication
- Static files are served directly by App Engine (configured in `appengine-web.xml`)

## Common Tasks

**Adding a new transaction type:**
1. Update `TransactionType` enum in `app.model.ts`
2. Update type handling in `app.component.ts` cash flow calculations
3. Update backend if validation needed

**Adding a new REST endpoint:**
1. Create resource class in `src/main/java/com/appspot/cloudbalance/resources/`
2. Add `@Path` annotation
3. Jersey auto-discovers resources in the package

**Modifying the data model:**
1. Update entity class in Java backend
2. Update TypeScript interface in `app.model.ts`
3. Update service methods in `app.service.ts`
4. Consider migration strategy for existing Datastore entities
