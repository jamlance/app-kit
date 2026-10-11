// Page structure: app nav, page header, boxes, stat tiles, attention lists, setup checklist, charts, hubs, details.
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router";
import { cx, Icon } from "./primitives";
import type { IconName } from "./icons";
import { StepState, Trend, type IconTone, type Tone } from "./types";

export interface AppNavItem {
  to: string;
  label: string;
  count?: number;
  /** Match only the exact path (for the index tab). */
  end?: boolean;
}

/** The app's own sections, directly under the host's title. The host already shows the app name: never repeat it. */
export function AppNav({ items, actions }: { items: AppNavItem[]; actions?: ReactNode }) {
  return (
    <nav className="ui-appnav" aria-label="Sections">
      {items.map((i) => (
        <NavLink key={i.to} to={i.to} end={i.end} prefetch="intent">
          {i.label}
          {i.count !== undefined ? <span className="ui-count">{i.count}</span> : null}
        </NavLink>
      ))}
      {actions ? <span className="ui-appnav-actions">{actions}</span> : null}
    </nav>
  );
}

/** Whole-app wrapper: nav on top, padded content below. */
export function AppFrame({ nav, children }: { nav: ReactNode; children: ReactNode }) {
  return (
    <div className="ui-app">
      {nav}
      <main className="ui-main-in">{children}</main>
    </div>
  );
}

export interface PageHeaderProps {
  title: ReactNode;
  /** One line under the title; may contain <b> for the number that matters. */
  summary?: ReactNode;
  actions?: ReactNode;
  back?: { to: string; label: string };
}

export function PageHeader({ title, summary, actions, back }: PageHeaderProps) {
  return (
    <>
      {back ? (
        <Link className="ui-back" to={back.to} prefetch="intent">
          <Icon name="left" />
          {back.label}
        </Link>
      ) : null}
      <div className="ui-pagehead">
        <div>
          <h1>{title}</h1>
          {summary ? <p className="ui-sub">{summary}</p> : null}
        </div>
        {actions ? <div className="ui-actions">{actions}</div> : null}
      </div>
    </>
  );
}

export interface BoxProps {
  title?: ReactNode;
  /** Muted text after the title. */
  note?: ReactNode;
  /** Right side of the header (a link, a count). */
  aside?: ReactNode;
  footer?: ReactNode;
  /** Pad the body (default). Set false for tables and lists that run edge to edge. */
  padded?: boolean;
  children: ReactNode;
  className?: string;
}

export function Box({ title, note, aside, footer, padded = true, children, className }: BoxProps) {
  return (
    <section className={cx("ui-box", className)}>
      {title ? (
        <div className="ui-box-head">
          <b>{title}</b>
          {note ? <span className="ui-t3">{note}</span> : null}
          {aside ? <span className="ui-right">{aside}</span> : null}
        </div>
      ) : null}
      {padded ? <div className="ui-box-body">{children}</div> : children}
      {footer ? <div className="ui-box-foot">{footer}</div> : null}
    </section>
  );
}

export interface StatTile {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  trend?: Trend;
  icon?: IconName;
  iconTone?: IconTone;
}

export function StatTiles({ tiles }: { tiles: StatTile[] }) {
  const cols = tiles.length === 3 ? "c3" : tiles.length === 2 ? "c2" : undefined;
  return (
    <div className={cx("ui-tiles", cols)}>
      {tiles.map((t) => (
        <div className="ui-tile" key={t.label}>
          <div className="l">
            {t.icon ? <Icon name={t.icon} tone={t.iconTone} /> : null}
            {t.label}
          </div>
          <div className="v">{t.value}</div>
          {t.note ? <div className={cx("s", t.trend === Trend.Up && "up", t.trend === Trend.Down && "down")}>{t.note}</div> : null}
        </div>
      ))}
    </div>
  );
}

export interface AttentionItemProps {
  icon?: IconName;
  iconTone?: IconTone;
  /** Replaces the icon (a step number, an avatar). */
  lead?: ReactNode;
  title: ReactNode;
  detail?: ReactNode;
  action?: ReactNode;
  highlight?: boolean;
}

/** One row of "needs you" style lists: icon, what happened, one action. */
export function AttentionItem({ icon, iconTone, lead, title, detail, action, highlight }: AttentionItemProps) {
  return (
    <div className={cx("ui-attn", highlight && "on")}>
      {lead ?? (icon ? <Icon name={icon} tone={iconTone} /> : null)}
      <div className="ui-grow">
        <b>{title}</b>
        {detail ? <span className="d">{detail}</span> : null}
      </div>
      {action ? <span className="ui-attn-end">{action}</span> : null}
    </div>
  );
}

export interface SetupStep {
  id: string;
  title: ReactNode;
  detail?: ReactNode;
  state: StepState;
  action?: ReactNode;
}

/** First-run checklist. Done steps collapse into the header line; the current step is highlighted. */
export function SetupChecklist({ title, steps, onHide }: { title: ReactNode; steps: SetupStep[]; onHide?: () => void }) {
  const done = steps.filter((s) => s.state === StepState.Done);
  const open = steps.filter((s) => s.state !== StepState.Done);
  if (!open.length) return null;
  const pct = Math.round((done.length / steps.length) * 100);
  return (
    <section className="ui-box" aria-label="Setup">
      <div className="ui-box-head">
        <b>{title}</b>
        <span className="ui-t3">
          {done.length} of {steps.length} done
        </span>
        <span className="ui-right">
          <span className="ui-bar" style={{ width: 140 }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${pct}%` }} />
          </span>
          {onHide ? (
            <button type="button" className="ui-btn ghost sm" onClick={onHide}>
              Hide
            </button>
          ) : null}
        </span>
      </div>
      {open.map((s) => (
        <AttentionItem
          key={s.id}
          lead={<span className="ui-stepnum">{steps.indexOf(s) + 1}</span>}
          title={s.title}
          detail={s.detail}
          action={s.action}
          highlight={s.state === StepState.Current}
        />
      ))}
    </section>
  );
}

export interface Bar {
  label: string;
  value: number;
}

/** Solid-accent bars; zero values stay as grey stubs. Axis shows up to five evenly spaced labels. */
export function BarChart({ bars, format, height = 200 }: { bars: Bar[]; format?: (n: number) => string; height?: number }) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  const step = Math.max(1, Math.ceil(bars.length / 4));
  const ticks = bars.filter((_, i) => i % step === 0 || i === bars.length - 1);
  return (
    <figure style={{ margin: 0 }}>
      <div className="ui-bars" style={{ height }} role="img" aria-label={bars.map((b) => `${b.label}: ${format ? format(b.value) : b.value}`).join(", ")}>
        {bars.map((b, i) => (
          <span
            key={`${b.label}-${i}`}
            className={b.value === 0 ? "z" : undefined}
            style={{ height: `${b.value === 0 ? 2 : Math.max(3, (b.value / max) * 100)}%` }}
            title={`${b.label} · ${format ? format(b.value) : b.value}`}
          />
        ))}
      </div>
      <div className="ui-axis">
        {ticks.map((t, i) => (
          <span key={`${t.label}-${i}`}>{t.label}</span>
        ))}
      </div>
    </figure>
  );
}

export interface HubTile {
  to: string;
  icon: IconName;
  iconTone?: IconTone;
  title: string;
  detail: ReactNode;
  warn?: boolean;
}

/** A settings home: one tile per area, like the dashboard's My Store. */
export function Hub({ tiles }: { tiles: HubTile[] }) {
  return (
    <div className="ui-hub">
      {tiles.map((t) => (
        <Link key={t.to} to={t.to} prefetch="intent">
          <Icon name={t.icon} tone={t.iconTone} size="lg" />
          <h3>{t.title}</h3>
          <p className={t.warn ? "warn" : undefined}>{t.detail}</p>
        </Link>
      ))}
    </div>
  );
}

export function KeyValue({ items }: { items: Array<[ReactNode, ReactNode]> }) {
  return (
    <dl className="ui-kv">
      {items.map(([k, v], i) => (
        <div key={i} style={{ display: "contents" }}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export interface TimelineEntry {
  id: string | number;
  tone?: Tone;
  title: ReactNode;
  meta?: ReactNode;
  note?: ReactNode;
}

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ul className="ui-tl">
      {entries.map((e) => (
        <li key={e.id} className={e.tone && e.tone !== "neutral" ? e.tone : undefined}>
          {e.title}
          {e.meta ? <small>{e.meta}</small> : null}
          {e.note ? <div className="note">{e.note}</div> : null}
        </li>
      ))}
    </ul>
  );
}

/** Label column + controls, the dashboard's settings layout. */
export function FormSection({ title, description, children }: { title: ReactNode; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="ui-fs">
      <div>
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      <div>{children}</div>
    </div>
  );
}
