"""
Base service class for Sytra microservices
Provides common functionality for all services
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime
import os
import logging


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


class HealthResponse(BaseModel):
    """Health check response model"""
    status: str
    service: str
    version: str
    timestamp: str


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    message: str
    timestamp: str


class BaseService:
    """Base class for all Sytra microservices"""
    
    def __init__(self, name: str, version: str, description: str):
        """
        Initialize base service
        
        Args:
            name: Service name
            version: Service version
            description: Service description
        """
        self.name = name
        self.version = version
        self.description = description
        self.logger = logging.getLogger(name)
        
        # Create FastAPI app
        self.app = FastAPI(
            title=name,
            version=version,
            description=description
        )
        
        # Add CORS middleware
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        # Register base endpoints
        self._register_base_endpoints()
        
        self.logger.info(f"{name} v{version} initialized")
    
    def _register_base_endpoints(self):
        """Register common endpoints for all services"""
        
        @self.app.get("/health", response_model=HealthResponse)
        async def health_check():
            """Health check endpoint"""
            return HealthResponse(
                status="healthy",
                service=self.name,
                version=self.version,
                timestamp=datetime.utcnow().isoformat()
            )
        
        @self.app.get("/")
        async def root():
            """Root endpoint with service info"""
            return {
                "service": self.name,
                "version": self.version,
                "description": self.description,
                "status": "running",
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def get_app(self) -> FastAPI:
        """Get the FastAPI application instance"""
        return self.app
    
    def log_info(self, message: str):
        """Log info message"""
        self.logger.info(message)
    
    def log_error(self, message: str):
        """Log error message"""
        self.logger.error(message)
    
    def log_warning(self, message: str):
        """Log warning message"""
        self.logger.warning(message)


def validate_required_fields(data: Dict[str, Any], required_fields: List[str]) -> None:
    """
    Validate that required fields are present in data
    
    Args:
        data: Dictionary to validate
        required_fields: List of required field names
        
    Raises:
        HTTPException: If any required field is missing
    """
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required fields: {', '.join(missing_fields)}"
        )


def create_error_response(error: str, message: str) -> ErrorResponse:
    """
    Create standardized error response
    
    Args:
        error: Error type/code
        message: Error message
        
    Returns:
        ErrorResponse object
    """
    return ErrorResponse(
        error=error,
        message=message,
        timestamp=datetime.utcnow().isoformat()
    )


# Made with Bob