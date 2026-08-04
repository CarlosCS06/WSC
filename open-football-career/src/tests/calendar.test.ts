import { describe, it, expect } from 'vitest'
import { generateRoundRobin } from '../core/calendar/generateRoundRobin'

describe('generateRoundRobin', () => {
  it('creates rounds', () => {
    const teams = ['A', 'B', 'C', 'D']
    const rounds = generateRoundRobin(teams)
    expect(rounds.length).toBe(3)
  })
})
