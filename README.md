# hevy-mcp

MCP (Model Context Protocol) server for the [Hevy](https://hevy.com) workout tracker API.

Lets Claude (or any MCP client) read and write your Hevy data: workouts, routines, exercise templates, routine folders, exercise history, and body measurements.

## Requirements

- Node.js >= 18
- A Hevy Pro account and API key from <https://hevy.com/settings?developer>

## Setup

```bash
npm install
npm run build
```

## Configure

### API key

Two ways to provide the key (checked in this order):

1. `HEVY_API_KEY` environment variable
2. A `.env` file in the project root (gitignored):

   ```bash
   echo 'HEVY_API_KEY=your-api-key' > .env
   chmod 600 .env
   ```

### Claude Code

With the `.env` file in place, the project's `.mcp.json` is picked up automatically when running `claude` inside this repo. To register it globally:

```bash
claude mcp add hevy -s user -- node /path/to/hevy-mcp/dist/index.js
```

Or pass the key explicitly instead of using `.env`:

```bash
claude mcp add hevy --env HEVY_API_KEY=your-api-key -- node /path/to/hevy-mcp/dist/index.js
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hevy": {
      "command": "node",
      "args": ["/path/to/hevy-mcp/dist/index.js"],
      "env": {
        "HEVY_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `get-workouts` | Paginated list of workouts |
| `get-workout` | Single workout by ID |
| `get-workout-count` | Total workout count |
| `get-workout-events` | Workout update/delete events since a date (sync) |
| `create-workout` | Log a completed workout |
| `update-workout` | Update a workout (full overwrite) |
| `get-routines` | Paginated list of routines |
| `get-routine` | Single routine by ID |
| `create-routine` | Create a routine |
| `update-routine` | Update a routine (full overwrite) |
| `get-exercise-templates` | Paginated exercise templates |
| `get-exercise-template` | Single exercise template by ID |
| `create-exercise-template` | Create a custom exercise |
| `get-routine-folders` | Paginated routine folders |
| `get-routine-folder` | Single folder by ID |
| `create-routine-folder` | Create a routine folder |
| `get-exercise-history` | History for an exercise template (progress tracking) |
| `get-body-measurements` | Paginated body measurements |
| `get-body-measurement` | Body measurement by date |
| `create-body-measurement` | Create a body measurement entry |
| `update-body-measurement` | Update a body measurement (full overwrite) |
| `get-user-info` | Authenticated user info |

## Development

```bash
npm run dev        # run from source via tsx
npm run typecheck  # type-check without emitting
```

The upstream OpenAPI spec is vendored at `docs-openapi.json` (extracted from <https://api.hevyapp.com/docs/>).

## Notes

- The Hevy API is v0 ("use at your own risk" per Hevy's docs) — endpoints may change.
- `update-workout`, `update-routine`, and `update-body-measurement` overwrite the full record; fetch first, modify, then update.
