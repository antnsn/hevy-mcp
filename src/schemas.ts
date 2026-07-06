import { z } from "zod";

export const page = z
  .number()
  .int()
  .min(1)
  .optional()
  .describe("Page number (1 or greater, default 1)");

export const setType = z
  .enum(["warmup", "normal", "failure", "dropset"])
  .describe("The type of the set");

export const workoutSet = z.object({
  type: setType,
  weight_kg: z.number().nullable().optional().describe("Weight in kilograms"),
  reps: z.number().int().nullable().optional().describe("Number of repetitions"),
  distance_meters: z.number().int().nullable().optional().describe("Distance in meters"),
  duration_seconds: z.number().int().nullable().optional().describe("Duration in seconds"),
  custom_metric: z
    .number()
    .nullable()
    .optional()
    .describe("Custom metric (currently used for steps and floors)"),
  rpe: z
    .union([
      z.literal(6),
      z.literal(7),
      z.literal(7.5),
      z.literal(8),
      z.literal(8.5),
      z.literal(9),
      z.literal(9.5),
      z.literal(10),
    ])
    .nullable()
    .optional()
    .describe("Rating of Perceived Exertion: 6, 7, 7.5, 8, 8.5, 9, 9.5 or 10"),
});

export const workoutExercise = z.object({
  exercise_template_id: z
    .string()
    .describe("The ID of the exercise template (e.g. 'D04AC939')"),
  superset_id: z
    .number()
    .int()
    .nullable()
    .optional()
    .describe("Superset ID; exercises sharing an ID form a superset"),
  notes: z.string().nullable().optional().describe("Notes for the exercise"),
  sets: z.array(workoutSet).describe("The sets performed"),
});

export const workoutBody = {
  title: z.string().describe("The title of the workout"),
  description: z.string().nullable().optional().describe("A description for the workout"),
  start_time: z
    .string()
    .describe("ISO 8601 start time, e.g. '2024-08-14T12:00:00Z'"),
  end_time: z.string().describe("ISO 8601 end time, e.g. '2024-08-14T12:30:00Z'"),
  is_private: z.boolean().optional().describe("Whether the workout is private"),
  exercises: z.array(workoutExercise).describe("The exercises in the workout"),
};

export const routineSet = z.object({
  type: setType,
  weight_kg: z.number().nullable().optional().describe("Weight in kilograms"),
  reps: z.number().int().nullable().optional().describe("Number of repetitions"),
  distance_meters: z.number().int().nullable().optional().describe("Distance in meters"),
  duration_seconds: z.number().int().nullable().optional().describe("Duration in seconds"),
  custom_metric: z
    .number()
    .nullable()
    .optional()
    .describe("Custom metric (currently used for steps and floors)"),
  rep_range: z
    .object({
      start: z.number().nullable().describe("Starting rep count"),
      end: z.number().nullable().describe("Ending rep count"),
    })
    .nullable()
    .optional()
    .describe("Target rep range for the set, if applicable"),
});

export const routineExercise = z.object({
  exercise_template_id: z
    .string()
    .describe("The ID of the exercise template (e.g. 'D04AC939')"),
  superset_id: z
    .number()
    .int()
    .nullable()
    .optional()
    .describe("Superset ID; exercises sharing an ID form a superset"),
  rest_seconds: z.number().int().nullable().optional().describe("Rest time in seconds"),
  notes: z.string().nullable().optional().describe("Notes for the exercise"),
  sets: z.array(routineSet).describe("The planned sets"),
});

export const muscleGroup = z.enum([
  "abdominals",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "quadriceps",
  "hamstrings",
  "calves",
  "glutes",
  "abductors",
  "adductors",
  "lats",
  "upper_back",
  "traps",
  "lower_back",
  "chest",
  "cardio",
  "neck",
  "full_body",
  "other",
]);

export const exerciseType = z.enum([
  "weight_reps",
  "reps_only",
  "bodyweight_reps",
  "bodyweight_assisted_reps",
  "duration",
  "weight_duration",
  "distance_duration",
  "short_distance_weight",
]);

export const equipmentCategory = z.enum([
  "none",
  "barbell",
  "dumbbell",
  "kettlebell",
  "machine",
  "plate",
  "resistance_band",
  "suspension",
  "other",
]);

export const bodyMeasurementFields = {
  weight_kg: z.number().nullable().optional(),
  lean_mass_kg: z.number().nullable().optional(),
  fat_percent: z.number().nullable().optional(),
  neck_cm: z.number().nullable().optional(),
  shoulder_cm: z.number().nullable().optional(),
  chest_cm: z.number().nullable().optional(),
  left_bicep_cm: z.number().nullable().optional(),
  right_bicep_cm: z.number().nullable().optional(),
  left_forearm_cm: z.number().nullable().optional(),
  right_forearm_cm: z.number().nullable().optional(),
  abdomen: z.number().nullable().optional(),
  waist: z.number().nullable().optional(),
  hips: z.number().nullable().optional(),
  left_thigh: z.number().nullable().optional(),
  right_thigh: z.number().nullable().optional(),
  left_calf: z.number().nullable().optional(),
  right_calf: z.number().nullable().optional(),
};
