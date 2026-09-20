import * as migration_20260920_075920_initial from './20260920_075920_initial';

export const migrations = [
  {
    up: migration_20260920_075920_initial.up,
    down: migration_20260920_075920_initial.down,
    name: '20260920_075920_initial'
  },
];
