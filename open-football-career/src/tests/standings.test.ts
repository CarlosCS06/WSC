import { describe, it, expect } from 'vitest'
import { calculateStandings } from '../core/competition/calculateStandings'

describe('calculateStandings', () => {
  it('orders by points', () => {
    const results = [
      { clubId: 'a', points: 3, goalsFor: 2, goalsAgainst: 0 },
      { clubId: 'b', points: 1, goalsFor: 1, goalsAgainst: 1 },
    ]
    const standings = calculateStandings(results)
    expect(standings[0].clubId).toBe('a')
  })
})
