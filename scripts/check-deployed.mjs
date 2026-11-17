/**
 * Checks the site answers once deployed: the home holds the library, a practice's page is served, the
 * worker counts the votes and refuses a signed-out vote. Retries for a minute while the deploy settles.
 *
 *   node scripts/check-deployed.mjs https://foundations.steme.dev
 */
const base = process.argv[2];
if (base === undefined) {
  console.error("usage: node scripts/check-deployed.mjs <origin>");
  process.exit(2);
}

const checks = [
  [
    "the home holds the library",
    async () =>
      (await fetch(`${base}/`)).ok &&
      (await (await fetch(`${base}/`)).text()).includes("shoulders of giants"),
  ],
  ["a practice's page is served", async () => (await fetch(`${base}/practices/ratchet`)).ok],
  [
    "the worker counts the votes",
    async () => {
      const response = await fetch(`${base}/api/counts`);
      return response.ok && typeof (await response.json()) === "object";
    },
  ],
  [
    "a signed-out vote is refused",
    async () => {
      const response = await fetch(`${base}/api/votes/ratchet`, {
        method: "PUT",
        headers: { Origin: base },
      });
      return response.status === 401;
    },
  ],
];

let failed = [];
for (let attempt = 1; attempt <= 6; attempt++) {
  failed = [];
  for (const [name, check] of checks) if (!(await check().catch(() => false))) failed.push(name);
  if (failed.length === 0) break;
  await new Promise((resolve) => setTimeout(resolve, 10_000));
}
for (const [name] of checks) console.log(`${failed.includes(name) ? "✗" : "✓"} ${name}`);
process.exit(failed.length === 0 ? 0 : 1);
