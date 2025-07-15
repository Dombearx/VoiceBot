# Architektura UI dla Panelu VoiceBot

## 1. Przegląd struktury UI

Interfejs użytkownika będzie składał się z głównego układu z bocznym panelem nawigacyjnym (Sidebar) oraz trzema głównymi sekcjami: Voices, Bot i Metrics. Każda sekcja udostępnia dedykowany widok zgodny z wymaganiami produktowymi i planem API. Całość zoptymalizowana jest pod desktopowe przeglądarki (Chrome) w ciemnym trybie kolorystycznym. Brak logowania użytkowników – dostęp kontrolowany przez VPN.

## 2. Lista widoków

### Voices
- Ścieżka widoku: `/voices`
- Główny cel: Zarządzanie głosami (lista, podgląd, usuwanie, tworzenie)
- Kluczowe informacje:
  - Tabela/lista głosów: nazwa, ID, prompt, data utworzenia
  - Próbki audio (max 3)
- Kluczowe komponenty:
  - Tabela głosów (Shadcn/ui Table)
  - Formularz tworzenia głosu (input prompt z walidacją, suwaki loudness i creativity)
  - Przycisk „Improve prompt”
  - AudioPlayer (play/pause)
  - Modal potwierdzenia usunięcia
  - Spinner ładowania i generatora (timeout 120 s)
  - Toasty sukcesu/błędu
- UX, dostępność, bezpieczeństwo:
  - Jasne komunikaty walidacji i błędów
  - Możliwość anulowania generacji
  - Etykiety ARIA na przyciskach i tabeli

### Bot
- Ścieżka widoku: `/bot`
- Główny cel: Konfiguracja i kontrola bota Discord (status, kanały, nazwa, avatar, odtwarzanie mowy)
- Kluczowe informacje:
  - Status połączenia (Connected/Disconnected)
  - Dropdown z listą kanałów
  - Pole zmiany nazwy bota
  - Upload avatara (jpg, png)
  - Lista dostępnych głosów z możliwością odsłuchania podanego fragmentu tekstu.
- Kluczowe komponenty:
  - Panel statusu (Shadcn/ui Card)
  - Dropdown kanałów (Radix Dropdown)
  - Formularz nazwy i uploadu pliku
  - Lista głosów (GET /voices) z komponentem AudioPlayer (lokalny podgląd)
  - Przycisk Connect/Disconnect
  - Przycisk Play (wywołujący POST /discord-bot/play)
  - Spinner i Toast
- UX, dostępność, bezpieczeństwo:
  - Sprawdzanie formatu pliku avatar
  - Komunikaty o błędach połączenia i upłynięciu czasu
  - Etykiety ARIA i kontrast kolorystyczny
  - Lokalny podgląd głosów bez opóźnień sieciowych

### Metrics
- Ścieżka widoku: `/metrics`
- Główny cel: Wyświetlanie i odświeżanie metryk operacji głosowych
- Kluczowe informacje:
  - Liczba głosów, zaakceptowanych głosów
  - Długość tekstów, koszty API
- Kluczowe komponenty:
  - Kafelki metryk (Shadcn/ui Badge/Card)
  - Przyciski „Refresh” z Spinnerem
  - Toast dla błędów odświeżania
- UX, dostępność, bezpieczeństwo:
  - Informacje odświeżane w max 3 s
  - Komunikaty o błędach sieciowych
  - Czytelne kontrasty w Dark Mode

## 3. Mapa podróży użytkownika

1. Użytkownik otwiera aplikację, Sidebar domyślnie wskazuje `/voices`.
2. W widoku Voices przegląda listę głosów (GET /voices).
3. Kliknięciem „Play” odtwarza próbkę (AudioPlayer).
4. Aby stworzyć nowy głos, wypełnia formularz prompt, opcjonalnie klikając „Improve prompt” (POST /prompts/improve).
5. Kliknięcie „Generate” wysyła POST /voices, widzi Spinner, może anulować.
6. Po zakończeniu generacji wybiera jedną z trzech próbek, zapisuje wokół listy, widzi toast potwierdzenia.
7. Przechodzi do `/bot`, widzi status bota (GET /discord-bot/status) i listę kanałów (GET /discord-bot/channels).
8. Wybiera kanał z dropdown i klika Connect (POST /discord-bot/connect).
9. W zakładce Bot zmienia nazwę i avatar bota (PATCH /discord-bot/config).
10. W polu play wpisuje tekst, wybiera głos i klika Play (POST /discord-bot/play) — bot odtwarza mowę w kanale.
11. Przechodzi do `/metrics`, widzi kafelki metryk (GET /metrics), może ręcznie odświeżyć.

## 4. Układ i struktura nawigacji

- Sidebar (po lewej) z trzema linkami:
  1. Voices  
  2. Bot  
  3. Metrics
- Na dużych ekranach Sidebar zawsze widoczny, na bardzo małych ukryty jako hamburger menu (opcjonalnie).
- Każdy link zmienia ścieżkę za pomocą React Router.
- Bieżąca sekcja podświetlona w Sidebar.

## 5. Kluczowe komponenty

- Sidebar: globalna nawigacja (Shadcn/ui)
- AudioPlayer: play/pause, kontrolki, stan (HTMLAudioElement)
- ModalConfirm: potwierdzenie usunięcia
- Spinner: wskazanie ładowania (Shadcn/ui)
- Toast: powiadomienia sukcesu/błędu (Shadcn/ui Toast)
- Table: wyświetlanie listy głosów
- FormField: input, slider, upload pliku, dropdown
- Card/Badge: kafelki metryk i panel statusu 