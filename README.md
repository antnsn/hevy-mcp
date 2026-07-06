# hevy-mcp

MCP (Model Context Protocol) server for the [Hevy](https://hevy.com) workout tracker API.

Lets Claude (or any MCP client) read and write your Hevy data: workouts, routines, exercise templates, routine folders, exercise history, and body measurements.

**Requirements:** Node.js >= 18, a Hevy Pro account, and an API key from <https://hevy.com/settings?developer>.

## Usage

### `.mcp.json` (project-level, Claude Code)

A `.mcp.json` file in a project's root directory makes MCP servers available to everyone who runs Claude Code inside that project — check it into git and the whole team gets the server automatically.

Step by step:

1. Create a file named `.mcp.json` in the root of your project (same folder as `.git`), or run:

   ```bash
   claude mcp add hevy --scope project -- npx -y @antnsn/hevy-mcp
   ```

   which creates/updates it for you.
2. Make sure it contains:

   ```json
   {
     "mcpServers": {
       "hevy": {
         "command": "npx",
         "args": ["-y", "@antnsn/hevy-mcp"],
         "env": {
           "HEVY_API_KEY": "${HEVY_API_KEY}"
         }
       }
     }
   }
   ```

3. Provide the key. `${HEVY_API_KEY}` is expanded from your environment at launch, so the key never lives in the file (safe to commit). Export it in your shell profile or session:

   ```bash
   export HEVY_API_KEY=your-api-key
   ```

4. Start (or restart) `claude` inside the project. First use prompts you to approve the project's MCP servers; approve and the `hevy` tools are available. Verify with `/mcp`.

### Claude Code (global)

```bash
claude mcp add hevy -s user --env HEVY_API_KEY=your-api-key -- npx -y @antnsn/hevy-mcp
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hevy": {
      "command": "npx",
      "args": ["-y", "@antnsn/hevy-mcp"],
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

## Notes

- The Hevy API is v0 ("use at your own risk" per Hevy's docs) — endpoints may change.
- The API has **no delete endpoints**; anything created can only be deleted manually in the Hevy app.
- `update-workout`, `update-routine`, and `update-body-measurement` overwrite the full record; fetch first, modify, then update.

## Contributing

### From source

```bash
git clone https://github.com/antnsn/hevy-mcp.git
cd hevy-mcp
npm install
npm run build
```

When running from a clone, the key can also live in a `.env` file in the project root (gitignored) instead of the environment:

```bash
echo 'HEVY_API_KEY=your-api-key' > .env
chmod 600 .env
```

The repo's `.mcp.json` then picks the server up automatically when running `claude` inside the repo. Note: the `.env` file only works for clones — the npm-installed package looks for it next to its own install location, so use the `env` config shown above instead.

### Development

```bash
npm run dev        # run from source via tsx
npm run typecheck  # type-check without emitting
```

Test interactively with the MCP Inspector (pass the key explicitly — the Inspector does not inherit your shell environment):

```bash
npx @modelcontextprotocol/inspector -e HEVY_API_KEY=$HEVY_API_KEY node dist/index.js
```

The upstream OpenAPI spec is vendored at `docs-openapi.json`, extracted from the Swagger UI at <https://api.hevyapp.com/docs/> (the spec is embedded in `swagger-ui-init.js`; there is no standalone spec URL).

Issues and PRs welcome at <https://github.com/antnsn/hevy-mcp>.
