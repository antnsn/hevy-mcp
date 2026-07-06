#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { HevyApiError, hevyRequest } from "./client.js";
import {
  bodyMeasurementFields,
  equipmentCategory,
  exerciseType,
  muscleGroup,
  page,
  routineExercise,
  workoutBody,
} from "./schemas.js";

const server = new McpServer({
  name: "hevy-mcp",
  version: "0.1.0",
});

type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

function ok(data: unknown): ToolResult {
  return {
    content: [
      {
        type: "text",
        text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
      },
    ],
  };
}

function fail(error: unknown): ToolResult {
  const message =
    error instanceof HevyApiError || error instanceof Error
      ? error.message
      : String(error);
  return { content: [{ type: "text", text: message }], isError: true };
}

async function call(
  fn: () => Promise<unknown>,
): Promise<ToolResult> {
  try {
    return ok(await fn());
  } catch (error) {
    return fail(error);
  }
}

// ---------- Workouts ----------

server.registerTool(
  "get-workouts",
  {
    title: "Get workouts",
    description: "Get a paginated list of workouts (most recent first).",
    inputSchema: {
      page,
      pageSize: z.number().int().min(1).max(10).optional()
        .describe("Items per page (max 10, default 5)"),
    },
  },
  async ({ page, pageSize }) =>
    call(() => hevyRequest("GET", "/v1/workouts", { query: { page, pageSize } })),
);

server.registerTool(
  "get-workout",
  {
    title: "Get workout",
    description: "Get a single workout's complete details by its ID.",
    inputSchema: {
      workoutId: z.string().describe("The workout ID"),
    },
  },
  async ({ workoutId }) =>
    call(() => hevyRequest("GET", `/v1/workouts/${encodeURIComponent(workoutId)}`)),
);

server.registerTool(
  "get-workout-count",
  {
    title: "Get workout count",
    description: "Get the total number of workouts on the account.",
    inputSchema: {},
  },
  async () => call(() => hevyRequest("GET", "/v1/workouts/count")),
);

server.registerTool(
  "get-workout-events",
  {
    title: "Get workout events",
    description:
      "Get a paged list of workout events (updates or deletes) since a given date. " +
      "Useful for syncing workout changes.",
    inputSchema: {
      page,
      pageSize: z.number().int().min(1).max(10).optional()
        .describe("Items per page (max 10, default 5)"),
      since: z.string().optional()
        .describe("ISO 8601 date-time, e.g. '2024-01-01T00:00:00Z' (default 1970-01-01T00:00:00Z)"),
    },
  },
  async ({ page, pageSize, since }) =>
    call(() =>
      hevyRequest("GET", "/v1/workouts/events", { query: { page, pageSize, since } }),
    ),
);

server.registerTool(
  "create-workout",
  {
    title: "Create workout",
    description: "Log a new (completed) workout with exercises and sets.",
    inputSchema: workoutBody,
  },
  async (workout) =>
    call(() => hevyRequest("POST", "/v1/workouts", { body: { workout } })),
);

server.registerTool(
  "update-workout",
  {
    title: "Update workout",
    description: "Update an existing workout by ID. The full workout is overwritten.",
    inputSchema: {
      workoutId: z.string().describe("The ID of the workout to update"),
      ...workoutBody,
    },
  },
  async ({ workoutId, ...workout }) =>
    call(() =>
      hevyRequest("PUT", `/v1/workouts/${encodeURIComponent(workoutId)}`, {
        body: { workout },
      }),
    ),
);

// ---------- Routines ----------

server.registerTool(
  "get-routines",
  {
    title: "Get routines",
    description: "Get a paginated list of routines.",
    inputSchema: {
      page,
      pageSize: z.number().int().min(1).max(10).optional()
        .describe("Items per page (max 10, default 5)"),
    },
  },
  async ({ page, pageSize }) =>
    call(() => hevyRequest("GET", "/v1/routines", { query: { page, pageSize } })),
);

server.registerTool(
  "get-routine",
  {
    title: "Get routine",
    description: "Get a routine by its ID.",
    inputSchema: {
      routineId: z.string().describe("The routine ID"),
    },
  },
  async ({ routineId }) =>
    call(() => hevyRequest("GET", `/v1/routines/${encodeURIComponent(routineId)}`)),
);

server.registerTool(
  "create-routine",
  {
    title: "Create routine",
    description: "Create a new workout routine (a plan, not a logged workout).",
    inputSchema: {
      title: z.string().describe("The title of the routine"),
      folder_id: z.number().nullable().optional()
        .describe("Folder ID to add the routine to; omit or null for default 'My Routines'"),
      notes: z.string().optional().describe("Additional notes for the routine"),
      exercises: z.array(routineExercise).describe("The exercises in the routine"),
    },
  },
  async (routine) =>
    call(() => hevyRequest("POST", "/v1/routines", { body: { routine } })),
);

server.registerTool(
  "update-routine",
  {
    title: "Update routine",
    description: "Update an existing routine by ID. The full routine is overwritten.",
    inputSchema: {
      routineId: z.string().describe("The ID of the routine to update"),
      title: z.string().describe("The title of the routine"),
      notes: z.string().nullable().optional()
        .describe("Additional notes for the routine; null clears them"),
      exercises: z.array(routineExercise).describe("The exercises in the routine"),
    },
  },
  async ({ routineId, ...routine }) =>
    call(() =>
      hevyRequest("PUT", `/v1/routines/${encodeURIComponent(routineId)}`, {
        body: { routine },
      }),
    ),
);

// ---------- Exercise templates ----------

server.registerTool(
  "get-exercise-templates",
  {
    title: "Get exercise templates",
    description:
      "Get a paginated list of exercise templates (built-in and custom) available on the account.",
    inputSchema: {
      page,
      pageSize: z.number().int().min(1).max(100).optional()
        .describe("Items per page (max 100, default 5)"),
    },
  },
  async ({ page, pageSize }) =>
    call(() =>
      hevyRequest("GET", "/v1/exercise_templates", { query: { page, pageSize } }),
    ),
);

server.registerTool(
  "get-exercise-template",
  {
    title: "Get exercise template",
    description: "Get a single exercise template by ID.",
    inputSchema: {
      exerciseTemplateId: z.string().describe("The exercise template ID"),
    },
  },
  async ({ exerciseTemplateId }) =>
    call(() =>
      hevyRequest(
        "GET",
        `/v1/exercise_templates/${encodeURIComponent(exerciseTemplateId)}`,
      ),
    ),
);

server.registerTool(
  "create-exercise-template",
  {
    title: "Create custom exercise template",
    description: "Create a new custom exercise template.",
    inputSchema: {
      title: z.string().describe("The title of the exercise, e.g. 'Bench Press'"),
      exercise_type: exerciseType.describe("How the exercise is measured"),
      equipment_category: equipmentCategory.describe("The equipment used"),
      muscle_group: muscleGroup.describe("The primary muscle group"),
      other_muscles: z.array(muscleGroup).optional()
        .describe("Secondary muscle groups"),
    },
  },
  async (exercise) =>
    call(() => hevyRequest("POST", "/v1/exercise_templates", { body: { exercise } })),
);

// ---------- Routine folders ----------

server.registerTool(
  "get-routine-folders",
  {
    title: "Get routine folders",
    description: "Get a paginated list of routine folders on the account.",
    inputSchema: {
      page,
      pageSize: z.number().int().min(1).max(10).optional()
        .describe("Items per page (max 10, default 5)"),
    },
  },
  async ({ page, pageSize }) =>
    call(() =>
      hevyRequest("GET", "/v1/routine_folders", { query: { page, pageSize } }),
    ),
);

server.registerTool(
  "get-routine-folder",
  {
    title: "Get routine folder",
    description: "Get a single routine folder by ID.",
    inputSchema: {
      folderId: z.number().int().describe("The routine folder ID"),
    },
  },
  async ({ folderId }) =>
    call(() => hevyRequest("GET", `/v1/routine_folders/${folderId}`)),
);

server.registerTool(
  "create-routine-folder",
  {
    title: "Create routine folder",
    description:
      "Create a new routine folder. The folder is created at index 0 and all other folders shift down.",
    inputSchema: {
      title: z.string().describe("The title of the routine folder"),
    },
  },
  async ({ title }) =>
    call(() =>
      hevyRequest("POST", "/v1/routine_folders", {
        body: { routine_folder: { title } },
      }),
    ),
);

// ---------- Exercise history ----------

server.registerTool(
  "get-exercise-history",
  {
    title: "Get exercise history",
    description:
      "Get logged history for a specific exercise template, optionally filtered by date range. " +
      "Useful for progress tracking (weights, reps over time).",
    inputSchema: {
      exerciseTemplateId: z.string().describe("The exercise template ID"),
      start_date: z.string().optional()
        .describe("Optional ISO 8601 start date, e.g. '2024-01-01T00:00:00Z'"),
      end_date: z.string().optional()
        .describe("Optional ISO 8601 end date, e.g. '2024-12-31T23:59:59Z'"),
    },
  },
  async ({ exerciseTemplateId, start_date, end_date }) =>
    call(() =>
      hevyRequest(
        "GET",
        `/v1/exercise_history/${encodeURIComponent(exerciseTemplateId)}`,
        { query: { start_date, end_date } },
      ),
    ),
);

// ---------- Body measurements ----------

server.registerTool(
  "get-body-measurements",
  {
    title: "Get body measurements",
    description: "Get a paginated list of body measurements (weight, body fat, girths).",
    inputSchema: {
      page,
      pageSize: z.number().int().min(1).max(10).optional()
        .describe("Items per page (max 10, default 10)"),
    },
  },
  async ({ page, pageSize }) =>
    call(() =>
      hevyRequest("GET", "/v1/body_measurements", { query: { page, pageSize } }),
    ),
);

server.registerTool(
  "get-body-measurement",
  {
    title: "Get body measurement by date",
    description: "Get a single body measurement entry by date.",
    inputSchema: {
      date: z.string().describe("The date, format YYYY-MM-DD"),
    },
  },
  async ({ date }) =>
    call(() =>
      hevyRequest("GET", `/v1/body_measurements/${encodeURIComponent(date)}`),
    ),
);

server.registerTool(
  "create-body-measurement",
  {
    title: "Create body measurement",
    description:
      "Create a body measurement entry for a given date (all measurement fields optional; " +
      "weights/masses in kg, girths in cm). Fails with 409 if an entry already exists for that date.",
    inputSchema: {
      date: z.string().describe("The date, format YYYY-MM-DD"),
      ...bodyMeasurementFields,
    },
  },
  async (measurement) =>
    call(() => hevyRequest("POST", "/v1/body_measurements", { body: measurement })),
);

server.registerTool(
  "update-body-measurement",
  {
    title: "Update body measurement",
    description:
      "Update an existing body measurement entry for a date. All fields are overwritten — " +
      "omitted fields are cleared.",
    inputSchema: {
      date: z.string().describe("The date of the entry to update, format YYYY-MM-DD"),
      ...bodyMeasurementFields,
    },
  },
  async ({ date, ...measurement }) =>
    call(() =>
      hevyRequest("PUT", `/v1/body_measurements/${encodeURIComponent(date)}`, {
        body: measurement,
      }),
    ),
);

// ---------- User ----------

server.registerTool(
  "get-user-info",
  {
    title: "Get user info",
    description: "Get info about the authenticated Hevy user.",
    inputSchema: {},
  },
  async () => call(() => hevyRequest("GET", "/v1/user/info")),
);

// ---------- Startup ----------

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("hevy-mcp server running on stdio");
