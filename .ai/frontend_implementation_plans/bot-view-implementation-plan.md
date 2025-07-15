# Plan implementacji widoku Bot

## 1. Przegląd
Widok `Bot` udostępnia interfejs do konfiguracji i kontroli bota Discord. Umożliwia:
- Podgląd statusu połączenia (Connected/Disconnected) i nazwy kanału
- Łączenie/rozłączanie z kanałem głosowym
- Zmianę nazwy bota oraz upload avatara (jpg/png)
- Podgląd dostępnych głosów i odtworzenie wybranego tekstu tym głosem w przeglądarce
- Wysyłanie tekstu do odtworzenia przez bota w wybranym głosie

## 2. Routing widoku
Ścieżka: `/bot`
Komponent ładowany w `frontend/src/pages/bot.tsx` lub podobnym.

## 3. Struktura komponentów
```
BotPage (/bot)
├─ BotStatusCard
├─ ChannelControl
├─ BotConfigForm
├─ VoicesPreviewList
│  └─ AudioPlayer
└─ PlaySpeechForm
   ├─ SelectVoiceDropdown
   ├─ TextInput
   ├─ PlayButton
   └─ CancelButton & ProgressIndicator
``` 

## 4. Szczegóły komponentów
### BotStatusCard
- Opis: wyświetla stan bota i aktualny kanał
- Główne elementy: karta z etykietą statusu, nazwa kanału
- Zdarzenia: odświeżanie (np. pull-to-refresh lub przycisk)
- Walidacja: brak (tylko odczyt)
- Typy: `DiscordBotStatusDTO`
- Propsy: `status: { connected: boolean; channelId?: string }`

### ChannelControl
- Opis: dropdown kanałów + przycisk Connect/Disconnect
- Główne elementy: Radix Dropdown, przycisk
- Zdarzenia: `onSelect(channelId)`, `onClickConnect()`, `onClickDisconnect()`
- Walidacja: channelId wymagane do connect
- Typy: `VoiceChannelDTO[]`, `ConnectBotCommand`
- Propsy: `channels: VoiceChannelDTO[]`, `status.connected`, callbacki

### BotConfigForm
- Opis: formularz zmiany nazwy i avatara bota
- Główne elementy: `<Input name="nickname"/>`, `<FileUpload name="avatar" accept=".jpg,.png"/>`, `<Button>Save</Button>`
- Zdarzenia: `onChange`, `onSubmit`
- Walidacja: nickname niepuste, avatar jpg/png
- Typy: `BotConfigCommand`
- Propsy: `initialName: string`, `onSubmit(values)`

### VoicesPreviewList
- Opis: lista głosów z lokalnym odtwarzaniem próbki
- Główne elementy: tabela/karty z `VoiceDTO.name`, `VoiceSampleDTO.text`, `<AudioPlayer src={sample.audioUrl}/>`
- Zdarzenia: `onPlaySample(sample.audioUrl)`
- Walidacja: brak (tylko odczyt)
- Typy: `VoiceDTO[]`
- Propsy: `voices: VoiceDTO[]`

### PlaySpeechForm
- Opis: formularz wpisania tekstu i wybrania głosu, Play/Cancel
- Główne elementy: `<Select>` (voiceId), `<Textarea maxLength=1000>`, `<Button>Play</Button>`, `<Button>Cancel</Button>`, `<Progress/>`
- Zdarzenia: `onChange`, `onSubmit`, `onCancel`
- Walidacja: `voiceId` wymagane, `text.length ∈ [1,1000]`
- Typy: `PlayCommand`
- Propsy: `voices: VoiceDTO[]`, `onPlay(command)`, `onCancel()`

## 5. Typy
- BotStatusVM = `DiscordBotStatusDTO`
- ChannelOption = `VoiceChannelDTO`
- BotConfigFormValues = `{ nickname: string; avatar: File | null }`
- VoicePreviewVM = `{ id, name, samples: VoiceSampleDTO[] }`
- PlaySpeechFormValues = `{ voiceId: string; text: string }`

## 6. Zarządzanie stanem
- Hook `useBotStatus` (fetch/status, metoda refresh)
- Hook `useChannels` (fetch list)
- Hook/Formik lub React Hook Form dla `BotConfigForm`
- Hook `useVoices` (fetch voices)
- Hook `usePlaySpeech` (execute playAudio, AbortController, spinner, timeout)

## 7. Integracja API
- GET `/discord-bot/status` → `fetchDiscordBotStatus()` → BotStatusCard
- GET `/discord-bot/channels` → `fetchVoiceChannels()` → ChannelControl
- POST `/discord-bot/connect` → `connectDiscordBot({channelId})` → update status
- POST `/discord-bot/disconnect` → `disconnectDiscordBot()` → update status
- PATCH `/discord-bot/config` → `updateDiscordBotConfig({nickname, avatar})` → BotConfigForm
- GET `/voices` → `fetchVoices()` → VoicesPreviewList
- POST `/discord-bot/play` → `playAudio({voiceId, text})` → PlaySpeechForm

## 8. Interakcje użytkownika
1. Wejście na stronę: parallel fetch status, channels, voices → render
2. Wybór kanału + Connect: spinner → update status + toast
3. Klik Disconnect: spinner → update status + toast
4. Wypełnienie i zapis konfiguracji: walidacja → spinner → toast
5. Klik Play sample w VoicesPreviewList → <audio>.play()
6. Wpisanie tekstu + wybór głosu → PlaySpeechForm → spinner → toast / błąd
7. Cancel w PlaySpeechForm → abort + stan idle

## 9. Warunki i walidacja
- Avatar: plik `.jpg` lub `.png`
- Nickname: niepusty string
- Text-to-speech: `1 ≤ text.length ≤ 1000`
- VoiceId: wymagany
- ChannelId: wymagany do connect

## 10. Obsługa błędów
- Sieciowe: toast z komunikatem „Brak połączenia z serwerem”
- 408/timeout: toast „Przekroczono czas oczekiwania”
- 400/409: toast opisujący problem (np. „Bot nie jest połączony”)
- 500: toast „Błąd serwera, spróbuj ponownie”

## 11. Kroki implementacji
1. Utworzyć plik strony `frontend/src/pages/bot.tsx` i dodać routing `/bot`.
2. Zaimplementować hooki: `useBotStatus`, `useChannels`, `useVoices`, `usePlaySpeech`.
3. Tworzyć komponenty UI w `frontend/src/components/bot/` zgodnie z hierarchią.
4. Skonfigurować formularz React Hook Form dla BotConfigForm (walidacja z Zod/HTML).
5. Podłączyć fetchy z `discordBotService` i `voiceService`.
6. Dodać spinnery (`<Spinner/>`) i toasty (np. Shadcn `useToast`).
7. Przetestować interakcje end-to-end (podgląd, connect, config, play, cancel).
8. Zapewnić dostępność (ARIA, kontrasty) i responsywność minimalną dla desktopu.
9. Dodać testy jednostkowe dla hooków i kluczowych komponentów.
10. Przeprowadzić code review i uwzględnić feedback. 