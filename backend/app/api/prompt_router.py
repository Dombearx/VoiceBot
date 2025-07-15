from fastapi import APIRouter, HTTPException
from app.models import PromptImprovementCommand, PromptImprovementResponseDTO, GenerateSampleTextCommand, GenerateSampleTextResponseDTO
from app.services import prompt_service

router = APIRouter(prefix="/prompts", tags=["prompts"])


@router.post("/improve", response_model=PromptImprovementResponseDTO)
async def improve_prompt(cmd: PromptImprovementCommand) -> PromptImprovementResponseDTO:
    """
    Improve a prompt using AI assistance.
    
    Args:
        cmd: Command containing the prompt to improve
        
    Returns:
        Response containing the improved prompt
        
    Raises:
        HTTPException: 400 for validation errors, 500 for external API failures
    """
    try:
        improved = await prompt_service.improve_prompt(cmd)
        return PromptImprovementResponseDTO(improved_prompt=improved)
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        if "External API failure" in str(e):
            raise HTTPException(status_code=503, detail="External AI service unavailable")
        else:
            raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/generate-sample-text", response_model=GenerateSampleTextResponseDTO)
async def generate_sample_text(cmd: GenerateSampleTextCommand) -> GenerateSampleTextResponseDTO:
    """
    Generate sample text based on voice description.
    
    Args:
        cmd: Command containing the voice description
        
    Returns:
        Response containing the generated sample text
        
    Raises:
        HTTPException: 400 for validation errors, 500 for external API failures
    """
    try:
        sample_text = await prompt_service.generate_sample_text(cmd)
        return GenerateSampleTextResponseDTO(sample_text=sample_text)
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        if "External API failure" in str(e):
            raise HTTPException(status_code=503, detail="External AI service unavailable")
        else:
            raise HTTPException(status_code=500, detail="Internal server error") 