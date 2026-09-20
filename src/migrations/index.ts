import * as migration_20260920_075920_initial from './20260920_075920_initial';
import * as migration_20260920_094829_content_collections from './20260920_094829_content_collections';

export const migrations = [
  {
    up: migration_20260920_075920_initial.up,
    down: migration_20260920_075920_initial.down,
    name: '20260920_075920_initial',
  },
  {
    up: migration_20260920_094829_content_collections.up,
    down: migration_20260920_094829_content_collections.down,
    name: '20260920_094829_content_collections'
  },
];
