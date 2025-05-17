#!/bin/bash

# Color constants
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up Social Network Application Docker Environment${NC}"

echo -e "${GREEN}Building and starting containers...${NC}"

# Stop and remove existing containers
docker-compose down -v

# Build and start containers
docker-compose up -d

echo -e "${GREEN}Waiting for database to be ready...${NC}"

# Check if PostgreSQL is ready
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}Database is ready!${NC}"
    break
  fi
  echo -e "${YELLOW}Waiting for database to be ready... (${RETRY_COUNT}/${MAX_RETRIES})${NC}"
  RETRY_COUNT=$((RETRY_COUNT+1))
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo -e "${RED}Database did not become ready in time. Please check the database container logs.${NC}"
  echo -e "${YELLOW}docker logs newsocialnetwork_postgres${NC}"
  exit 1
fi

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${GREEN}Application URL: ${YELLOW}http://localhost:3001${NC}"
echo -e "${GREEN}Database Admin: ${YELLOW}http://localhost:8081${NC}"
echo -e "${GREEN}  System: PostgreSQL${NC}"
echo -e "${GREEN}  Server: postgres${NC}"
echo -e "${GREEN}  Username: postgres${NC}"
echo -e "${GREEN}  Password: password${NC}"
echo -e "${GREEN}  Database: newsocialnetwork${NC}"

echo -e "${YELLOW}For more information, see DOCKER_README.md${NC}" 