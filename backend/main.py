"""
VoiceBot FastAPI Application - Main entry point.
"""

import os
import logging
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.voices import router as voices_router
from app.api.prompt_router import router as prompt_router
from app.api.discord_bot_router import router as discord_bot_router
from app.services.discord_bot_service import get_discord_bot_manager

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager for startup and shutdown events.
    """
    # Startup
    logger.info("Starting VoiceBot API...")
    
    # Initialize Discord bot if token is provided
    discord_token = os.getenv("DISCORD_BOT_TOKEN")
    if discord_token:
        try:
            discord_manager = get_discord_bot_manager()
            await discord_manager.initialize(discord_token)
            logger.info("Discord bot initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Discord bot: {str(e)}")
            # Continue without Discord bot - the status endpoint will show disconnected
    else:
        logger.warning("DISCORD_BOT_TOKEN not found in environment variables - Discord bot will not be initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down VoiceBot API...")
    try:
        discord_manager = get_discord_bot_manager()
        await discord_manager.shutdown()
        logger.info("Discord bot shut down successfully")
    except Exception as e:
        logger.error(f"Error during Discord bot shutdown: {str(e)}")


# Create FastAPI application
app = FastAPI(
    title="VoiceBot API",
    description="API for voice management and Discord bot operations",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS for VPN access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for VPN access - restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(voices_router)
app.include_router(prompt_router)
app.include_router(discord_bot_router)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "voicebot-api"}

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "VoiceBot API",
        "version": "1.0.0",
        "description": "API for voice management and Discord bot operations",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8020) 