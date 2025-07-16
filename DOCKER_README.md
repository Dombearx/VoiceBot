# VoiceBot Docker Setup

Ten projekt zawiera konfigurację Docker dla aplikacji VoiceBot składającej się z frontend (React + Vite) i backend (FastAPI + Python).

## Struktura Docker

- `backend/Dockerfile` - Obraz dla backend FastAPI
- `frontend/Dockerfile` - Obraz dla frontend React
- `frontend/nginx.conf` - Konfiguracja nginx dla frontend
- `docker-compose.yml` - Główny plik orchestracji
- `.dockerignore` - Pliki wykluczone z obrazów Docker

## Wymagania

- Docker
- Docker Compose

## Szybkie uruchomienie

1. **Sklonuj repozytorium i przejdź do katalogu projektu:**
   ```bash
   cd voice_bot
   ```

2. **Skonfiguruj zmienne środowiskowe:**
   ```bash
   # Skopiuj plik .env.example do .env w katalogu backend
   cp backend/.env.example backend/.env
   
   # Edytuj plik .env i dodaj swoje klucze API
   nano backend/.env
   ```

3. **Uruchom aplikację:**
   ```bash
   docker-compose up --build
   ```

4. **Otwórz aplikację w przeglądarce:**
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - Dokumentacja API: http://localhost:8000/docs

## Komendy Docker Compose

### Uruchomienie
```bash
# Uruchom w trybie detached (w tle)
docker-compose up -d

# Uruchom z rebuildem obrazów
docker-compose up --build

# Uruchom tylko backend
docker-compose up backend

# Uruchom tylko frontend
docker-compose up frontend
```

### Zatrzymanie
```bash
# Zatrzymaj wszystkie kontenery
docker-compose down

# Zatrzymaj i usuń wolumeny
docker-compose down -v

# Zatrzymaj i usuń obrazy
docker-compose down --rmi all
```

### Logi
```bash
# Wyświetl logi wszystkich serwisów
docker-compose logs

# Wyświetl logi konkretnego serwisu
docker-compose logs backend
docker-compose logs frontend

# Śledź logi na żywo
docker-compose logs -f
```

### Zarządzanie
```bash
# Sprawdź status kontenerów
docker-compose ps

# Restart serwisu
docker-compose restart backend

# Wykonaj komendę w kontenerze
docker-compose exec backend poetry run python -c "print('Hello from backend')"
docker-compose exec frontend sh
```

## Konfiguracja środowiska

### Zmienne środowiskowe dla backend

Utwórz plik `backend/.env` z następującymi zmiennymi:

```env
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token_here

# ElevenLabs API Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration
DATABASE_URL=sqlite:///./app.db

# Environment
ENVIRONMENT=development

# Logging
LOG_LEVEL=INFO
```

### Porty

- **Frontend**: 80 (http://localhost)
- **Backend**: 8000 (http://localhost:8000)

## Struktura sieci

Aplikacja używa sieci Docker `voicebot-network` do komunikacji między kontenerami:

- Frontend (nginx) → Backend (FastAPI) przez `/api/` proxy
- Backend dostępny bezpośrednio na porcie 8000

## Health Checks

Oba serwisy mają skonfigurowane health checks:

- **Backend**: Sprawdza endpoint `/health`
- **Frontend**: Sprawdza endpoint `/health` (proxy do backend)

## Rozwój

### Tryb development

W trybie development backend ma zamontowany katalog źródłowy, co pozwala na hot-reload:

```yaml
volumes:
  - ./backend:/app
```

### Tryb production

Dla produkcji usuń lub zakomentuj volume mount w `docker-compose.yml`:

```yaml
# volumes:
#   - ./backend:/app
```

## Troubleshooting

### Problem z uprawnieniami
```bash
# Jeśli masz problemy z uprawnieniami do plików
sudo chown -R $USER:$USER .
```

### Problem z portami
```bash
# Sprawdź czy porty są zajęte
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :8000
```

### Problem z obrazami
```bash
# Usuń wszystkie obrazy i zbuduj ponownie
docker-compose down --rmi all
docker system prune -a
docker-compose up --build
```

### Problem z siecią
```bash
# Sprawdź sieci Docker
docker network ls
docker network inspect voicebot_voicebot-network
```

## Bezpieczeństwo

- W produkcji zmień `allow_origins=["*"]` w CORS na konkretne domeny
- Używaj zmiennych środowiskowych dla kluczy API
- Rozważ użycie Docker secrets dla wrażliwych danych
- Regularnie aktualizuj obrazy bazowe 