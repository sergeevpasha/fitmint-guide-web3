.PHONY: up down rebuild install compile deploy bash
PROJECT=fitmint_web3
up:
	docker-compose up -d
down:
	docker-compose down
rebuild:
	docker-compose build --no-cache
install:
	docker exec $(PROJECT) yarn install
compile:
	docker exec $(PROJECT) npm run -s compile
deploy:
	docker exec $(PROJECT) npm run -s deploy
test:
	@docker exec $(PROJECT) npm run -s test
bash:
	@docker exec -it $(PROJECT) bash
