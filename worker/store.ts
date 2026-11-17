/** What the worker keeps: who signed in, and which practices each one says they use. */
export type User = {
  readonly githubId: number;
  readonly login: string;
  readonly avatarUrl: string | null;
};

export interface Store {
  /** Records a GitHub user, or updates their login and avatar; a login another id held is freed. */
  upsertUser(user: User, now: string): Promise<void>;
  userByLogin(login: string): Promise<User | null>;
  votesOf(githubId: number): Promise<string[]>;
  addVote(githubId: number, practice: string, now: string): Promise<void>;
  removeVote(githubId: number, practice: string): Promise<void>;
  /** How many people use each practice that anyone uses. */
  counts(): Promise<Record<string, number>>;
  /** Forgets a user and every vote of theirs. */
  deleteUser(githubId: number): Promise<void>;
}

/** The store on Cloudflare D1, the schema of `migrations/`. */
export function d1Store(db: D1Database): Store {
  return {
    async upsertUser({ githubId, login, avatarUrl }, now) {
      await db.batch([
        db
          .prepare(
            "UPDATE users SET login = login || '~' || github_id WHERE login = ? AND github_id != ?",
          )
          .bind(login, githubId),
        db
          .prepare(
            "INSERT INTO users (github_id, login, avatar_url, created_at) VALUES (?, ?, ?, ?) " +
              "ON CONFLICT (github_id) DO UPDATE SET login = excluded.login, avatar_url = excluded.avatar_url",
          )
          .bind(githubId, login, avatarUrl, now),
      ]);
    },
    async userByLogin(login) {
      const row = await db
        .prepare("SELECT github_id, login, avatar_url FROM users WHERE login = ?")
        .bind(login)
        .first<{ github_id: number; login: string; avatar_url: string | null }>();
      return row === null
        ? null
        : { githubId: row.github_id, login: row.login, avatarUrl: row.avatar_url };
    },
    async votesOf(githubId) {
      const { results } = await db
        .prepare("SELECT practice FROM votes WHERE github_id = ? ORDER BY created_at")
        .bind(githubId)
        .all<{ practice: string }>();
      return results.map((row) => row.practice);
    },
    async addVote(githubId, practice, now) {
      await db
        .prepare("INSERT OR IGNORE INTO votes (github_id, practice, created_at) VALUES (?, ?, ?)")
        .bind(githubId, practice, now)
        .run();
    },
    async removeVote(githubId, practice) {
      await db
        .prepare("DELETE FROM votes WHERE github_id = ? AND practice = ?")
        .bind(githubId, practice)
        .run();
    },
    async counts() {
      const { results } = await db
        .prepare("SELECT practice, COUNT(*) AS n FROM votes GROUP BY practice")
        .all<{ practice: string; n: number }>();
      return Object.fromEntries(results.map((row) => [row.practice, row.n]));
    },
    async deleteUser(githubId) {
      await db.batch([
        db.prepare("DELETE FROM votes WHERE github_id = ?").bind(githubId),
        db.prepare("DELETE FROM users WHERE github_id = ?").bind(githubId),
      ]);
    },
  };
}

/** The same store in memory, for the tests. */
export function memoryStore(): Store {
  const users = new Map<number, User>();
  const votes = new Map<number, Map<string, string>>();
  return {
    async upsertUser(user) {
      for (const [id, other] of users)
        if (other.login === user.login && id !== user.githubId)
          users.set(id, { ...other, login: `${other.login}~${id}` });
      users.set(user.githubId, user);
    },
    async userByLogin(login) {
      return [...users.values()].find((user) => user.login === login) ?? null;
    },
    async votesOf(githubId) {
      return [...(votes.get(githubId)?.keys() ?? [])];
    },
    async addVote(githubId, practice, now) {
      const mine = votes.get(githubId) ?? new Map<string, string>();
      if (!mine.has(practice)) mine.set(practice, now);
      votes.set(githubId, mine);
    },
    async removeVote(githubId, practice) {
      votes.get(githubId)?.delete(practice);
    },
    async counts() {
      const counts: Record<string, number> = {};
      for (const mine of votes.values())
        for (const practice of mine.keys()) counts[practice] = (counts[practice] ?? 0) + 1;
      return counts;
    },
    async deleteUser(githubId) {
      users.delete(githubId);
      votes.delete(githubId);
    },
  };
}
