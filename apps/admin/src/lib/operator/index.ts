// `@/lib/operator` is a migration barrel. Re-export the existing
// `copilot-api` barrel so consumer imports continue to work during the
// incremental migration from legacy wrappers to operator helpers.
export * from './messaging';
export * from './documents';
export * from './esignatures';
export * from './inspections';
export * from './leases';
export * from './notifications';
export * from './read-only-data';
