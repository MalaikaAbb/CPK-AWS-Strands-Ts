"use client";

/**
 * `DemoLayout` and `ACTIVITIES`, imported by the published `page.tsx` from
 * `./demo-layout` and shown nowhere.
 *
 * What the published code fixes: `ACTIVITIES` is a string array (the initial
 * state slices it as `ACTIVITIES[0]` and `ACTIVITIES[2]`), and the three
 * `useState` setters — `setUserName`, `setUserTimezone`, `setRecentActivity` —
 * exist because something in the UI edits all three. `DemoLayout` is that
 * something. Its props are not visible in the published excerpt, which stops
 * before the return statement, so the shape below is this repo's.
 */

export const ACTIVITIES = [
  "Opened the Q2 revenue dashboard",
  "Exported the pipeline report to CSV",
  "Commented on the Northwind Retail renewal",
  "Archived three stale opportunities",
  "Invited a teammate to the workspace",
];

const TIMEZONES = [
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "Asia/Tokyo",
];

export function DemoLayout({
  userName,
  setUserName,
  userTimezone,
  setUserTimezone,
  recentActivity,
  setRecentActivity,
}: {
  userName: string;
  setUserName: (value: string) => void;
  userTimezone: string;
  setUserTimezone: (value: string) => void;
  recentActivity: string[];
  setRecentActivity: (value: string[]) => void;
}) {
  const toggle = (activity: string) => {
    setRecentActivity(
      recentActivity.includes(activity)
        ? recentActivity.filter((a) => a !== activity)
        : [...recentActivity, activity],
    );
  };

  return (
    <main className="h-full overflow-y-auto p-8">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        What the agent knows about you
      </h1>
      <p className="mt-2 max-w-prose text-sm text-slate-600 dark:text-slate-400">
        Every field below is published with <code>useAgentContext</code>. Change
        one and ask the agent again — it sees the new value on the next turn,
        and it has no way to change any of them back.
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Display name
          </span>
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Timezone
          </span>
          <select
            value={userTimezone}
            onChange={(e) => setUserTimezone(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Recent activity (newest first)
        </legend>
        <ul className="mt-2 space-y-1.5">
          {ACTIVITIES.map((activity) => (
            <li key={activity}>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={recentActivity.includes(activity)}
                  onChange={() => toggle(activity)}
                />
                {activity}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
    </main>
  );
}
