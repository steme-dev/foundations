/**
 * Creates or updates the library's dashboard in PostHog, "Foundations — the library": how a visit
 * becomes a vote and a shared grid, what is used, where votes come from, what readers search and
 * filter. Its insights are written here as data; the ids PostHog gave them are kept in
 * posthog.json, so a run updates them in place rather than creating them twice.
 *
 * It calls PostHog through `posthog-cli api` (signed in on the machine; no key in the repository).
 * Every insight reads only this site's events (`site` = foundations, set by the worker), which share
 * a PostHog project with steme's decks.
 *
 *   node scripts/posthog-dashboard.mjs          create or update everything
 *   node scripts/posthog-dashboard.mjs --dry    print what would be sent
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const STATE = join(ROOT, "posthog.json");
const DASHBOARD = "Foundations — the library";
const SITE = [{ key: "site", type: "event", value: "foundations", operator: "exact" }];
const WHERE = "properties.site = 'foundations' AND timestamp > now() - INTERVAL 90 DAY";

const cli = (tool, payload) => {
  const out = spawnSync("posthog-cli", ["api", "call", "--json", tool, JSON.stringify(payload)], {
    encoding: "utf8",
  });
  if (out.status !== 0)
    throw new Error(`posthog-cli ${tool}: ${(out.stderr || out.stdout).trim()}`);
  const data = JSON.parse(out.stdout);
  return data.result ?? data;
};

const step = (event, name, properties = []) => ({
  kind: "EventsNode",
  event,
  custom_name: name,
  properties,
});
const sql = (query) => ({ kind: "DataVisualizationNode", source: { kind: "HogQLQuery", query } });

const INSIGHTS = {
  journey: [
    "From a visit to a shared grid",
    "The way in, step by step, within a week: a page seen, the sign-in asked or started, signed in, a first practice said used, one's own grid opened, its link copied. Cookieless visits; only this site's events.",
    {
      kind: "InsightVizNode",
      source: {
        kind: "FunnelsQuery",
        series: [
          step("$pageview", "A page seen"),
          step("sign_in_started", "Sign-in started"),
          step("signed_in", "Signed in"),
          step("vote", "A practice said used", [
            { key: "on", type: "event", value: true, operator: "exact" },
          ]),
          step("grid_viewed", "Their grid opened", [
            { key: "own", type: "event", value: true, operator: "exact" },
          ]),
          step("share_copied", "Its link copied"),
        ],
        properties: SITE,
        dateRange: { date_from: "-30d" },
        funnelsFilter: {
          funnelOrderType: "ordered",
          funnelVizType: "steps",
          funnelWindowInterval: 7,
          funnelWindowIntervalUnit: "day",
          layout: "vertical",
        },
        filterTestAccounts: false,
      },
    },
  ],
  activity: [
    "Visits and votes, day by day",
    "Pages seen, practices said used, and sign-ins, per day over the last month.",
    {
      kind: "InsightVizNode",
      source: {
        kind: "TrendsQuery",
        series: [
          step("$pageview", "Pages seen"),
          step("vote", "Practices said used", [
            { key: "on", type: "event", value: true, operator: "exact" },
          ]),
          step("signed_in", "Sign-ins"),
        ],
        properties: SITE,
        interval: "day",
        dateRange: { date_from: "-30d" },
        filterTestAccounts: false,
      },
    },
  ],
  practices: [
    "What readers say they use",
    "Per practice: how many times it was said used and withdrawn, from this site's vote events (the database holds the standing count).",
    sql(`SELECT
  properties.practice AS practice,
  countIf(properties.on = true) AS said_used,
  countIf(properties.on = false) AS withdrawn,
  said_used - withdrawn AS net
FROM events
WHERE event = 'vote' AND ${WHERE}
GROUP BY practice
ORDER BY net DESC`),
  ],
  where: [
    "Where votes come from",
    "The page a practice was said used from: the library's home, or the practice's own page; and whether it waited for a sign-in.",
    sql(`SELECT
  properties.where AS page,
  if(properties.after_sign_in = true, 'after signing in', 'signed in already') AS how,
  count() AS votes
FROM events
WHERE event = 'vote' AND properties.on = true AND ${WHERE}
GROUP BY page, how
ORDER BY votes DESC`),
  ],
  steps: [
    "The way in, used",
    "Clicks on the home's three steps, the sign-in dialog shown, and 'Propose a practice' pressed.",
    sql(`SELECT
  multiIf(event = 'journey_step', concat('step ', toString(properties.step)), event = 'start_dialog_shown', 'sign-in dialog shown', event = 'propose_clicked', concat('propose (', toString(properties.from), ')'), event) AS what,
  count() AS times
FROM events
WHERE event IN ('journey_step', 'start_dialog_shown', 'propose_clicked') AND ${WHERE}
GROUP BY what
ORDER BY times DESC`),
  ],
  finding: [
    "Searching and filtering",
    "How readers narrow the library: searches made (their length only, never their words), and the cell, category or order chosen.",
    sql(`SELECT
  multiIf(event = 'search_used', 'search', notEmpty(toString(properties.sort)), concat('sort: ', toString(properties.sort)), notEmpty(toString(properties.cell)), concat('cell: ', toString(properties.cell)), notEmpty(toString(properties.category)), concat('category: ', toString(properties.category)), 'filters cleared') AS what,
  count() AS times
FROM events
WHERE event IN ('search_used', 'filter_used') AND ${WHERE}
GROUP BY what
ORDER BY times DESC`),
  ],
  languages: [
    "Pages seen, by language",
    "Pages seen in English and in French, and whether the reader came from a shared grid or elsewhere.",
    sql(`SELECT
  properties.lang AS lang,
  if(match(properties.$pathname, '^(/fr)?/u/'), 'a grid', 'the library') AS page,
  count() AS pages_seen
FROM events
WHERE event = '$pageview' AND ${WHERE}
GROUP BY lang, page
ORDER BY pages_seen DESC`),
  ],
};

const dry = process.argv.includes("--dry");
const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : {};
if (dry) {
  for (const [key, [name]] of Object.entries(INSIGHTS)) console.log(`${key}: ${name}`);
  process.exit(0);
}
state.dashboard ??= cli("dashboard-create", {
  name: DASHBOARD,
  description:
    "foundations.steme.dev: how a visit becomes a vote and a shared grid. Built by scripts/posthog-dashboard.mjs in steme-dev/foundations.",
}).id;
for (const [key, [name, description, query]] of Object.entries(INSIGHTS)) {
  const payload = { name, description, query, dashboards: [state.dashboard] };
  if (key in state) {
    cli("insight-update", { id: state[key], ...payload });
    console.log(`updated ${key}: ${name} (${state[key]})`);
  } else {
    state[key] = cli("insight-create", payload).short_id;
    console.log(`created ${key}: ${name} (${state[key]})`);
  }
  writeFileSync(STATE, `${JSON.stringify(state, null, 2)}\n`);
}
