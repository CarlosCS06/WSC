import Dexie from 'dexie'

export class AppDatabase extends Dexie {
  constructor() {
    super('OpenFootballCareerDB')
    this.version(1).stores({
      clubs: 'id',
      competitions: 'id',
    })
  }
}
