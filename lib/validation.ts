import { z } from "zod"

export const figmaConnectSchema = z.object({
  figmaUrl: z
    .string()
    .min(1, "Figma URL is required")
    .regex(/\/(?:file|design)\/([a-zA-Z0-9_-]+)/, "Invalid Figma URL format"),
  accessToken: z
    .string()
    .min(1, "Access token is required")
    .regex(/^figd_/, "Invalid Figma access token format"),
  projectName: z.string().optional(),
})

export const figmaAnalyzeSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  analysisType: z.enum(["full", "components", "colors", "typography"]).optional().default("full"),
})

export const exportSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  exportType: z.enum(["pdf", "html", "markdown", "presentation"]),
  options: z
    .object({
      includeImages: z.boolean().optional().default(true),
      includeColors: z.boolean().optional().default(true),
      includeTypography: z.boolean().optional().default(true),
      includeComponents: z.boolean().optional().default(true),
    })
    .optional(),
})
