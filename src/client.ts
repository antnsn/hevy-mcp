import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BASE_URL = "https://api.hevyapp.com";

let dotEnvLoaded = false;

// Loads .env from the project root (parent of src/ or dist/) so the key
// doesn't have to live in shell config. Existing env vars take precedence.
function loadDotEnv(): void {
  if (dotEnvLoaded) return;
  dotEnvLoaded = true;
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  let text: string;
  try {
    text = readFileSync(join(root, ".env"), "utf8");
  } catch {
    return;
  }
  for (const line of text.split("\n")) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, name, rawValue] = match;
    const value = rawValue.replace(/^(["'])(.*)\1$/, "$2");
    if (process.env[name] === undefined) process.env[name] = value;
  }
}

export class HevyApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
    method: string,
    path: string,
  ) {
    super(`Hevy API ${method} ${path} failed with ${status}: ${body}`);
    this.name = "HevyApiError";
  }
}

function apiKey(): string {
  loadDotEnv();
  const key = process.env.HEVY_API_KEY;
  if (!key) {
    throw new Error(
      "HEVY_API_KEY environment variable is not set. " +
        "Get your key at https://hevy.com/settings?developer (requires Hevy Pro).",
    );
  }
  return key;
}

export async function hevyRequest(
  method: "GET" | "POST" | "PUT",
  path: string,
  options: {
    query?: Record<string, string | number | undefined>;
    body?: unknown;
  } = {},
): Promise<unknown> {
  const url = new URL(path, BASE_URL);
  for (const [name, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) url.searchParams.set(name, String(value));
  }

  const response = await fetch(url, {
    method,
    headers: {
      "api-key": apiKey(),
      accept: "application/json",
      ...(options.body !== undefined
        ? { "content-type": "application/json" }
        : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new HevyApiError(response.status, text, method, path);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
