import * as migration_20260920_075920_initial from './20260920_075920_initial';
import * as migration_20260920_094829_content_collections from './20260920_094829_content_collections';
import * as migration_20260920_102259_pages_blocks from './20260920_102259_pages_blocks';

export const migrations = [
  {
    up: migration_20260920_075920_initial.up,
    down: migration_20260920_075920_initial.down,
    name: '20260920_075920_initial',
  },
  {
    up: migration_20260920_094829_content_collections.up,
    down: migration_20260920_094829_content_collections.down,
    name: '20260920_094829_content_collections',
  },
  {
    up: migration_20260920_102259_pages_blocks.up,
    down: migration_20260920_102259_pages_blocks.down,
    name: '20260920_102259_pages_blocks'
  },
];
