# Docker deployment

## Environment

Copy the example file and fill in the values used for production.

```sh
cp .env.example .env
```

`VITE_API_BASE_URL` must be reachable from the user's browser, because it is embedded into the Vite build. Rebuild the image after changing it.

## Run

```sh
docker compose up -d --build
```

The frontend is served by Nginx at:

```txt
http://localhost:${FRONTEND_PORT:-8080}
```

## Useful commands

```sh
docker compose logs -f frontend
docker compose down
docker compose build --no-cache frontend
```
