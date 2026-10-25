/**
 * Fetches current and past GitHub Sponsors and writes src/data/sponsors.json.
 *
 * Usage:
 *   SPONSORS_TOKEN=<token> bun run scripts/sync-sponsors.ts
 *
 * Env:
 *   SPONSORS_TOKEN   PAT of a maintainer of the sponsorable accounts (read:org + read:user).
 *                    Without it the existing file is left untouched.
 *   SPONSORS_LOGINS  comma separated sponsorable users/orgs (default: Steel-Foundation,4lve)
 *
 * Only public sponsorships are listed (includePrivate: false).
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/data/sponsors.json",
);
const token = process.env.SPONSORS_TOKEN;
const logins = (process.env.SPONSORS_LOGINS ?? "Steel-Foundation,4lve")
  .split(",")
  .map((l) => l.trim())
  .filter(Boolean);

if (!token) {
  console.warn("SPONSORS_TOKEN not set, keeping existing sponsors.json");
  process.exit(0);
}

const QUERY = `
query($login: String!, $after: String) {
  repositoryOwner(login: $login) {
    ... on Sponsorable {
      sponsorshipsAsMaintainer(first: 100, after: $after, includePrivate: false, activeOnly: false) {
        pageInfo { hasNextPage endCursor }
        nodes {
          createdAt
          isActive
          isOneTimePayment
          sponsorEntity {
            ... on User { login name avatarUrl url }
            ... on Organization { login name avatarUrl url }
          }
        }
      }
    }
  }
}`;

interface Sponsor {
  login: string;
  name: string;
  avatarUrl: string;
  url: string;
  active: boolean;
  since: string;
}

async function gql(variables: Record<string, unknown>) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: QUERY, variables }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as any;
  if (json.errors?.length) {
    throw new Error(json.errors.map((e: any) => e.message).join("; "));
  }
  return json.data;
}

async function fetchLogin(login: string): Promise<Sponsor[]> {
  const out: Sponsor[] = [];
  let after: string | null = null;
  do {
    const data = await gql({ login, after });
    const conn = data.repositoryOwner?.sponsorshipsAsMaintainer;
    if (!conn) throw new Error(`${login} is not sponsorable`);
    for (const n of conn.nodes) {
      const e = n.sponsorEntity;
      if (!e?.login) continue; // private / deleted sponsor
      out.push({
        login: e.login,
        name: e.name || e.login,
        avatarUrl: e.avatarUrl,
        url: e.url,
        active: n.isActive,
        since: n.createdAt,
      });
    }
    after = conn.pageInfo.hasNextPage ? conn.pageInfo.endCursor : null;
  } while (after);
  return out;
}

const byLogin = new Map<string, Sponsor>();
let failed = 0;
for (const login of logins) {
  try {
    for (const s of await fetchLogin(login)) {
      const prev = byLogin.get(s.login);
      // sponsor of several accounts / re-subscribed: active wins, earliest start kept
      byLogin.set(s.login, {
        ...(prev?.active && !s.active ? prev : s),
        active: !!prev?.active || s.active,
        since: prev && prev.since < s.since ? prev.since : s.since,
      });
    }
  } catch (err) {
    failed++;
    console.warn(`Skipping ${login}: ${(err as Error).message}`);
  }
}
if (failed === logins.length) {
  console.error("All sponsor lookups failed");
  process.exit(1);
}

const sponsors = [...byLogin.values()].sort(
  (a, b) => Number(b.active) - Number(a.active) || a.since.localeCompare(b.since),
);

await mkdir(dirname(OUT), { recursive: true });
await writeFile(
  OUT,
  JSON.stringify({ updatedAt: new Date().toISOString(), sponsors }, null, 2) + "\n",
);
console.log(
  `Wrote ${sponsors.length} sponsors (${sponsors.filter((s) => s.active).length} active)`,
);
