import { describe, it, expect } from 'vitest'
import { simulateMatch } from '../core/match/simulateMatch'

describe('simulateMatch', () => {
  it('returns match result', () => {
    const result = simulateMatch(1, 2)
    expect(result.homeGoals).toBeGreaterThanOrEqual(1)
    expect(result.awayGoals).toBeGreaterThanOrEqual(2)
  })
})
