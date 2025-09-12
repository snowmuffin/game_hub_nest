# Space Engineers Module .env

This app loads an additional .env for the Space Engineers module.

- Path: `config/space-engineers/.env`
- Example: `config/space-engineers/.env.example`

Keys used (suggested):
- SE_AUTO_REGISTER_SERVERS (enable auto registration on ingest)
- SE_INGEST_API_KEY (optional shared key for ingest auth)

How it loads
- `ConfigModule.forRoot({ envFilePath: ['.env', 'config/space-engineers/.env'] })` merges variables from both files.
- Values from `config/space-engineers/.env` override same-named ones from `.env` if duplicated.

Tips
- Keep SE_* prefix to avoid collisions.
- Add `config/space-engineers/.env` to your deployment environment or set its variables at the process level.

Ingest payload (example):

POST /space-engineers/servers/:code/health
{
	"status": "UP",
	"method": "http",
	"metricName": "latency",
	"metricValue": 120,
	"metricUnit": "ms",
	"meta": { "apiKey": "your-key" },
	"host": "10.0.1.23",
	"port": 27016,
	"displayName": "se-kr-auto-1"
}
