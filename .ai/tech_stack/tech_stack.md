Frontend – React z Vite jako lekka i elastyczna baza interfejsu użytkownika:
- React 19 jako nowoczesna i powszechnie wspierana biblioteka komponentów
- Vite jako szybki bundler i dev server, idealny do lokalnego developmentu i małych aplikacji
- Tailwind CSS 4 do szybkiego i wydajnego stylowania komponentów w sposób użyteczny i konfigurowalny
- Shadcn/ui jako baza nowoczesnych, dostępnych komponentów React zgodnych z Radix UI
- TypeScript 5 dla zwiększenia niezawodności oraz zaawansowanej obsługi IDE

Backend – FastAPI jako lekki, szybki i dobrze udokumentowany framework webowy:
- FastAPI jako framework REST API, który jest szybki, asynchroniczny i oferuje automatyczną dokumentację OpenAPI/Swagger
- Python 3.12 jako język backendowy, doskonale integrujący się z AI i botami Discord
- SQLModel jako lekki ORM oparty na Pydantic i SQLAlchemy – wygodny i typowany
- SQLite jako baza danych – idealna dla lokalnego MVP, bez potrzeby uruchamiania osobnego serwera
- Uvicorn jako ASGI server do uruchamiania backendu w trybie produkcyjnym

Bot Discord – Integracja w czasie rzeczywistym z kanałami głosowymi Discorda:
- discord.py (v2) jako oficjalna, asynchroniczna biblioteka do obsługi bota Discord
- Możliwość podłączania się do kanałów głosowych, odtwarzania audio i reagowania na komendy
- Integracja z lokalnym API TTS i interfejsem webowym w czasie rzeczywistym

AI – Dostęp do TTS i modeli przez wewnętrzne API:
- Korzystanie z istniejącego wewnętrznego API TTS (elevenlabs) jako źródła do generowania mowy

CI/CD i Hosting – Lekka infrastruktura oparta na prostocie i lokalności:
- Docker do pakowania backendu, bota i frontendu w jedno środowisko
- Docker Compose do zarządzania lokalnym uruchamianiem wszystkich komponentów