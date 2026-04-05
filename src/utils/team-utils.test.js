import { resolveTeamParticipants } from './team-utils'

const allParticipants = {
  'id-1': { id: 'id-1', name: 'Alice' },
  'id-2': { id: 'id-2', name: 'Bob' },
  'id-3': { id: 'id-3', name: 'Charlie' },
}

describe('resolveTeamParticipants', () => {
  it('returns resolved participant objects for valid team IDs', () => {
    const result = resolveTeamParticipants(['id-1', 'id-2'], allParticipants)
    expect(result).toEqual([
      { id: 'id-1', name: 'Alice' },
      { id: 'id-2', name: 'Bob' },
    ])
  })

  it('returns empty array when teamIds is null', () => {
    expect(resolveTeamParticipants(null, allParticipants)).toEqual([])
  })

  it('returns empty array when teamIds is undefined', () => {
    expect(resolveTeamParticipants(undefined, allParticipants)).toEqual([])
  })

  it('returns empty array when teamIds is not an array', () => {
    expect(resolveTeamParticipants('id-1', allParticipants)).toEqual([])
  })

  it('filters out IDs that do not exist in allParticipants', () => {
    const result = resolveTeamParticipants(['id-1', 'id-999'], allParticipants)
    expect(result).toEqual([{ id: 'id-1', name: 'Alice' }])
  })

  it('returns empty array when allParticipants is empty', () => {
    const result = resolveTeamParticipants(['id-1', 'id-2'], {})
    expect(result).toEqual([])
  })

  it('returns all participants when all IDs match', () => {
    const result = resolveTeamParticipants(['id-1', 'id-2', 'id-3'], allParticipants)
    expect(result).toHaveLength(3)
  })
})
