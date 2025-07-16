.PHONY: run run_frontend

run:
	cd backend && poetry run python main.py

run_frontend:
	cd frontend && npm run dev

docker_build:
	docker system prune -f
	docker build -t voicebot-backend -f backend/Dockerfile ./backend
	docker build -t voicebot-frontend -f frontend/Dockerfile ./frontend
	docker image prune -f

docker_save:
	mkdir -p ./images
	rm -rf ./images/voicebot-backend.tar ./images/voicebot-frontend.tar
	docker save -o ./images/voicebot-backend.tar voicebot-backend
	docker save -o ./images/voicebot-frontend.tar voicebot-frontend

manage_remote:
	ssh 192.168.0.201 "mkdir -p /home/domin/images /home/domin/voiceBot"
	ssh 192.168.0.201 "rm -rf ./images/voicebot-backend.tar ./images/voicebot-frontend.tar"
	scp ./images/voicebot-backend.tar ./images/voicebot-frontend.tar domin@192.168.0.201:/home/domin/images
	scp ./docker-compose.yml domin@192.168.0.201:/home/domin/voiceBot/
	ssh 192.168.0.201 "cd /home/domin/voiceBot; docker-compose stop"
	ssh 192.168.0.201 "cd /home/domin/voiceBot; docker-compose down"
	ssh 192.168.0.201 "docker load -i /home/domin/images/voicebot-backend.tar"
	ssh 192.168.0.201 "docker load -i /home/domin/images/voicebot-frontend.tar"
	ssh 192.168.0.201 "docker image prune -f"
	ssh 192.168.0.201 "docker system prune -f"
	ssh 192.168.0.201 "cd /home/domin/voiceBot; docker-compose up -d"

deploy: docker_build docker_save manage_remote 