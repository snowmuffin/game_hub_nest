# Space Engineers Module .env

This app loads an additional .env for the Space Engineers module.

- Path: `config/space-engineers/.env`
- Example: `config/space-engineers/.env.example`

Keys used (suggested):
- SE_SERVER_HOST
- SE_SERVER_PORT
- SE_DROP_RATE_MULTIPLIER (optional)
- SE_MARKETPLACE_ENABLED (optional)
- SE_MAX_STORAGE_SLOTS (optional)
- SE_MAX_ITEM_STACK (optional)

How it loads
- `ConfigModule.forRoot({ envFilePath: ['.env', 'config/space-engineers/.env'] })` merges variables from both files.
- Values from `config/space-engineers/.env` override same-named ones from `.env` if duplicated.

Tips
- Keep SE_* prefix to avoid collisions.
- Add `config/space-engineers/.env` to your deployment environment or set its variables at the process level.
