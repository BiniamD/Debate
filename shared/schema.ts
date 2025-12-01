import { z } from "zod";

export const perspectiveSchema = z.object({
  title: z.string(),
  argument: z.string(),
  keyPoints: z.array(z.string()),
});

export const debateResponseSchema = z.object({
  bull: perspectiveSchema,
  bear: perspectiveSchema,
  neutral: perspectiveSchema,
});

export const debateRequestSchema = z.object({
  symbol: z.string().min(1).max(10),
  context: z.string().optional(),
});

export type Perspective = z.infer<typeof perspectiveSchema>;
export type DebateResponse = z.infer<typeof debateResponseSchema>;
export type DebateRequest = z.infer<typeof debateRequestSchema>;
