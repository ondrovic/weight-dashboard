#!/bin/bash

#region Menus
function show_menu {
    clear
    echo "==============================================="
    echo "Weight Tracker Helper"
    echo "==============================================="
    echo "1. Local Docker"
    echo "2. Local Development"
    echo "3. Help"
    echo "4. Exit"
    echo "==============================================="

    choice=$(show_choice_menu 4)

    case $choice in
        1) show_docker_menu ;;
        2) show_development_menu ;;
        3) show_help ;;
        4) exit 0 ;;
        *) 
            show_invalid_option
            show_menu
            ;;
    esac
}

function show_docker_menu {
    clear
    echo "==============================================="
    echo "Weight Tracker Application Docker Management"
    echo "==============================================="
    echo "1. Create Docker .env"
    echo "2. Start all services"
    echo "3. Stop all services"
    echo "4. Restart all services"
    echo "5. Rebuild and restart backend"
    echo "6. Rebuild and restart frontend"
    echo "7. Rebuild and restart all services"
    echo "8. View logs"
    echo "9. Back"
    echo "==============================================="
    
    choice=$(show_choice_menu 9)
    
    case $choice in
        1) new_docker_env ;;
        2) start_services ;;
        3) stop_services ;;
        4) restart_services ;;
        5) update_backend ;;
        6) update_frontend ;;
        7) update_services ;;
        8) get_logs ;;
        9) show_menu ;;
        *) 
            show_invalid_option
            show_docker_menu 
            ;;
    esac
}

function show_development_menu {
    clear
    echo "=================================================="
    echo "Weight Tracker Application Development Management"
    echo "=================================================="
    echo "1. Create .envs"
    echo "2. Install dependencies"
    echo "3. Clean dependencies"
    echo "4. Deploy Backend"
    echo "5. Deploy Frontend"
    echo "6. Deploy Full Stack"
    echo "7. Back"
    echo "=================================================="

    choice=$(show_choice_menu 7)

    case $choice in
        1) new_dev_envs ;;
        2) install_dependencies ;;
        3) clean_dependencies ;;
        4) deploy_backend ;;
        5) deploy_frontend ;;
        6) deploy_full_stack ;;
        7) show_menu ;;
        *)
            show_invalid_option
            show_development_menu
            ;;
    esac
}

#endregion

function new_dev_envs {
    clear
    echo "Creating development .env files..."
    
    # Read the .env.example file
    env_example=$(cat .env.example)
    
    # Extract MongoDB configuration values
    root_username=$(echo "$env_example" | grep "^MONGODB_ROOT_USERNAME=" | cut -d'=' -f2)
    root_password=$(echo "$env_example" | grep "^MONGODB_ROOT_PASSWORD=" | cut -d'=' -f2)
    username=$(echo "$env_example" | grep "^MONGODB_USERNAME=" | cut -d'=' -f2)
    password=$(echo "$env_example" | grep "^MONGODB_PASSWORD=" | cut -d'=' -f2)
    mongodb_port=$(echo "$env_example" | grep "^MONGODB_PORT=" | cut -d'=' -f2)
    if [ -z "$mongodb_port" ]; then
        mongodb_port="27017"  # Default MongoDB port if not specified
    fi
    
    # Create backend .env
    backend_env_content=(
        "# Server Configuration"
        "PORT=$(echo "$env_example" | grep "^API_PORT=" | cut -d'=' -f2)"
        "NODE_ENV=development"
        ""
        "# MongoDB Configuration"
        "# For local MongoDB installation"
        "# MONGODB_URI=mongodb://localhost:$mongodb_port/weight_tracker"
        ""
        "# Admin user (commented out)"
        "# MONGODB_URI=mongodb://${root_username}:${root_password}@localhost:$mongodb_port/weight_tracker?authSource=admin"
        ""
        "# Scoped user (active)"
        "MONGODB_URI=mongodb://${username}:${password}@localhost:$mongodb_port/weight_tracker"
        ""
        "# For MongoDB Atlas"
        "# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/weight_tracker"
        ""
        "# For Docker container-to-container communication (used by docker-compose)"
        "# MONGODB_URI=mongodb://admin:password@mongodb:27017/weight_tracker?authSource=admin"
        ""
        "# File Upload Configuration"
        "UPLOAD_DIR=uploads"
        "MAX_FILE_SIZE=10485760  # 10MB in bytes"
    )
    
    # Write to backend/.env file
    printf "%s\n" "${backend_env_content[@]}" > backend/.env
    
    # Create frontend .env
    api_port=$(echo "$env_example" | grep "^API_PORT=" | cut -d'=' -f2)
    frontend_env_content=(
        "# API Configuration"
        "VITE_API_URL=http://localhost:$api_port/api"
        "VITE_API_TARGET=http://localhost:$api_port"
        "VITE_API_ENDPOINT=$(echo "$env_example" | grep "^API_ENDPOINT=" | cut -d'=' -f2)"
    )
    
    # Write to frontend/.env file
    printf "%s\n" "${frontend_env_content[@]}" > frontend/.env
    
    echo "Development .env files created successfully."
    wait_script
    show_development_menu
}

#region Docker

# Function to check if Docker and Docker Compose are installed
function find_docker {
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

function new_docker_env {
    clear
    echo "Creating Docker .env file..."
    
    # Read the .env.example file
    env_example=$(cat .env.example)
    
    # Create a new .env file
    env_content=()
    
    while IFS= read -r line; do
        # Skip comments and empty lines
        if [[ $line =~ ^# ]] || [[ -z $line ]]; then
            env_content+=("$line")
            continue
        fi
        
        # Extract variable name and value
        var_name=$(echo "$line" | cut -d'=' -f1)
        var_value=$(echo "$line" | cut -d'=' -f2-)
        
        # No special handling for VITE_API_URL - use values directly from .env.example
        
        env_content+=("$var_name=$var_value")
    done <<< "$env_example"
    
    # Write to .env file
    printf "%s\n" "${env_content[@]}" > .env
    
    echo "Docker .env file created successfully."
    wait_script
    show_docker_menu
}

# Function to start services
function start_services {
    clear
    echo "Starting services..."
    docker-compose up -d
    
    # Get UI_PORT from .env file
    ui_port=$(grep "UI_PORT" .env | cut -d'=' -f2)
    echo "Services started. Access the application at http://localhost:$ui_port"
    
    wait_script
    show_docker_menu
}

function restart_services {
    clear
    echo "Restarting services..."
    docker-compose restart
    
    # Get UI_PORT from .env file
    ui_port=$(grep "UI_PORT" .env | cut -d'=' -f2)
    echo "Services restarted. Access the application at http://localhost:$ui_port"
    
    wait_script
    show_docker_menu
}

# Function to stop services
function stop_services {
    clear
    echo "Stopping services..."
    docker-compose down
    echo "Services stopped."
    
    wait_script
    show_docker_menu
}

# Function to rebuild services
function update_services {
    clear
    echo "Rebuilding and restarting services..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    echo "Services rebuilt and restarted."
    
    wait_script
    show_docker_menu
}

# Function to view logs
function get_logs {
    clear
    echo "Viewing logs (press Ctrl+C to exit)..."
    echo "After pressing Ctrl+C, type 'exit' and press Enter to return to menu."
    
    # Start docker compose logs
    docker-compose logs -f
    
    # Return to menu after the user closes the logs
    show_docker_menu
}

# Function to rebuild backend service
function update_backend {
    clear
    echo "Rebuilding and restarting backend service..."
    docker-compose build --no-cache backend
    docker-compose up -d backend
    echo "Backend service rebuilt and restarted."
    
    wait_script
    show_docker_menu
}

# Function to rebuild frontend service
function update_frontend {
    clear
    echo "Rebuilding and restarting frontend service..."
    docker-compose build --no-cache frontend
    docker-compose up -d frontend
    echo "Frontend service rebuilt and restarted."
    
    wait_script
    show_docker_menu
}

#endregion

#region Development

function install_dependencies {
    clear
    echo "Installing dependencies for both frontend and backend..."
    
    # Function to check if yarn.lock exists and install dependencies accordingly
    function install_package_dependencies {
        local directory=$1
        
        cd "$directory"
        
        # Check if yarn.lock exists
        if [ -f yarn.lock ]; then
            echo "Using Yarn for $directory..."
            yarn install
        else
            echo "Using NPM for $directory..."
            npm install
        fi
        
        cd ..
    }
    
    # Install backend dependencies
    echo "Installing backend dependencies..."
    install_package_dependencies "backend"
    
    # Install frontend dependencies
    echo "Installing frontend dependencies..."
    install_package_dependencies "frontend"
    
    echo "All dependencies installed successfully."
    wait_script
    show_development_menu
}

function deploy_backend {
    clear
    echo "Deploying Backend..."
    
    # Check if .env file exists
    if [ ! -f backend/.env ]; then
        echo "Backend .env file not found. Creating it first..."
        new_dev_envs
    fi
    
    # Determine package manager
    package_manager="npm"
    if [ -f backend/yarn.lock ]; then
        package_manager="yarn"
    fi
    
    echo "Starting backend in a new terminal..."
    echo "After stopping the server (Ctrl+C), type 'exit' and press Enter to return to menu."
    
    # Start backend in a new terminal
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd backend; $package_manager install; $package_manager run dev; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd backend; $package_manager install; $package_manager run dev; exec bash" &
    elif command -v osascript &> /dev/null; then
        osascript -e "tell app \"Terminal\" to do script \"cd $(pwd)/backend; $package_manager install; $package_manager run dev\""
    else
        echo "Could not open a new terminal. Please run backend manually."
        wait_script
    fi
    
    show_development_menu
}

function deploy_frontend {
    clear
    echo "Deploying Frontend..."
    
    # Check if .env file exists
    if [ ! -f frontend/.env ]; then
        echo "Frontend .env file not found. Creating it first..."
        new_dev_envs
    fi
    
    # Determine package manager
    package_manager="npm"
    if [ -f frontend/yarn.lock ]; then
        package_manager="yarn"
    fi
    
    echo "Starting frontend in a new terminal..."
    echo "After stopping the server (Ctrl+C), type 'exit' and press Enter to return to menu."
    
    # Start frontend in a new terminal
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd frontend; $package_manager install; $package_manager run dev; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd frontend; $package_manager install; $package_manager run dev; exec bash" &
    elif command -v osascript &> /dev/null; then
        osascript -e "tell app \"Terminal\" to do script \"cd $(pwd)/frontend; $package_manager install; $package_manager run dev\""
    else
        echo "Could not open a new terminal. Please run frontend manually."
        wait_script
    fi
    
    show_development_menu
}

function deploy_full_stack {
    clear
    echo "Deploying Full Stack..."
    
    # Check if .env files exist
    if [ ! -f backend/.env ] || [ ! -f frontend/.env ]; then
        echo "Environment files not found. Creating them first..."
        new_dev_envs
    fi
    
    # Determine package manager for backend
    backend_package_manager="npm"
    if [ -f backend/yarn.lock ]; then
        backend_package_manager="yarn"
    fi
    
    # Determine package manager for frontend
    frontend_package_manager="npm"
    if [ -f frontend/yarn.lock ]; then
        frontend_package_manager="yarn"
    fi
    
    echo "Starting backend and frontend in separate terminals..."
    echo "After stopping the servers (Ctrl+C), type 'exit' and press Enter in each terminal to return to menu."
    
    # Start backend in a new terminal
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd backend; $backend_package_manager install; $backend_package_manager run dev; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd backend; $backend_package_manager install; $backend_package_manager run dev; exec bash" &
    elif command -v osascript &> /dev/null; then
        osascript -e "tell app \"Terminal\" to do script \"cd $(pwd)/backend; $backend_package_manager install; $backend_package_manager run dev\""
    else
        echo "Could not open a new terminal for backend. Please run backend manually."
    fi
    
    # Start frontend in a new terminal
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd frontend; $frontend_package_manager install; $frontend_package_manager run dev; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd frontend; $frontend_package_manager install; $frontend_package_manager run dev; exec bash" &
    elif command -v osascript &> /dev/null; then
        osascript -e "tell app \"Terminal\" to do script \"cd $(pwd)/frontend; $frontend_package_manager install; $frontend_package_manager run dev\""
    else
        echo "Could not open a new terminal for frontend. Please run frontend manually."
    fi
    
    echo "Full stack deployment started in separate terminals."
    wait_script
    show_development_menu
}

function clean_dependencies {
    clear
    echo "Cleaning dependencies..."
    
    # Remove backend node_modules
    if [ -d "backend/node_modules" ]; then
        echo "Removing backend/node_modules..."
        rm -rf backend/node_modules
    fi
    
    # Remove frontend node_modules
    if [ -d "frontend/node_modules" ]; then
        echo "Removing frontend/node_modules..."
        rm -rf frontend/node_modules
    fi
    
    echo "Dependencies cleaned successfully."
    wait_script
    show_development_menu
}

#endregion

#region Helpers
# Function to pause script execution

function show_choice_menu {
    local last_opt_num=$1
    local choice
    
    read -p "Enter your choice [1 - $last_opt_num]: " choice
    echo "$choice"
}

function wait_script {
    echo "Press any key to continue..."
    read -n 1 -s
}

function show_invalid_option {
    echo "Invalid option. Please try again."
    sleep 2
}

function show_help {
    clear
    echo "==============================================="
    echo "Weight Tracker Helper - Help"
    echo "==============================================="
    echo ""
    echo "This script helps you manage the Weight Tracker application."
    echo ""
    echo "Docker Management:"
    echo "  - Create Docker .env: Creates a .env file for Docker with dynamic URL generation"
    echo "  - Start all services: Starts all Docker services"
    echo "  - Stop all services: Stops all Docker services"
    echo "  - Restart all services: Restarts all Docker services"
    echo "  - Rebuild and restart all services: Rebuilds and restarts all Docker services"
    echo "  - View logs: Views logs from all Docker services"
    echo ""
    echo "Development Management:"
    echo "  - Create .envs: Creates .env files for backend and frontend with dynamic URL generation"
    echo "  - Install dependencies: Installs dependencies for both frontend and backend"
    echo "  - Deploy Backend: Deploys the backend server"
    echo "  - Deploy Frontend: Deploys the frontend server"
    echo "  - Deploy Full Stack: Deploys both backend and frontend servers"
    echo ""
    echo "Environment Files:"
    echo "  - Docker: Creates a .env file in the root directory for Docker"
    echo "  - Development: Creates .env files in backend/ and frontend/ directories"
    echo "  - URLs are dynamically generated based on port settings"
    echo ""
    echo "==============================================="
    
    wait_script
    show_menu
}

#endregion

# Check Docker installation
find_docker

# Main Menu
show_menu 