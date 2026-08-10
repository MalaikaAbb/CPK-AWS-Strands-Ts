"use client";

/**
 * The settings panel. Not published — the page shows only the relay component
 * that mirrors the config into the agent, never the UI that owns it.
 *
 * Three selects, one per field of `AgentConfig`. That is the shape the page
 * describes ("a settings panel, a toolbar of selects") and nothing more.
 */

import {
  EXPERTISE,
  RESPONSE_LENGTHS,
  TONES,
  type AgentConfig,
} from "./config-types";

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ConfigCard({
  config,
  setConfig,
}: {
  config: AgentConfig;
  setConfig: (next: AgentConfig) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Response preferences
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        The UI owns this object. Every change is republished to the agent
        immediately and applies from the next turn.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Select
          label="Tone"
          value={config.tone}
          options={TONES}
          onChange={(tone) => setConfig({ ...config, tone })}
        />
        <Select
          label="Expertise"
          value={config.expertise}
          options={EXPERTISE}
          onChange={(expertise) => setConfig({ ...config, expertise })}
        />
        <Select
          label="Response length"
          value={config.responseLength}
          options={RESPONSE_LENGTHS}
          onChange={(responseLength) => setConfig({ ...config, responseLength })}
        />
      </div>
    </section>
  );
}
