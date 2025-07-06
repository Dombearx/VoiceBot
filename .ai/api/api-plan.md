# REST API Plan

## 1. Resources

- **Voice** (external TTS service resources; no direct DB table)
- **PromptImprovement** (`/prompts/improve`)
- **TextToSpeech** (`/tts`)
- **GenerationMetric** (`generation_metrics` table)
- **ErrorLog** (`error_logs` table)
- **DiscordBot** (bot configuration and control)

## 2. Endpoints

### 2.1 Voice Management

#### GET /voices
- Description: List all voices (cached from external TTS)
- Query Parameters:
  - None
- Response 200:
  ```json
  {
    "items": [
      { 
        "id": "string", 
        "name": "string", 
        "prompt": "string", 
        "createdAt": "ISO8601",
        "samples": [
          {
            "id": "string",
            "text": "string",
            "audioUrl": "string"
          }
        ]
      }
    ]
  }
  ```
- Errors: 500 (server error)

#### POST /voices
- Description: Create/generate a new voice (generates 3 samples with audio)
- Body:
  ```json
  {
    "prompt": "string (max 1000 chars)",
    "sampleText": "string (max 500 chars)",
    "loudness": number,
    "creativity": number
  }
  ```
- Response 201:
  ```json
  {
    "id": "string",
    "name": "string", 
    "prompt": "string",
    "createdAt": "ISO8601",
    "samples": [
      {
        "id": "string",
        "text": "string",
        "audioUrl": "string"
      },
      {
        "id": "string", 
        "text": "string",
        "audioUrl": "string"
      },
      {
        "id": "string",
        "text": "string", 
        "audioUrl": "string"
      }
    ]
  }
  ```
- Errors:
  - 400 Prompt invalid or >1000 chars, sampleText > 1000 chars
  - 408 Generation timeout (120s)
  - 500 External API error

#### DELETE /voices/{voiceId}
- Description: Delete an existing voice
- Response 204 No Content
- Errors: 404 if not found

### 2.2 Prompt Improvement

#### POST /prompts/improve
- Description: Improve user prompt via AI
- Body:
  ```json
  { "prompt": "string (max 1000 chars)" }
  ```
- Response 200:
  ```json
  { "improvedPrompt": "string (max 1000 chars)" }
  ```
- Errors: 400 invalid prompt; 500 on external API failure

### 2.3 Text-to-Speech (TTS)

#### POST /tts
- Description: Generate speech from text using a specific voice
- Body:
  ```json
  { "voiceId": "string", "text": "string (max 1000 chars)", "timeout": 30 }
  ```
- Response 200:
  ```json
  { 
    "audioUrl": "string",
    "voiceId": "string",
    "text": "string",
    "duration": "number (seconds)"
  }
  ```
- Errors:
  - 400 missing/invalid fields
  - 408 TTS timeout
  - 500 on external API error

### 2.4 Generation Metrics

#### GET /metrics
- Description: List generation metrics
- Query Parameters:
  - `voiceId` (string)
  - `apiType` (`voice_generation`,`tts`,`prompt_improvement`)
  - `from` (ISO8601)
  - `to` (ISO8601)
  - `page`, `limit`, `sortBy`, `order`
- Response 200:
  ```json
  {
    "items": [
      { "id": "string", "voiceId": "string", "tokenCount": 0, "textLength": 0, "apiType": "tts", "createdAt": "ISO8601" }
    ],
    "page": 1,
    "limit": 20,
    "total": 100
  }
  ```

### 2.5 Error Logs

#### GET /error-logs
- Description: List error logs
- Query Parameters: same as `/metrics`
- Response 200: same structure as `/metrics` but with `errorMessage`

### 2.6 Discord Bot

#### GET /discord-bot/status
- Description: Get connection status and current channel
- Response 200:
  ```json
  { "connected": true|false, "channelId": "string?" }
  ```

#### GET /discord-bot/channels
- Description: List available voice channels
- Response 200:
  ```json
  [ { "id": "string", "name": "string" } ]
  ```

#### POST /discord-bot/connect
- Description: Connect bot to a channel
- Body:
  ```json
  { "channelId": "string" }
  ```
- Response 200:
  ```json
  { "connected": true, "channelId": "string" }
  ```

#### POST /discord-bot/disconnect
- Description: Disconnect bot from voice channel
- Response 200:
  ```json
  { "connected": false }
  ```

#### PATCH /discord-bot/config
- Description: Update bot name and avatar
- Body (multipart/form-data):
  - `name` (string)
  - `avatar` (file jpg|png)
- Response 200:
  ```json
  { "name": "string", "avatarUrl": "string" }
  ```

#### POST /discord-bot/play
- Description: Play TTS audio in connected channel
- Body:
  ```json
  { "voiceId": "string", "text": "string" }
  ```
- Response 202 Accepted
- Errors: 400 invalid input, 409 if not connected, 500 on playback error

## 3. Authentication and Authorization

- No user-level auth; API accessible only within VPN-protected network (PRD)
- Internal service-to-service calls (e.g., to TTS API) use API keys stored in environment variables

## 4. Validation and Business Logic

### 4.1 Request Validation
- `prompt` max 1000 chars (US-004)  
- `sampleText` max 1000 chars for voice generation
- `tokenCount` >= 0, `textLength` >= 0 (`generation_metrics` constraints)  
- `apiType` in [`voice_generation`,`tts`,`prompt_improvement`]  
- TTS `timeout` capped at 30s (US-006)

### 4.2 Business Logic
- Prompt improvement via `/prompts/improve` before voice generation (US-005)
- Voice creation timeout: 120s enforced by HTTP client (US-004)
- Bot connect/disconnect triggers Discord API calls and status events (US-007, US-008)
- Playback via `/discord-bot/play` emits audio events into connected channel (US-010)
- Dashboard metrics aggregated from `generation_metrics` and `error_logs`; refreshed on GET `/metrics` (US-011)

---

*Assumptions:*
- Voices are managed in-memory or via external TTS API; persistent storage of audio is out of scope.
- Bot authentication handled by environment-stored Discord token.
- Rate limiting not required for MVP but should be added in future enhancements. 