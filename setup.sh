#!/bin/bash

# Check if .env file exists, if not create it from .env.example
if [ ! -f .env ]; then
  echo "Creating .env file from .env.example..."
  cp .env.example .env
  echo "Please edit the .env file with your settings"
else
  echo ".env file already exists"
fi

# Function to check if Docker and Docker Compose are installed
check_docker() {
  if ! command -v docker &> /dev/null; then
    echo "Docker could not be found"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
  fi

  if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose could not be found"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
  fi
}

# Main menu
show_menu() {
  echo "==============================================="
  echo "Weight Tracker Application Management"
  echo "==============================================="
  echo "1. Start all services"
  echo "2. Stop all services"
  echo "3. Rebuild and restart all services"
  echo "4. View logs"
  echo "5. Exit"
  echo "==============================================="
  read -p "Enter your choice [1-5]: " choice

  case $choice in
    1) start_services ;;
    2) stop_services ;;
    3) rebuild_services ;;
    4) view_logs ;;
    5) exit 0 ;;
    *) echo "Invalid option. Please try again." && show_menu ;;
  esac
}

start_services() {
  echo "Starting services..."
  docker-compose up -d
  echo "Services started. Access the application at http://localhost:$(grep UI_PORT .env | cut -d= -f2)"
  show_menu
}

stop_services() {
  echo "Stopping services..."
  docker-compose down
  echo "Services stopped."
  show_menu
}

rebuild_services() {
  echo "Rebuilding and restarting services..."
  docker-compose down
  docker-compose build --no-cache
  docker-compose up -d
  echo "Services rebuilt and restarted."
  show_menu
}

view_logs() {
  echo "Viewing logs (press Ctrl+C to exit)..."
  docker-compose logs -f
  show_menu
}

# Check Docker installation
check_docker

# Show menu
show_menu