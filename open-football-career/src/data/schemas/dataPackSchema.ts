import { z } from 'zod'
import { clubSchema } from './clubSchema'
import { competitionSchema } from './competitionSchema'

export const dataPackSchema = z.object({
  name: z.string(),
  version: z.string(),
  clubs: z.array(clubSchema),
  competitions: z.array(competitionSchema),
})
