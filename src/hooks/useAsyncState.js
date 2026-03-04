import { useCallback, useState } from 'react';

/**
 * useAsyncState — models async data arrival via a real Promise lifecycle.
 *
 * STATES
 *   'idle'     — initial, no run() called yet
 *   'pending'  — promise in flight; value is STABLE (last resolved value)
 *   'resolved' — promise settled; value is the new resolved data
 *
 * WHY VALUE IS STABLE DURING PENDING
 *   If we cleared value on run(), the UI would flash to empty/null
 *   while waiting. Instead, the last good value persists — the table
 *   stays populated, the pending-bar signals something is happening,
 *   and the new value snaps in atomically on resolve. No flicker.
 *
 * DELTA TRACKING (caller responsibility, see MetabolismPage)
 *   status → 'pending':  caller snapshots conditions as `prev`
 *                         (conditions is still the OLD value here)
 *   status → 'resolved': caller increments animKey, triggering
 *                         CSS animation retrigger on changed rows
 *   This separation keeps useAsyncState a pure Promise wrapper —
 *   it knows nothing about delta, tables, or animation.
 *
 * USAGE
 *   const [{ status, value }, run] = useAsyncState(initialValue);
 *
 *   // Real fetch:
 *   run(fetch('/api/data').then(r => r.json()));
 *
 *   // Simulated async (demo / fake latency):
 *   run(new Promise(r => setTimeout(() => r(nextValue), 400)));
 *
 *   // Parallel:
 *   run(Promise.all([fetchA(), fetchB()]).then(([a, b]) => merge(a, b)));
 *
 * ERROR HANDLING
 *   Rejection falls back to the last stable value (status → 'resolved',
 *   value unchanged). The UI never breaks on a failed fetch — it just
 *   stays at the previous state silently. Add explicit error state if
 *   the application requires user-visible error messages.
 */
export function useAsyncState(initialValue) {
  const [state, setState] = useState({ status: 'idle', value: initialValue });

  const run = useCallback((promise) => {
    // Immediately enter pending — value preserved from previous state
    setState(s => ({ status: 'pending', value: s.value }));

    Promise.resolve(promise).then(
      // Success: resolve to the new value
      value => setState({ status: 'resolved', value }),
      // Failure: resolve to the last stable value (silent fallback)
      ()    => setState(s => ({ status: 'resolved', value: s.value })),
    );
  }, []);

  return [state, run];
}
