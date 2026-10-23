import fc from "fast-check";

/**
 * Shared options for the property-based suites (TESTING.md section 8.1).
 *
 * The seed is printed by `fast-check` when a property fails. To replay a
 * failure, run the suite with the same seed:
 *
 * ```bash
 * FC_SEED=123456 FC_NUM_RUNS=500 npx vitest run tests/property
 * ```
 */
const seed = process.env.FC_SEED ? Number(process.env.FC_SEED) : undefined;
const numRuns = process.env.FC_NUM_RUNS ? Number(process.env.FC_NUM_RUNS) : 100;

export const fcOptions = {
  numRuns,
  ...(seed !== undefined ? { seed } : {}),
};

export { fc };
