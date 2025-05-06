# Python FastAPI Backend

This is a minimal FastAPI backend template for your monorepo.

## Setup

1. Install Poetry (if not already):
   https://python-poetry.org/docs/#installation

2. Install dependencies:
   ```sh
   poetry install
   ```

3. Copy the example environment file and edit as needed:
   ```sh
   cp .env.example .env
   ```

4. Run the development server:
   ```sh
   poetry run uvicorn main:app --reload
   ```

## Project Structure

- `main.py` — FastAPI entrypoint
- `.env.example` — Example environment variables
- `pyproject.toml` — Dependency management (Poetry)

You can now add your API logic and routes in `main.py` or organize them into submodules as your project grows.
