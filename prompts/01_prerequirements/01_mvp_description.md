### Główny problem
API do generowania głosów i tekstu mówionego (text-to-speech) jest funkcjonalne, ale brakuje prostego interfejsu użytkownika do jego obsługi oraz integracji z botem Discord. Ręczne wysyłanie zapytań do API jest nieefektywne i niewygodne w codziennym użytkowaniu.

### Najmniejszy zestaw funkcjonalności
- Przeglądanie i zarządzanie istniejącymi głosami (lista, podgląd, usuwanie, tworzenie)
- Tworzenie nowych głosów poprzez formularz (np. nadanie nazwy, wybór parametrów, opis głosu - głosy są generowane z prompta)
- Generowanie mowy (text-to-speech) na podstawie wybranego głosu i tekstu - nagranie będzie odtwarzane przez bota na discordzie
- Konfiguracja bota Discord (ustawienie głosu i tekstu, który ma być odczytany)
- Zarządzanie botem Discordowym - podłączanie i odłączanie go od kanałów głosowych
- Prosty interfejs webowy dostępny przez VPN (brak uwierzytelniania użytkowników)

### Co NIE wchodzi w zakres MVP
- Publiczne udostępnienie aplikacji (brak hostingu produkcyjnego)
- Zaawansowany system użytkowników i uprawnień
- Historia / archiwizacja wygenerowanej mowy
- Zaawansowane opcje konfiguracji bota Discord (np. obsługa wielu serwerów, eventy)
- Obsługa wielu języków / lokalizacji interfejsu

### Kryteria sukcesu
- Użytkownik może w pełni obsłużyć API (tworzenie głosów, generowanie mowy) bez potrzeby znajomości zapytań HTTP
- Użytkownik może jednym kliknięciem ustawić tekst i głos do użycia przez bota Discord
- Aplikacja działa stabilnie w środowisku VPN i spełnia potrzeby osobistego użytku
