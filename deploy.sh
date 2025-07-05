#!/bin/bash

# Cricket Team Selection App - Deployment Script

set -e

echo "🏏 Cricket Team Selection App - Docker Deployment"
echo "=================================================="

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker and try again."
        exit 1
    fi
    echo "✅ Docker is running"
}

# Function to check if ports are available
check_ports() {
    local ports=(80 3001 6379)
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo "⚠️  Port $port is already in use"
            read -p "Do you want to continue anyway? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "❌ Deployment cancelled"
                exit 1
            fi
        fi
    done
    echo "✅ Port check completed"
}

# Function to clean up previous deployment
cleanup() {
    echo "🧹 Cleaning up previous deployment..."
    docker-compose down -v 2>/dev/null || true
    echo "✅ Cleanup completed"
}

# Function to build and start services
deploy() {
    echo "🚀 Building and starting services..."
    docker-compose up --build -d
    
    echo "⏳ Waiting for services to be ready..."
    sleep 10
    
    # Check service health
    echo "🏥 Checking service health..."
    
    # Check backend
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ Backend is healthy"
    else
        echo "❌ Backend health check failed"
        docker-compose logs backend
        exit 1
    fi
    
    # Check frontend
    if curl -f http://localhost/health > /dev/null 2>&1; then
        echo "✅ Frontend is healthy"
    else
        echo "❌ Frontend health check failed"
        docker-compose logs frontend
        exit 1
    fi
    
    echo "🎉 Deployment successful!"
    echo ""
    echo "📱 Access your application:"
    echo "   Frontend: http://localhost"
    echo "   Backend:  http://localhost:3001"
    echo "   Health:   http://localhost:3001/health"
    echo ""
    echo "📊 View logs: docker-compose logs -f"
    echo "🛑 Stop app:  docker-compose down"
}

# Main execution
main() {
    case "${1:-deploy}" in
        "deploy")
            check_docker
            check_ports
            cleanup
            deploy
            ;;
        "dev")
            check_docker
            echo "🛠️  Starting development environment..."
            docker-compose -f docker-compose.dev.yml up --build
            ;;
        "stop")
            echo "🛑 Stopping services..."
            docker-compose down
            echo "✅ Services stopped"
            ;;
        "clean")
            echo "🧹 Cleaning up everything..."
            docker-compose down -v --rmi all
            echo "✅ Cleanup completed"
            ;;
        "logs")
            docker-compose logs -f
            ;;
        "status")
            docker-compose ps
            ;;
        *)
            echo "Usage: $0 {deploy|dev|stop|clean|logs|status}"
            echo ""
            echo "Commands:"
            echo "  deploy  - Deploy production environment (default)"
            echo "  dev     - Start development environment"
            echo "  stop    - Stop all services"
            echo "  clean   - Remove all containers, images, and volumes"
            echo "  logs    - View real-time logs"
            echo "  status  - Show service status"
            exit 1
            ;;
    esac
}

main "$@"
