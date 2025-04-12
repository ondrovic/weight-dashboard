#region Menus
function Show-Menu {
    Clear-Host
    Write-Host "==============================================="
    Write-Host "Weight Tracker Helper"
    Write-Host "==============================================="
    Write-Host "1. Local Docker"
    Write-Host "2. Local Development"
    Write-Host "3. Help"
    Write-Host "4. Exit"
    Write-Host "==============================================="

    $choice = Show-ChoiceMenu -lastOptNum 4

    switch ($choice) {
        1 {Show-DockerMenu}
        2 {Show-DevelopmentMenu}
        3 {Show-Help}
        4 { exit 0 }
        default { 
            Show-InvalidOption
            Show-Menu
        }
    }
}

function Show-DockerMenu {
    Clear-Host
    Write-Host "==============================================="
    Write-Host "Weight Tracker Application Docker Management"
    Write-Host "==============================================="
    Write-Host "1. Create Docker .env"
    Write-Host "2. Start all services"
    Write-Host "3. Stop all services"
    Write-Host "4. Restart all services"
    Write-Host "5. Rebuild and restart all services"
    Write-Host "6. View logs"
    Write-Host "7. Back"
    Write-Host "==============================================="
    
    $choice = Show-ChoiceMenu -lastOptNum 7
    
    switch ($choice) {
        1 { New-DockerEnv }
        2 { Start-Services }
        3 { Stop-Services }
        4 { Restart-Services }
        5 { Update-Services }
        6 { Get-Logs }
        7 { Show-Menu }
        default { 
            Show-InvalidOption
            Show-DockerMenu 
        }
    }
}

function Show-DevelopmentMenu {
    Clear-Host
    Write-Host "=================================================="
    Write-Host "Weight Tracker Application Development Management"
    Write-Host "=================================================="
    Write-Host "1. Create .envs"
    Write-Host "2. Install dependencies"
    Write-Host "3. Clean dependencies"
    Write-Host "4. Deploy Backend"
    Write-Host "5. Deploy Frontend"
    Write-Host "6. Deploy Full Stack"
    Write-Host "7. Back"
    Write-Host "=================================================="

   $choice = Show-ChoiceMenu -lastOptNum 7

   switch ($choice) {
    1 { New-DevEnvs }
    2 { Install-Dependencies }
    3 { Clean-Dependencies }
    4 { Deploy-Backend }
    5 { Deploy-Frontend }
    6 { Deploy-FullStack }
    7 { Show-Menu }
    default {
        Show-InvalidOption
        Show-DevelopmentMenu
    }
   }
}

#endregion

function New-DevEnvs {
    Clear-Host
    Write-Host "Creating development .env files..."
    
    # Read the .env.example file
    $envExample = Get-Content .env.example
    
    # Extract MongoDB configuration values
    $rootUsername = $envExample | Where-Object { $_ -match '^MONGODB_ROOT_USERNAME=' } | ForEach-Object { $_.Split('=')[1].Trim() }
    $rootPassword = $envExample | Where-Object { $_ -match '^MONGODB_ROOT_PASSWORD=' } | ForEach-Object { $_.Split('=')[1].Trim() }
    $username = $envExample | Where-Object { $_ -match '^MONGODB_USERNAME=' } | ForEach-Object { $_.Split('=')[1].Trim() }
    $password = $envExample | Where-Object { $_ -match '^MONGODB_PASSWORD=' } | ForEach-Object { $_.Split('=')[1].Trim() }
    $mongodbPort = $envExample | Where-Object { $_ -match '^MONGODB_PORT=' } | ForEach-Object { $_.Split('=')[1].Trim() }
    if (-not $mongodbPort) {
        $mongodbPort = "27017"  # Default MongoDB port if not specified
    }
    
    # Create backend .env
    $backendEnvContent = @()
    $backendEnvContent += "# Server Configuration"
    $backendEnvContent += "PORT=$($envExample | Where-Object { $_ -match '^API_PORT=' } | ForEach-Object { $_.Split('=')[1].Trim() })"
    $backendEnvContent += "NODE_ENV=development"
    $backendEnvContent += ""
    $backendEnvContent += "# MongoDB Configuration"
    $backendEnvContent += "# For local MongoDB installation"
    $backendEnvContent += "# MONGODB_URI=mongodb://localhost:$mongodbPort/weight_tracker"
    $backendEnvContent += ""
    $backendEnvContent += "# Admin user (commented out)"
    $backendEnvContent += "# MONGODB_URI=mongodb://${rootUsername}:${rootPassword}@localhost:$mongodbPort/weight_tracker?authSource=admin"
    $backendEnvContent += ""
    $backendEnvContent += "# Scoped user (active)"
    $backendEnvContent += "MONGODB_URI=mongodb://${username}:${password}@localhost:$mongodbPort/weight_tracker"
    $backendEnvContent += ""
    $backendEnvContent += "# For MongoDB Atlas"
    $backendEnvContent += "# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/weight_tracker"
    $backendEnvContent += ""
    $backendEnvContent += "# For Docker container-to-container communication (used by docker-compose)"
    $backendEnvContent += "# MONGODB_URI=mongodb://admin:password@mongodb:27017/weight_tracker?authSource=admin"
    $backendEnvContent += ""
    $backendEnvContent += "# File Upload Configuration"
    $backendEnvContent += "UPLOAD_DIR=uploads"
    $backendEnvContent += "MAX_FILE_SIZE=10485760  # 10MB in bytes"
    
    # Write to backend/.env file
    $backendEnvContent | Out-File -FilePath backend/.env -Encoding utf8 -Force
    
    # Create frontend .env
    $frontendEnvContent = @()
    $frontendEnvContent += "# API Configuration"
    $apiPort = ($envExample | Where-Object { $_ -match '^API_PORT=' } | ForEach-Object { $_.Split('=')[1].Trim() })
    $frontendEnvContent += "VITE_API_URL=http://localhost:$apiPort/api"
    $frontendEnvContent += "VITE_API_TARGET=http://localhost:$apiPort"
    $frontendEnvContent += "VITE_API_ENDPOINT=$($envExample | Where-Object { $_ -match '^API_ENDPOINT=' } | ForEach-Object { $_.Split('=')[1].Trim() })"
    
    # Write to frontend/.env file
    $frontendEnvContent | Out-File -FilePath frontend/.env -Encoding utf8 -Force
    
    Write-Host "Development .env files created successfully."
    Wait-Script
    Show-DevelopmentMenu
}

#region Docker

# Function to check if Docker and Docker Compose are installed
function Find-Docker {
    try {
        $null = Get-Command docker -ErrorAction Stop
    } catch {
        Write-Host "Docker could not be found"
        Write-Host "Please install Docker: https://docs.docker.com/get-docker/"
        exit 1
    }

    # For Docker Desktop on Windows, docker compose is now a subcommand
    try {
        $dockerComposeVersion = docker compose version
        if ($null -eq $dockerComposeVersion) {
            throw "Docker Compose not found"
        }
    } catch {
        Write-Host "Docker Compose could not be found"
        Write-Host "Please install Docker Desktop with Docker Compose: https://docs.docker.com/desktop/install/windows-install/"
        exit 1
    }
}

function New-DockerEnv {
    Clear-Host
    Write-Host "Creating Docker .env file..."
    
    # Read the .env.example file
    $envExample = Get-Content .env.example
    
    # Create a new .env file
    $envContent = @()
    
    foreach ($line in $envExample) {
        # Skip comments and empty lines
        if ($line -match '^#' -or $line -match '^\s*$') {
            $envContent += $line
            continue
        }
        
        # Extract variable name and value
        $parts = $line -split '=', 2
        $varName = $parts[0].Trim()
        $varValue = $parts[1].Trim()
        
        # Handle special cases for dynamic URL generation
        if ($varName -eq 'VITE_API_URL') {
            # Extract API_PORT from the env file
            $apiPort = ($envExample | Where-Object { $_ -match '^API_PORT=' } | ForEach-Object { $_.Split('=')[1].Trim() })
            $varValue = "http://localhost:$apiPort/api"
        }
        
        $envContent += "$varName=$varValue"
    }
    
    # Write to .env file
    $envContent | Out-File -FilePath .env -Encoding utf8
    
    Write-Host "Docker .env file created successfully."
    Wait-Script
    Show-DockerMenu
}

# Function to start services
function Start-Services {
    Clear-Host
    Write-Host "Starting services..."
    docker compose up -d
    
    # Get UI_PORT from .env file
    $uiPort = (Get-Content .env | Where-Object { $_ -match "UI_PORT" } | ForEach-Object { $_.Split('=')[1] })
    Write-Host "Services started. Access the application at http://localhost:$uiPort"
    
    Wait-Script
    Show-DockerMenu
}

function Restart-Services {
    Clear-Host
    Write-Host "Restarting services..."
    docker compose restart
    
    # Get UI_PORT from .env file
    $uiPort = (Get-Content .env | Where-Object { $_ -match "UI_PORT" } | ForEach-Object { $_.Split('=')[1] })
    Write-Host "Services restarted. Access the application at http://localhost:$uiPort"
    
    Wait-Script
    Show-DockerMenu
}

# Function to stop services
function Stop-Services {
    Clear-Host
    Write-Host "Stopping services..."
    docker compose down
    Write-Host "Services stopped."
    
    Wait-Script
    Show-DockerMenu
}

# Function to rebuild services
function Update-Services {
    Clear-Host
    Write-Host "Rebuilding and restarting services..."
    docker compose down
    docker compose build --no-cache
    docker compose up -d
    Write-Host "Services rebuilt and restarted."
    
    Wait-Script
    Show-DockerMenu
}

# Function to view logs
function Get-Logs {
    Clear-Host
    Write-Host "Viewing logs (press Ctrl+C to exit)..."
    Write-Host "After pressing Ctrl+C, type 'exit' and press Enter to return to menu."
    
    # Start docker compose logs in a new process
    Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "docker compose logs -f" -Wait
    
    # Return to menu after the user closes the logs window
    Show-DockerMenu
}

#endregion

#region Development

function Install-Dependencies {
    Clear-Host
    Write-Host "Installing dependencies for both frontend and backend..."
    
    # Function to check if yarn.lock exists and install dependencies accordingly
    function Install-PackageDependencies {
        param (
            [string]$directory
        )
        
        Push-Location $directory
        
        # Check if yarn.lock exists
        if (Test-Path yarn.lock) {
            Write-Host "Using Yarn for $directory..."
            yarn install
        } else {
            Write-Host "Using NPM for $directory..."
            npm install
        }
        
        Pop-Location
    }
    
    # Install backend dependencies
    Write-Host "Installing backend dependencies..."
    Install-PackageDependencies -directory "backend"
    
    # Install frontend dependencies
    Write-Host "Installing frontend dependencies..."
    Install-PackageDependencies -directory "frontend"
    
    Write-Host "All dependencies installed successfully."
    Wait-Script
    Show-DevelopmentMenu
}

function Deploy-Backend {
    Clear-Host
    Write-Host "Deploying Backend..."
    
    # Check if .env file exists
    if (-not (Test-Path backend/.env)) {
        Write-Host "Backend .env file not found. Creating it first..."
        New-DevEnvs
    }
    
    # Determine package manager
    $packageManager = "npm"
    if (Test-Path backend/yarn.lock) {
        $packageManager = "yarn"
    }
    
    Write-Host "Starting backend in a new window..."
    Write-Host "After stopping the server (Ctrl+C), type 'exit' and press Enter to return to menu."
    
    # Start backend in a new window
    Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd backend; $packageManager install; $packageManager run dev" -Wait
    
    Show-DevelopmentMenu
}

function Deploy-Frontend {
    Clear-Host
    Write-Host "Deploying Frontend..."
    
    # Check if .env file exists
    if (-not (Test-Path frontend/.env)) {
        Write-Host "Frontend .env file not found. Creating it first..."
        New-DevEnvs
    }
    
    # Determine package manager
    $packageManager = "npm"
    if (Test-Path frontend/yarn.lock) {
        $packageManager = "yarn"
    }
    
    Write-Host "Starting frontend in a new window..."
    Write-Host "After stopping the server (Ctrl+C), type 'exit' and press Enter to return to menu."
    
    # Start frontend in a new window
    Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd frontend; $packageManager install; $packageManager run dev" -Wait
    
    Show-DevelopmentMenu
}

function Deploy-FullStack {
    Clear-Host
    Write-Host "Deploying Full Stack..."
    
    # Check if .env files exist
    if (-not (Test-Path backend/.env) -or -not (Test-Path frontend/.env)) {
        Write-Host "Environment files not found. Creating them first..."
        New-DevEnvs
    }
    
    # Determine package manager for backend
    $backendPackageManager = "npm"
    if (Test-Path backend/yarn.lock) {
        $backendPackageManager = "yarn"
    }
    
    # Determine package manager for frontend
    $frontendPackageManager = "npm"
    if (Test-Path frontend/yarn.lock) {
        $frontendPackageManager = "yarn"
    }
    
    Write-Host "Starting backend and frontend in separate windows..."
    Write-Host "After stopping the servers (Ctrl+C), type 'exit' and press Enter in each window to return to menu."
    
    # Start backend in a new window
    Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd backend; $backendPackageManager install; $backendPackageManager run dev"
    
    # Start frontend in a new window
    Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd frontend; $frontendPackageManager install; $frontendPackageManager run dev"
    
    Write-Host "Full stack deployment started in separate windows."
    Wait-Script
    Show-DevelopmentMenu
}

function Clean-Dependencies {
    Clear-Host
    Write-Host "Cleaning dependencies..."
    
    # Remove backend node_modules
    if (Test-Path backend/node_modules) {
        Write-Host "Removing backend/node_modules..."
        Remove-Item backend/node_modules -Recurse -Force
    }
    
    # Remove frontend node_modules
    if (Test-Path frontend/node_modules) {
        Write-Host "Removing frontend/node_modules..."
        Remove-Item frontend/node_modules -Recurse -Force
    }
    
    Write-Host "Dependencies cleaned successfully."
    Wait-Script
    Show-DevelopmentMenu
}

#endregion

#region Helpers
# Function to pause script execution

function Show-ChoiceMenu {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory=$false)]
        [int]
        $firstOptNum = 1,
        [Parameter(Mandatory=$true)]
        [int]
        $lastOptNum
    )

    Read-Host "Enter your choice [$firstOptNum - $lastOptNum]"
}

function Wait-Script {
    Write-Host "Press any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Show-InvalidOption {
    Write-Host "Invalid option. Please try again."
    Start-Sleep -Seconds 2
}

function Show-Help {
    Clear-Host
    Write-Host "==============================================="
    Write-Host "Weight Tracker Helper - Help"
    Write-Host "==============================================="
    Write-Host ""
    Write-Host "This script helps you manage the Weight Tracker application."
    Write-Host ""
    Write-Host "Docker Management:"
    Write-Host "  - Create Docker .env: Creates a .env file for Docker with dynamic URL generation"
    Write-Host "  - Start all services: Starts all Docker services"
    Write-Host "  - Stop all services: Stops all Docker services"
    Write-Host "  - Restart all services: Restarts all Docker services"
    Write-Host "  - Rebuild and restart all services: Rebuilds and restarts all Docker services"
    Write-Host "  - View logs: Views logs from all Docker services"
    Write-Host ""
    Write-Host "Development Management:"
    Write-Host "  - Create .envs: Creates .env files for backend and frontend with dynamic URL generation"
    Write-Host "  - Deploy Backend: Deploys the backend server"
    Write-Host "  - Deploy Frontend: Deploys the frontend server"
    Write-Host "  - Deploy Full Stack: Deploys both backend and frontend servers"
    Write-Host ""
    Write-Host "Environment Files:"
    Write-Host "  - Docker: Creates a .env file in the root directory for Docker"
    Write-Host "  - Development: Creates .env files in backend/ and frontend/ directories"
    Write-Host "  - URLs are dynamically generated based on port settings"
    Write-Host ""
    Write-Host "==============================================="
    
    Wait-Script
    Show-Menu
}

#endregion

# Check Docker installation
Find-Docker

# Main Menu
Show-Menu