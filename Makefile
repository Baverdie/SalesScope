.PHONY: help install dev dev-api dev-web build test lint docker-up docker-down db-migrate db-seed clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	pnpm install

dev: ## Start all services in development mode
	pnpm dev

dev-api: ## Start backend API only
	pnpm dev:api

dev-web: ## Start frontend only
	pnpm dev:web

build: ## Build all apps for production
	pnpm build

test: ## Run all tests
	pnpm test

lint: ## Run linter on all apps
	pnpm lint

docker-up: ## Start Docker containers (PostgreSQL + Redis)
	docker compose up -d
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 3

docker-down: ## Stop Docker containers
	docker compose down

docker-logs: ## View Docker container logs
	docker compose logs -f

db-migrate: ## Run database migrations
	pnpm db:migrate

db-seed: ## Seed database with demo data
	pnpm db:seed

db-studio: ## Open Prisma Studio
	cd apps/api && pnpm db:studio

clean: ## Clean all build artifacts and dependencies
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/node_modules
	rm -rf apps/*/dist
	rm -rf apps/*/.next

setup: docker-up install db-migrate ## Complete setup for new developers
	@echo "✅ Setup complete! Run 'make dev' to start development"
