from openai import OpenAI
from app.models import PromptImprovementCommand, GenerateSampleTextCommand
from app.config.prompt_instructions import IMPROVE_PROMPT_INSTRUCTION, GENERATE_SAMPLE_TEXT_INSTRUCTION
from app.services.error_logging import log_error
from app.models import ApiType


async def improve_prompt(cmd: PromptImprovementCommand) -> str:
    """
    Improve a prompt using OpenAI API.
    
    Args:
        cmd: Command containing the prompt to improve
        
    Returns:
        Improved prompt text
        
    Raises:
        Exception: If OpenAI API call fails
    """
    try:
        client = OpenAI()
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": IMPROVE_PROMPT_INSTRUCTION},
                {"role": "user", "content": cmd.prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        error_message = f"OpenAI API call failed: {str(e)}"
        log_error(ApiType.prompt_improvement, error_message)
        raise Exception("External API failure") from e


async def generate_sample_text(cmd: GenerateSampleTextCommand) -> str:
    """
    Generate sample text based on voice description using OpenAI API.
    
    Args:
        cmd: Command containing the voice description
        
    Returns:
        Generated sample text
        
    Raises:
        Exception: If OpenAI API call fails
    """
    try:
        client = OpenAI()
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": GENERATE_SAMPLE_TEXT_INSTRUCTION},
                {"role": "user", "content": f"Generate sample text for a voice described as: {cmd.voice_description}"}
            ],
            max_tokens=500,
            temperature=0.8
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        error_message = f"OpenAI API call failed: {str(e)}"
        log_error(ApiType.prompt_improvement, error_message)  # Using same ApiType for now
        raise Exception("External API failure") from e 