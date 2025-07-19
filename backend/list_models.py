#!/usr/bin/env python3
import os
from dotenv import load_dotenv
from elevenlabs import ElevenLabs

load_dotenv()

api_key = os.getenv("ELEVENLABS_API_KEY")
if not api_key:
    print("Błąd: Ustaw zmienną środowiskową ELEVENLABS_API_KEY")
    exit(1)

client = ElevenLabs(api_key=api_key)
models = client.models.list()

print("Dostępne modele ElevenLabs:")
print("=" * 50)

for model in models:
    print(f"ID: {model.model_id}")
    if model.name:
        print(f"Nazwa: {model.name}")
    if model.description:
        print(f"Opis: {model.description}")
    if model.can_do_text_to_speech is not None:
        print(f"Obsługuje TTS: {'Tak' if model.can_do_text_to_speech else 'Nie'}")
    if model.token_cost_factor:
        print(f"Koszt tokenów: {model.token_cost_factor}")
    if model.maximum_text_length_per_request:
        print(f"Maksymalna długość tekstu: {model.maximum_text_length_per_request}")
    print("-" * 30) 