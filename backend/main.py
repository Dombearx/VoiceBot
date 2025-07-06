"""
VoiceBot FastAPI Application - Main entry point.
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.voices import router as voices_router

# Load environment variables from .env file
load_dotenv()

# Create FastAPI application
app = FastAPI(
    title="VoiceBot API",
    description="API for voice management and Discord bot operations",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
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
    uvicorn.run(app, host="0.0.0.0", port=8000) 