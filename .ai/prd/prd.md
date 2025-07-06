# Dokument wymagań produktu (PRD) - Panel sterowania VoiceBotem

## 1. Przegląd produktu

Panel sterowania VoiceBotem to aplikacja webowa, która zapewnia intuicyjny interfejs do zarządzania głosami generowanymi przez zewnętrzne API (text-to-speech) oraz integracji z botem Discord. Umożliwia nietechnicznym użytkownikom:

- przeglądanie i zarządzanie głosami (lista, podgląd, usuwanie)
- tworzenie nowych głosów na podstawie prompta z opcją automatycznego ulepszenia
- generowanie mowy na podstawie wybranego głosu i tekstu z możliwością anulowania operacji w przeglądarce
- konfigurację i sterowanie botem Discord (połączenie, kanał, zmiana nazwy i awatara)
- odtwarzanie wygenerowanej mowy przez bota w kanale głosowym Discord
- monitorowanie kluczowych metryk (liczba głosów, długość tekstów, koszty API) z ręcznym odświeżaniem

Technologie:

- backend: FastAPI (Python)
- frontend: React + TypeScript
- baza danych: SQLite (wolumin Docker)
- konteneryzacja: Docker Compose
- dostęp: tylko przez VPN, bez dodatkowego logowania
- środowisko docelowe: przeglądarka Chrome na standardowym ekranie HD

## 2. Problem użytkownika

Obecnie korzystanie z API do generowania głosów i mowy wymaga ręcznego wysyłania zapytań HTTP, co jest nieefektywne i uciążliwe dla nietechnicznych użytkowników. Brak prostego interfejsu uniemożliwia szybkie tworzenie i testowanie głosów oraz integrację z botem Discord. Użytkownicy potrzebują jednego widoku, aby zarządzać głosami, generować mowę i sterować botem bez znajomości protokołów czy narzędzi deweloperskich.

## 3. Wymagania funkcjonalne

- zarządzanie głosami
  - lista istniejących głosów z nazwą, identyfikatorem i datą utworzenia
  - podgląd (play/pause) w przeglądarce
  - usuwanie głosu z potwierdzeniem
- tworzenie nowych głosów
  - formularz z polem prompt (max 1000 znaków) i walidacją długości
  - opcja automatycznego ulepszenia prompta przez AI
  - dwa parametry - jak głośny ma być głos i jak bardzo dostosowany do prompta (w opozycji do większej wolności przy generowaniu)
  - generacja głosu z timeoutem 120 s
  - dodanie nowego głosu do listy po zakończeniu generacji
- generowanie mowy
  - wybór głosu i wprowadzenie tekstu
  - przycisk generacji i wskaźnik postępu
  - anulowanie operacji i obsługa błędu po przekroczeniu 30 s
- konfiguracja bota Discord
  - panel statusu: połączenie (Connected/Disconnected) i bieżący kanał
  - rozwijana lista kanałów do łączenia/rozłączania
  - upload awatara i zmiana nazwy bota z zapisem zmian
- odtwarzanie mowy przez bota Discord
  - interfejs do wpisania tekstu, wybrania głosu i odtworzenia w kanale głosowym
- dashboard metryk
  - wyświetlanie liczby głosów, liczby zaakceptowanych głosów, długości tekstów, kosztów API (Eleven Labs, OpenAI)
  - przycisk ręcznego odświeżania metryk
- dostęp przez VPN
  - ograniczenie dostępu do aplikacji wyłącznie dla użytkowników połączonych z VPN - nie wymaga to żadnej implementacji, docker będzie uruchomiony wewnątrz VPNa zapewniając bezpieczeństwo

## 4. Granice produktu

- brak publicznego hostingu produkcyjnego
- brak zaawansowanego systemu użytkowników i uprawnień
- brak historii i archiwizacji wygenerowanej mowy
- brak obsługi wielu języków i lokalizacji interfejsu
- brak zaawansowanych funkcji bota Discord (wiele serwerów, eventy)
- interfejs optymalizowany pod desktop Chrome; brak responsywności na innych urządzeniach
- logowanie HTTP i błędów wyłącznie do konsoli Dockera; brak dodatkowych mechanizmów przechowywania logów

## 5. Historyjki użytkowników

- ID: US-001  
  Tytuł: Przegląd listy głosów  
  Opis: jako użytkownik chcę zobaczyć listę dostępnych głosów, aby wiedzieć, które głosy mogę wykorzystać  
  Kryteria akceptacji:  
  - aplikacja wyświetla tabelę/listę z nazwą, identyfikatorem, promptem użytym do generacji i datą utworzenia każdego głosu  
  - każdy wiersz zawiera przyciski podglądu i usunięcia  

- ID: US-002  
  Tytuł: Podgląd (play/pause) głosu  
  Opis: jako użytkownik chcę odtworzyć i wstrzymać próbkę głosu w przeglądarce, by ocenić jego brzmienie  
  Kryteria akceptacji:  
  - przycisk podglądu zaczyna odtwarzanie audio  
  - przycisk pauzy zatrzymuje odtwarzanie  
  - odtwarzanie działa poprawnie dla wszystkich głosów na liście  

- ID: US-003  
  Tytuł: Usuwanie głosu z potwierdzeniem  
  Opis: jako użytkownik chcę usuwać niepotrzebne głosy po potwierdzeniu, aby utrzymywać porządek  
  Kryteria akceptacji:  
  - kliknięcie przycisku usuń otwiera modal potwierdzenia  
  - po potwierdzeniu głos jest usuwany z listy  
  - anulowanie modal pozostawia głos bez zmian  

- ID: US-004  
  Tytuł: Tworzenie nowego głosu  
  Opis: jako użytkownik chcę wprowadzić prompt (max 1000 znaków) i wygenerować głos, aby dodać nowy głos do zestawu  
  Kryteria akceptacji:  
  - formularz waliduje limit 1000 znaków i wyświetla komunikat błędu przy przekroczeniu  
  - przycisk generacji jest dostępny tylko przy poprawnej długości prompta  
  - po zakończeniu generacji nowy głos pojawia się na liście  

- ID: US-005  
  Tytuł: Ulepszenie prompta przez AI  
  Opis: jako użytkownik chcę mieć opcję automatycznego ulepszenia prompta, by uzyskać lepszą jakość głosu  
  Kryteria akceptacji:  
  - dostępny przycisk/akcja ulepszenia prompta  
  - po kliknięciu wyświetla się sugestia ulepszonego prompta  
  - użytkownik może zaakceptować sugerowany prompt i użyć go do generacji  

- ID: US-006  
  Tytuł: Generowanie mowy z możliwością anulowania i timeoutem  
  Opis: jako użytkownik chcę wygenerować mowę z wybranego głosu i móc anulować operację lub otrzymać błąd po 30 s  
  Kryteria akceptacji:  
  - po wybraniu głosu i wprowadzeniu tekstu dostępny jest przycisk generacji  
  - podczas generacji wyświetla się wskaźnik postępu  
  - kliknięcie anuluj przerywa proces i przywraca poprzedni stan  
  - po 30 s bez odpowiedzi wyświetlany jest czytelny komunikat o przekroczeniu czasu  

- ID: US-007  
  Tytuł: Wyświetlanie statusu bota Discord  
  Opis: jako użytkownik chcę widzieć status połączenia bota (Connected/Disconnected) i jego bieżący kanał  
  Kryteria akceptacji:  
  - panel statusu pokazuje aktualny stan połączenia  
  - gdy bot jest połączony, wyświetlana jest nazwa kanału  

- ID: US-008  
  Tytuł: Łączenie i rozłączanie bota Discord  
  Opis: jako użytkownik chcę wybierać kanał z rozwijanej listy, aby łączyć lub rozłączać bota z kanałem głosowym  
  Kryteria akceptacji:  
  - dropdown zawiera listę dostępnych kanałów  
  - wybranie kanału powoduje połączenie bota i aktualizację statusu  
  - dostępna opcja rozłączenia bota  

- ID: US-009  
  Tytuł: Zmiana nazwy i awatara bota Discord  
  Opis: jako użytkownik chcę przesłać plik z awatarem i zmienić nazwę bota, by personalizować jego wygląd  
  Kryteria akceptacji:  
  - dostępne pole do zmiany nazwy i przycisk zapisu zmian  
  - upload pliku awatara akceptuje wyłącznie formaty graficzne (jpg, png)  
  - po zatwierdzeniu zmiany nazwa i awatar aktualizują się w panelu  

- ID: US-010  
  Tytuł: Odtwarzanie mowy przez bota Discord  
  Opis: jako użytkownik chcę wpisać tekst, wybrać głos i kliknąć odtwórz, aby bot odtworzył mowę w kanale  
  Kryteria akceptacji:  
  - interfejs umożliwia wpisanie tekstu i wybór głosu  
  - po kliknięciu odtworz mowa jest odtwarzana w wybranym kanale Discord  
  - w razie błędu wyświetlany jest komunikat o niepowodzeniu  

- ID: US-011  
  Tytuł: Wyświetlanie i odświeżanie metryk  
  Opis: jako użytkownik chcę przeglądać kluczowe metryki oraz móc je ręcznie odświeżyć, aby monitorować działanie i koszty  
  Kryteria akceptacji:  
  - dashboard pokazuje liczbę głosów, liczbę zaakceptowanych głosów, długości tekstów i koszty API  
  - przycisk odświężania pobiera nowe dane i uaktualnia widok w ciągu 3 s  

## 6. Metryki sukcesu

- 100% operacji generacji głosu kończy się sukcesem lub czytelnym błędem po 30 s  
- średni czas generacji głosu poniżej 30 s  
- liczba wygenerowanych głosów rośnie w miarę użytkowania 
- koszty API (Eleven Labs i OpenAI) utrzymane w założonym budżecie miesięcznym  
- stabilne działanie w środowisku Docker Compose (brak krytycznych awarii przez co najmniej 30 dni)  
- wszystkie testy jednostkowe przechodzą w CI bez przerw 