// Shared value sets for the UI layer. One definition each; components take these, never bare strings.

/** Semantic status colour (pills, callouts, timeline dots, save bar). */
export const Tone = {
  Ok: "ok",
  Warn: "warn",
  Bad: "bad",
  Info: "info",
  Neutral: "neutral",
} as const;
export type Tone = (typeof Tone)[keyof typeof Tone];

/** What a thing IS, shown as the colour of its line icon (never a filled tile). Same meanings as the dashboard. */
export const IconTone = {
  /** money */ Green: "green",
  /** sales, orders */ Blue: "blue",
  /** customers, people */ Violet: "violet",
  /** store, catalogue */ Teal: "teal",
  /** risk, deadlines */ Rose: "rose",
  /** settings, neutral */ Slate: "slate",
} as const;
export type IconTone = (typeof IconTone)[keyof typeof IconTone];

export const ButtonKind = {
  Primary: "primary",
  Secondary: "secondary",
  Ghost: "ghost",
  Danger: "danger",
} as const;
export type ButtonKind = (typeof ButtonKind)[keyof typeof ButtonKind];

export const ButtonSize = { Small: "sm", Medium: "md" } as const;
export type ButtonSize = (typeof ButtonSize)[keyof typeof ButtonSize];

export const Align = { Left: "left", Right: "right" } as const;
export type Align = (typeof Align)[keyof typeof Align];

export const Trend = { Up: "up", Down: "down", Flat: "flat" } as const;
export type Trend = (typeof Trend)[keyof typeof Trend];

export const StepState = { Done: "done", Current: "current", Todo: "todo" } as const;
export type StepState = (typeof StepState)[keyof typeof StepState];
