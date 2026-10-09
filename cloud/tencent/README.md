# Tencent CloudBase migration

GitHub Pages uses the CloudBase browser SDK with anonymous sessions. The old Cloudflare API is read-only.

## Provisioned on 2026-10-05

- Environment: `test-d0giyte5vc61eca7e`, Shanghai (`ap-shanghai`), document database.
- Personal plan expires 2026-11-05 23:59:59 China time; automatic renewal and overrun billing disabled.
- Collections: `study_progress`, `study_entries`; both ADMINONLY for direct client access.
- Event function: `shiguang-study-api`, Nodejs20.19, 128 MB, 15 seconds.
- Anonymous login enabled. Only this function permits anonymous authenticated invocation; wildcard denies others.
- Cloud health, browser progress writes and cloud exam conflict/archive/restore tests succeeded.
- Trial blocked adding the GitHub domain. The user upgraded one month of Personal; `niko-kang.github.io` is now allowed.
- Source snapshot: `backups/tencent-cutover-20261005/records.json`; migration preserves all source IDs, versions and timestamps.

## Build and verify

Run `npx tsc -p cloud/tencent/tsconfig.json`, `node cloud/tencent/test.mjs`, then `node cloud/tencent/build.mjs`.
Local deployment config is ignored; create it with the environment, functionRoot `cloud/tencent/.build`, and function settings above.

Before cutover, export all three old API datasets again and validate the snapshot with `node --experimental-strip-types cloud/tencent/prepare-import.mjs <backup>/records.json`.
The converter writes admin INSERT commands beside the private backup, retaining IDs, versions and timestamps; it does not execute them. Import only into empty target collections. Verify every field after import, not only counts. Freeze old writes briefly or reconcile a final export before switching to avoid lost updates.

After the website domain is allowed, test anonymous browser read/write, conflict handling, archive/restore and reload persistence. Remove only test-owned records. Set `VITE_DATA_PROVIDER=cloudbase`, `VITE_CLOUDBASE_ENV=test-d0giyte5vc61eca7e`, `VITE_CLOUDBASE_REGION=ap-shanghai` for the production build only after those checks pass. Keep the old backup and do not automatically fall back to the old writable backend.

The environment ID is public configuration. Never put administrator keys in frontend variables, source control or browser code. Verify mainland access separately; GitHub Pages availability is independent of the database region.

## Check-in release — 2026-10-09

The production `/api/timer` endpoint stores its ledger in
`study_entries/shared-study-timer`. Progress stays in `study_progress`.
Confirming timed or manual check-in saves the session and completes its task in
one CloudBase transaction. Already-completed progress rows are not rewritten.
Pausing/cancelling never completes a task. Optimistic versions reject stale
writes; deleted sessions remain recoverable.

The first day (2026-10-08) retains its existing completed record and legacy
progress view. No duration is invented for old progress, and no browser-only
test sessions are imported. Pre-release snapshots and verification output are
under ignored `backups/checkin-release-20261009/`.

Device labels are client-reported, not proof of identity or exact phone models.
IP and approximate region are requested from ipwho.is at start/manual check-in,
with a five-second timeout and graceful failure. The home page discloses this.
Metadata remains in the owner's database and is omitted from all public timer
responses. No precise geolocation is requested.

The separate shiguang-study-test project remains browser-only. Local preview
mode also uses isolated browser storage. Production builds must use the public
CloudBase environment configuration in `.env.production`.
