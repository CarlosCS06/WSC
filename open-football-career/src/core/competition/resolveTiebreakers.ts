import type { Standing } from '../../domain/standings'

export function resolveTiebreakers(results: Standing[]) {
  return results.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    return b.goalsFor - a.goalsFor
  })
}
