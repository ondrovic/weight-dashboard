# PowerShell script for Weight Tracker Application Management

# Check if .env file exists, if not create it from .env.example
if (-not (Test-Path -Path ".env" -PathType Leaf)) {
    Write-Host "Creating .env file from .env.example..."
    Copy-Item ".env.example" ".env"
    Write-Host "Please edit the .env file with your settings"
} else {
    Write-Host ".env file already exists"
}

# Function to check if Docker and Docker Compose are installed
function Check-Docker {
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

# Function to show menu
function Show-Menu {
    Clear-Host
    Write-Host "==============================================="
    Write-Host "Weight Tracker Application Management"
    Write-Host "==============================================="
    Write-Host "1. Start all services"
    Write-Host "2. Stop all services"
    Write-Host "3. Rebuild and restart all services"
    Write-Host "4. View logs"
    Write-Host "5. Exit"
    Write-Host "==============================================="
    
    $choice = Read-Host "Enter your choice [1-5]"
    
    switch ($choice) {
        1 { Start-Services }
        2 { Stop-Services }
        3 { Rebuild-Services }
        4 { View-Logs }
        5 { exit 0 }
        default { 
            Write-Host "Invalid option. Please try again."
            Start-Sleep -Seconds 2
            Show-Menu 
        }
    }
}

# Function to start services
function Start-Services {
    Write-Host "Starting services..."
    docker compose up -d
    
    # Get UI_PORT from .env file
    $uiPort = (Get-Content .env | Where-Object { $_ -match "UI_PORT" } | ForEach-Object { $_.Split('=')[1] })
    Write-Host "Services started. Access the application at http://localhost:$uiPort"
    
    Pause-Script
    Show-Menu
}

# Function to stop services
function Stop-Services {
    Write-Host "Stopping services..."
    docker compose down
    Write-Host "Services stopped."
    
    Pause-Script
    Show-Menu
}

# Function to rebuild services
function Rebuild-Services {
    Write-Host "Rebuilding and restarting services..."
    docker compose down
    docker compose build --no-cache
    docker compose up -d
    Write-Host "Services rebuilt and restarted."
    
    Pause-Script
    Show-Menu
}

# Function to view logs
function View-Logs {
    Write-Host "Viewing logs (press Ctrl+C to exit)..."
    Write-Host "After pressing Ctrl+C, type 'exit' and press Enter to return to menu."
    
    # Start docker compose logs in a new process
    Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "docker compose logs -f" -Wait
    
    # Return to menu after the user closes the logs window
    Show-Menu
}

# Function to pause script execution
function Pause-Script {
    Write-Host "Press any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Check Docker installation
Check-Docker

# Show menu
Show-Menu