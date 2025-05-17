# Docker Setup for Social Network Application

This document provides instructions on how to run the social network application using Docker containers.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Running the Application

### Using Docker Compose

To start the containers:

```bash
docker-compose up -d
```

This will start:
- A simple Node.js web server at http://localhost:3001
- PostgreSQL database
- Adminer (database management) at http://localhost:8081

### Manual Docker Commands

You can also run the components individually:

```bash
# Build the container
docker build -t newsocialnetwork-minimal -f Dockerfile.minimal .

# Run the web server
docker run -d -p 3001:3000 --name newsocialnetwork_minimal newsocialnetwork-minimal

# Run PostgreSQL
docker run -d -p 5433:5432 --name newsocialnetwork_postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=newsocialnetwork postgres:15

# Run Adminer
docker run -d -p 8081:8080 --name newsocialnetwork_adminer adminer
```

## Managing the Database

### Access the PostgreSQL Database

You can access the PostgreSQL database using Adminer at http://localhost:8081 with these credentials:
- System: PostgreSQL
- Server: postgres (or localhost if accessing from outside Docker)
- Username: postgres
- Password: password
- Database: newsocialnetwork

## Admin API Endpoints

The application includes the following admin-specific API endpoints:

- `GET /api/admin/users` - List all users with optional filters:
  - Query parameters: `community`, `role`, `status`
  - Example: `/api/admin/users?role=MEMBER&status=APPROVED`

- `GET /api/admin/events` - List all events

- `GET /api/admin/circles` - List all circles

- `PATCH /api/admin/user/:id` - Update user role or status
  - Example payload: `{"role": "MODERATOR", "status": "APPROVED"}`

- `DELETE /api/admin/event/:id` - Delete an event

- `DELETE /api/admin/circle/:id` - Delete a circle

### Authentication

All admin endpoints require the following authorization header:
```
Authorization: Bearer admin-token
```

### Testing Admin APIs

A test script is included to verify the admin APIs:
```bash
node admin-api-test.js
```

## Stopping the Application

To stop the containers:

```bash
docker-compose down
```

To stop and remove volumes (this will delete your database data):

```bash
docker-compose down -v
```

## Troubleshooting

### Container Logs

To view logs from specific containers:

```bash
docker logs newsocialnetwork_app     # Web server logs
docker logs newsocialnetwork_postgres  # Database logs
``` 