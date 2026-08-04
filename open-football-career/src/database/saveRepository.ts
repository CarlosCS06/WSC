import type { Club } from '../domain/club'
import { AppDatabase } from './database'

const db = new AppDatabase()

export async function saveClub(club: Club) {
  await db.table('clubs').put(club)
}
