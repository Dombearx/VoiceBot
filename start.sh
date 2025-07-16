#!/bin/bash

# VoiceBot Docker Startup Script

set -e

echo "🚀 Starting VoiceBot application..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Warning: backend/.env file not found."
    echo "Please create backend/.env file with your API keys:"
    echo ""
    echo "DISCORD_BOT_TOKEN=your_discord_bot_token_here"
    echo "ELEVENLABS_API_KEY=your_elevenlabs_api_key_here"
    echo "OPENAI_API_KEY=your_openai_api_key_here"
    echo ""
    echo "Continue anyway? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ Aborted."
        exit 1
    fi
fi

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ VoiceBot is running!"
    echo ""
    echo "🌐 Frontend: http://localhost"
    echo "🔧 Backend API: http://localhost:8000"
    echo "📚 API Documentation: http://localhost:8000/docs"
    echo ""
    echo "📋 Useful commands:"
    echo "  View logs: docker-compose logs -f"
    echo "  Stop: docker-compose down"
    echo "  Restart: docker-compose restart"
else
    echo "❌ Failed to start services. Check logs with: docker-compose logs"
    exit 1
fi 