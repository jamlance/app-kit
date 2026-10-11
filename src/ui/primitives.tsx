// Icons, buttons, status pills, callouts, states, skeletons.
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router";
import { ICON_PATHS, type IconName } from "./icons";
import { ButtonKind, ButtonSize, Tone, type IconTone } from "./types";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export interface IconProps {
  name: IconName;
  /** Colour by meaning. Omit for the surrounding text colour. */
  tone?: IconTone;
  size?: "md" | "lg";
  /** Accessible label; omit for decorative icons. */
  label?: string;
  className?: string;
}

export function Icon({ name, tone, size = "md", label, className }: IconProps) {
  return (
    <svg
      className={cx("ui-i", size === "lg" && "lg", tone && `tone-${tone}`, className)}
      viewBox="0 0 24 24"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] }}
    />
  );
}

function buttonClass(kind: ButtonKind, size: ButtonSize, extra?: string): string {
  return cx("ui-btn", kind !== ButtonKind.Secondary && kind, size === ButtonSize.Small && "sm", extra);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: ButtonKind;
  size?: ButtonSize;
  icon?: IconName;
  /** Shows a spinner, keeps the label and width, blocks clicks. */
  busy?: boolean;
}

export function Button({ kind = ButtonKind.Secondary, size = ButtonSize.Medium, icon, busy, children, className, disabled, type = "button", ...rest }: ButtonProps) {
  return (
    <button {...rest} type={type} className={buttonClass(kind, size, className)} disabled={disabled || busy} data-busy={busy ? "true" : undefined}>
      {busy ? <span className="ui-spin" aria-hidden="true" /> : icon ? <Icon name={icon} /> : null}
      {children}
    </button>
  );
}

export interface ButtonLinkProps extends LinkProps {
  kind?: ButtonKind;
  size?: ButtonSize;
  icon?: IconName;
}

/** A router link that looks like a button. */
export function ButtonLink({ kind = ButtonKind.Secondary, size = ButtonSize.Medium, icon, children, className, ...rest }: ButtonLinkProps) {
  return (
    <Link {...rest} className={buttonClass(kind, size, className)}>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </Link>
  );
}

export interface ExternalButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  kind?: ButtonKind;
  size?: ButtonSize;
  icon?: IconName;
}

/** A plain anchor (downloads, new tabs) that looks like a button. */
export function ExternalButton({ kind = ButtonKind.Secondary, size = ButtonSize.Medium, icon, children, className, ...rest }: ExternalButtonProps) {
  return (
    <a {...rest} className={buttonClass(kind, size, className)}>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </a>
  );
}

export interface StatusPillProps {
  tone?: Tone;
  children: ReactNode;
  /** Hide the leading dot (plain labels like "Issued"). */
  plain?: boolean;
}

/** Status in words with a tone. Never capitalises the text (codes stay as written). */
export function StatusPill({ tone = Tone.Neutral, children, plain }: StatusPillProps) {
  return <span className={cx("ui-chip", tone !== Tone.Neutral && tone, plain && "plain")}>{children}</span>;
}

export interface CalloutProps {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}

const CALLOUT_ICON: Record<Tone, IconName> = { ok: "check", warn: "alert", bad: "alert", info: "info", neutral: "info" };

export function Callout({ tone = Tone.Info, title, children, action }: CalloutProps) {
  return (
    <div className={cx("ui-callout", tone !== Tone.Neutral && tone)} role={tone === Tone.Bad ? "alert" : undefined}>
      <Icon name={CALLOUT_ICON[tone]} />
      <div className="ui-grow">
        {title ? <b>{title} </b> : null}
        {children}
      </div>
      {action ? <span className="ui-actions">{action}</span> : null}
    </div>
  );
}

export interface EmptyStateProps {
  icon?: IconName;
  iconTone?: IconTone;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
}

export function EmptyState({ icon = "info", iconTone, title, children, actions }: EmptyStateProps) {
  return (
    <div className="ui-state">
      <Icon name={icon} tone={iconTone} />
      <b>{title}</b>
      {children ? <p>{children}</p> : null}
      {actions ? <div className="ui-actions">{actions}</div> : null}
    </div>
  );
}

export interface ErrorStateProps {
  title?: ReactNode;
  children?: ReactNode;
  onRetry?: () => void;
}

/** One section failed; say so in plain words and offer a retry. The rest of the page keeps working. */
export function ErrorState({ title = "This didn't load.", children = "Inkress didn't answer in time. Try again in a moment.", onRetry }: ErrorStateProps) {
  return <Callout tone={Tone.Bad} title={title} action={onRetry ? <Button size={ButtonSize.Small} onClick={onRetry}>Try again</Button> : undefined}>{children}</Callout>;
}

export function Skeleton({ width = "100%", height = 12 }: { width?: number | string; height?: number }) {
  return <span className="ui-skel" style={{ display: "block", width, height }} />;
}

/** Placeholder rows for a list or table while it loads. */
export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Skeleton width={i % 2 ? "34%" : "26%"} />
          <Skeleton width="18%" />
          <span style={{ flex: 1 }} />
          <Skeleton width="14%" />
        </div>
      ))}
    </div>
  );
}
