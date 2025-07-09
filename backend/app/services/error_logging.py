import logging
from datetime import datetime
from app.models import ApiType

# Configure logging
logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def log_error(api_type: ApiType, message: str) -> None:
    """
    Log an error with API type context.
    
    Args:
        api_type: Type of API that caused the error
        message: Error message to log
    """
    timestamp = datetime.utcnow().isoformat()
    error_context = {
        "timestamp": timestamp,
        "api_type": api_type.value,
        "message": message
    }
    
    logger.error(f"API Error - {api_type.value}: {message}", extra=error_context) 