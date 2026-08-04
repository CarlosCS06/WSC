import { z } from "zod";

export const clubSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(2).max(6),
  associationId: z.string().min(1),

  reputation: z.number().min(1).max(100),
  attack: z.number().min(1).max(100),
  midfield: z.number().min(1).max(100),
  defence: z.number().min(1).max(100),

  budget: z.number().nonnegative(),
  stadiumId: z.string().optional(),
});

export const clubsSchema = z.array(clubSchema);

export type ClubInput = z.infer<typeof clubSchema>;