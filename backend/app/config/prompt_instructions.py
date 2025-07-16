from pathlib import Path
from typing import Final


def _load_prompt_instruction(file_path: str) -> str:
    """
    Load prompt instruction from a markdown file.
    
    Args:
        file_path: Path to the markdown file relative to this module
        
    Returns:
        Content of the markdown file as string
        
    Raises:
        FileNotFoundError: If the specified file doesn't exist
        IOError: If there's an error reading the file
    """
    try:
        current_dir = Path(__file__).parent
        full_path = current_dir / file_path
        
        if not full_path.exists():
            raise FileNotFoundError(f"Prompt instruction file not found: {full_path}")
            
        return full_path.read_text(encoding="utf-8")
    except IOError as e:
        raise IOError(f"Error reading prompt instruction file {file_path}: {e}") from e


# Load prompt instructions from markdown files
IMPROVE_PROMPT_INSTRUCTION: Final[str] = _load_prompt_instruction("prompts/improve-prompt-instructions.md")
GENERATE_SAMPLE_TEXT_INSTRUCTION: Final[str] = _load_prompt_instruction("prompts/generate-sample-text-instructions.md")
TRANSLATE_VOICE_DESCRIPTION_INSTRUCTION: Final[str] = _load_prompt_instruction("prompts/translate-voice-description-instructions.md")