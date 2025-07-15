# Plan implementacji widoku Voices

## 1. Przegląd
Widok `Voices` umożliwia użytkownikowi przeglądanie, podgląd, usuwanie oraz tworzenie nowych głosów za pomocą prostego interfejsu. Obejmuje listę głosów, kontrolki audio, formularz generowania oraz potwierdzenie usuwania.

## 2. Routing widoku
Ścieżka dostępu: `/voices`

## 3. Struktura komponentów
- **VoicesPage**  
  - `VoicesTable`  
    - `AudioPlayer`  
    - `DeleteConfirmationModal`  
  - **CreateVoiceSection**  
    - `CreateVoiceForm`  
      - `PromptImprovementButton`  
    - `VoicePreviewsList`  
      - `VoicePreviewCard`  
    - `NameDescriptionForm`  
  - `ToastProvider`  
  - `LoadingSpinner`

## 4. Szczegóły komponentów
### VoicesPage
- Opis: Kontener ładuje dane głosów i zarządza stanem listy oraz sekcją tworzenia.
- Elementy:  
  - Przycisk odświeżania listy  
  - `VoicesTable` (typu `ListVoicesResponseDTO`)  
  - `CreateVoiceSection`
- Zdarzenia:  
  - onMount → fetchVoices  
  - onRefresh → ponowne fetchVoices  
  - onVoiceCreated → aktualizacja listy  
  - onVoiceDeleted → usunięcie z listy
- Walidacja: brak
- Propsy: brak

### VoicesTable
- Opis: Wyświetla dane w tabeli Shadcn/ui.
- Główne elementy:  
  - Kolumny: Nazwa, ID, Prompt (skrót 50 znaków), Data utworzenia (format UTC), Próbki audio  
  - Akcje: przyciski Play/Pause (AudioPlayer), Usuń (otwiera `DeleteConfirmationModal`)
- Zdarzenia:  
  - onPlaySample(sampleId)  
  - onPauseSample(sampleId)  
  - onDeleteVoice(voiceId)
- Typy:  
  - `VoiceDTO[]`  
  - `VoiceSampleDTO`
- Propsy:  
  - `voices: VoiceDTO[]`  
  - `onDelete(voiceId: string): void`

### AudioPlayer
- Opis: Kontroler odtwarzania audio z play/pause.
- Elementy:  
  - `<audio>`  
  - przycisk play/pause z ARIA
- Zdarzenia:  
  - onPlay, onPause
- Propsy:  
  - `src: string`  
  - `mediaType: string`  
  - `durationSecs: number`

### DeleteConfirmationModal
- Opis: Modal potwierdzający usunięcie głosu.
- Elementy:  
  - Tekst potwierdzenia  
  - Przycisk "Potwierdź" (usuń)  
  - Przycisk "Anuluj"
- Zdarzenia:  
  - onConfirm → deleteVoice(voiceId)  
  - onCancel
- Propsy:  
  - `voiceId: string`  
  - `onConfirm(): void`  
  - `onCancel(): void`

### CreateVoiceSection
- Opis: Sekcja tworzenia nowego głosu.
- Elementy:  
  - `CreateVoiceForm`  
  - `VoicePreviewsList` (widoczny po generacji)  
  - `NameDescriptionForm`
- Propsy: żadne

### CreateVoiceForm
- Opis: Formularz do wprowadzenia prompta i parametrów.
- Elementy:  
  - `textarea` prompt (max 1000 znaków)  
  - `PromptImprovementButton`  
  - `Slider` loudness (0–100)  
  - `Slider` creativity (0–1, krok 0.1)  
  - `Button` "Generuj podglądy"
- Walidacja:  
  - prompt: niepusty, ≤1000 znaków
- Zdarzenia:  
  - onChange → walidacja  
  - onSubmit → designVoice(command)
- Typy:  
  - `PromptImprovementCommand`  
  - `DesignVoiceCommand`
- Propsy:  
  - `onDesign(command: DesignVoiceCommand): void`

### PromptImprovementButton
- Opis: Wyślij prompt do ulepszenia AI.
- Zdarzenia:  
  - onClick → improvePrompt({ prompt })  
  - onSuccess → uzupełnij textarea
- Propsy:  
  - `prompt: string`  
  - `onImprove(improved: string): void`

### VoicePreviewsList
- Opis: Lista zwróconych podglądów głosów.
- Elementy:  
  - `VoicePreviewCard` dla każdego podglądu (max 3)
- Zdarzenia:  
  - onSelectPreview(previewId)
- Typy:  
  - `VoicePreviewDTO[]`
- Propsy:  
  - `previews: VoicePreviewDTO[]`  
  - `onSelect(id: string): void`

### NameDescriptionForm
- Opis: Formularz nazwy i opisu przed stworzeniem głosu.
- Elementy:  
  - `input` voiceName (max 100)  
  - `textarea` voiceDescription (max 500)  
  - `Button` "Utwórz głos"
- Walidacja:  
  - name: niepuste, ≤100 znaków  
  - description: opcjonalne, ≤500 znaków
- Zdarzenia:  
  - onSubmit → createVoice(command)
- Typy:  
  - `CreateVoiceCommand`
- Propsy:  
  - `generatedVoiceId: string`  
  - `onCreate(cmd: CreateVoiceCommand): void`

## 5. Typy
- CreateVoiceFormValues:  
  - `prompt: string`  
  - `loudness: number`  
  - `creativity: number`
- VoicePreviewVM:  
  - `generatedVoiceId: string`  
  - `audioBase64: string`  
  - `mediaType: string`  
  - `durationSecs: number`
- PromptImprovementResponseDTO  
- DesignVoiceResponseDTO
- `VoiceDTO`, `VoiceSampleDTO`, `ListVoicesResponseDTO`

## 6. Zarządzanie stanem
- `useState` i `useEffect` w `VoicesPage` dla `voices: VoiceDTO[]`  
- Custom hooks:  
  - `useFetchVoices()`  
  - `useDesignVoice()`  
  - `useCreateVoice()`  
  - `useDeleteVoice()`  
  - `usePromptImprovement()`

## 7. Integracja API
- fetchVoices → GET `/voices` → `ListVoicesResponseDTO`  
- deleteVoice → DELETE `/voices/{voiceId}`  
- designVoice → POST `/voices/design`  
- createVoice → POST `/voices/`  
- improvePrompt → POST `/prompts/improve`

## 8. Interakcje użytkownika
1. Wejście na stronę → lista głosów  
2. Klik Play/Pause → odtwarzanie próbki  
3. Klik Usuń → modal → potwierdzenie → usunięcie → toast  
4. Wypełnienie prompt → walidacja → Generuj podglądy → spinner  
5. Wybór podglądu → formularz nazwy/ opisu → Utwórz głos → spinner → aktualizacja listy → toast sukcesu  
6. Klik Improve prompt → box z sugestią → akceptacja

## 9. Warunki i walidacja
- prompt: 1–1000 zn.  
- loudness: 0–100  
- creativity: 0–1 (krok 0.1)  
- name: 1–100 zn.  
- description: ≤500 zn.

## 10. Obsługa błędów
- Błędy walidacji → komunikaty pod polami  
- Błędy API → toast error (z `error.message`)  
- Timeout designVoice → toast "Przekroczono czas generowania (120s)"  
- Sieć → toast "Problem z połączeniem"

## 11. Kroki implementacji
1. Utworzyć plik strony `frontend/src/pages/voices.tsx`  
2. Dodać routing w `src/layouts/AppRouter`  
3. Napisać hook `useFetchVoices` w `src/lib/hooks/useVoices.ts`  
4. Stworzyć `VoicesPage` z importem hooków i stanem  
5. Zaimplementować `VoicesTable` z Shadcn/ui  
6. Dodać `AudioPlayer` i `DeleteConfirmationModal`  
7. Napisać `CreateVoiceSection` i `CreateVoiceForm`  
8. Zaimplementować `PromptImprovementButton` z hookiem  
9. Dodać `VoicePreviewsList` i `NameDescriptionForm`  
10. Dodać toast provider i spinner w layout  
11. Przetestować wszystkie interakcje i scenariusze błędów 