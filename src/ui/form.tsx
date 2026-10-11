// Form controls. All are plain inputs underneath (named, uncontrolled by default) so they work with
// React Router <Form> and progressive enhancement; pass value/onChange when a page needs live state.
import { useEffect, useId, useRef, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Button, cx, Icon } from "./primitives";
import { ButtonKind } from "./types";

export interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}

/** Label, control, then hint or error. The render prop wires ids for screen readers. */
export function Field({ label, hint, error, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div className="ui-field">
      <label className="ui-label" htmlFor={id}>
        {label}
      </label>
      {children({ id, describedBy: hint || error ? hintId : undefined, invalid: Boolean(error) })}
      {error ? (
        <div className="ui-error" id={hintId}>
          {error}
        </div>
      ) : hint ? (
        <div className="ui-hint" id={hintId}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export interface TextFieldProps extends Omit<InputProps, "id"> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

export function TextField({ label, hint, error, className, ...rest }: TextFieldProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <input {...rest} id={id} className={cx("ui-input", className)} aria-describedby={describedBy} aria-invalid={invalid || undefined} />
      )}
    </Field>
  );
}

export interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

export function TextAreaField({ label, hint, error, className, ...rest }: TextAreaFieldProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <textarea {...rest} id={id} className={cx("ui-textarea", className)} aria-describedby={describedBy} aria-invalid={invalid || undefined} />
      )}
    </Field>
  );
}

export interface AffixFieldProps extends Omit<InputProps, "id" | "prefix"> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

/** Input with a fixed prefix or suffix ("J$", "months"). */
export function AffixField({ label, hint, error, prefix, suffix, ...rest }: AffixFieldProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <div className="ui-affix" aria-invalid={invalid || undefined}>
          {prefix ? <span>{prefix}</span> : null}
          <input {...rest} id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} />
          {suffix ? <span>{suffix}</span> : null}
        </div>
      )}
    </Field>
  );
}

const CURRENCY_PREFIX: Record<string, string> = { JMD: "J$", USD: "US$", TTD: "TT$", BBD: "Bds$", XCD: "EC$", KYD: "CI$", GYD: "G$" };

/** Money in the merchant's currency, typed in whole units (the server stores what it needs). */
export function MoneyField({ currency, ...rest }: Omit<AffixFieldProps, "prefix" | "type" | "inputMode"> & { currency: string }) {
  return <AffixField {...rest} prefix={CURRENCY_PREFIX[currency] ?? currency} type="number" inputMode="decimal" step="0.01" min={rest.min ?? 0} />;
}

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  options: Array<{ value: string; label: string }>;
}

/** Native select (native pickers on phones), styled like the other controls. */
export function SelectField({ label, hint, error, options, className, ...rest }: SelectFieldProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <select {...rest} id={id} className={cx("ui-select", className)} aria-describedby={describedBy} aria-invalid={invalid || undefined}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

/** Date field: the browser's own date picker, styled to match. */
export function DateField(props: Omit<TextFieldProps, "type">) {
  return <TextField {...props} type="date" />;
}

export interface SwitchProps extends Omit<InputProps, "type"> {
  label: ReactNode;
  description?: ReactNode;
}

export function Switch({ label, description, className, ...rest }: SwitchProps) {
  return (
    <label className={cx("ui-switch-row", className)}>
      <input {...rest} type="checkbox" className="ui-switch" />
      <span>
        <span style={{ fontWeight: 500 }}>{label}</span>
        {description ? <small>{description}</small> : null}
      </span>
    </label>
  );
}

export interface OptionCard {
  value: string;
  label: ReactNode;
  detail?: ReactNode;
  disabled?: boolean;
}

/** Radio choices that each need a sentence. */
export function OptionCards({ name, options, defaultValue, value, onChange, columns = 1 }: { name: string; options: OptionCard[]; defaultValue?: string; value?: string; onChange?: (v: string) => void; columns?: number }) {
  return (
    <div className="ui-opts" role="radiogroup" style={{ gridTemplateColumns: `repeat(${columns},minmax(0,1fr))` }}>
      {options.map((o) => (
        <label key={o.value} className="ui-opt" style={o.disabled ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
          <input
            type="radio"
            name={name}
            value={o.value}
            disabled={o.disabled}
            {...(value !== undefined ? { checked: value === o.value, onChange: () => onChange?.(o.value) } : { defaultChecked: defaultValue === o.value, onChange: () => onChange?.(o.value) })}
          />
          <span>
            <b>{o.label}</b>
            {o.detail ? <small>{o.detail}</small> : null}
          </span>
        </label>
      ))}
    </div>
  );
}

/** 2–4 views or modes. Controlled. */
export function Segmented<T extends string>({ options, value, onChange, name }: { options: Array<{ value: T; label: string }>; value: T; onChange: (v: T) => void; name?: string }) {
  return (
    <span className="ui-seg" role="group">
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
      {name ? <input type="hidden" name={name} value={value} /> : null}
    </span>
  );
}

/** Colour choice: swatches plus a hex field. Writes `name` as #RRGGBB. */
export function ColorSwatches({ name, swatches, defaultValue }: { name: string; swatches: string[]; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const [hex, setHex] = useState(defaultValue.replace("#", "").toUpperCase());
  return (
    <div className="ui-swatches">
      {swatches.map((s) => (
        <button
          key={s}
          type="button"
          className="ui-swatch"
          style={{ background: s }}
          aria-label={`Colour ${s}`}
          aria-pressed={value.toLowerCase() === s.toLowerCase()}
          onClick={() => {
            setValue(s);
            setHex(s.replace("#", "").toUpperCase());
          }}
        />
      ))}
      <span className="ui-affix" style={{ width: 150, marginLeft: 8 }}>
        <span>#</span>
        <input
          aria-label="Hex colour"
          value={hex}
          maxLength={6}
          className="ui-mono"
          onChange={(e) => {
            const h = e.target.value.replace(/[^0-9a-f]/gi, "").slice(0, 6).toUpperCase();
            setHex(h);
            if (h.length === 6) setValue(`#${h}`);
          }}
        />
      </span>
      <input type="hidden" name={name} value={value} />
    </div>
  );
}

export interface FileDropProps {
  accept: string;
  maxBytes: number;
  /** Shown as the current file (an image URL shows a thumbnail). */
  currentUrl?: string | null;
  hint: ReactNode;
  busy?: boolean;
  error?: ReactNode;
  onFile: (file: File) => void;
  onRemove?: () => void;
}

/** Drop a file or browse. Size is checked before upload so a too-big file never leaves the device. */
export function FileDrop({ accept, maxBytes, currentUrl, hint, busy, error, onFile, onRemove }: FileDropProps) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const take = (f: File | undefined) => {
    if (!f) return;
    if (f.size > maxBytes) {
      setLocalError(`Too big: ${(f.size / 1048576).toFixed(1)} MB. The limit is ${Math.round(maxBytes / 1048576)} MB.`);
      return;
    }
    setLocalError(null);
    onFile(f);
  };
  return (
    <div>
      <div
        className="ui-drop"
        data-over={over || undefined}
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer.files[0]);
        }}
      >
        {currentUrl ? <img src={currentUrl} alt="" /> : <span className="ic">{busy ? <span className="ui-spin" /> : <Icon name="upload" />}</span>}
        <div className="ui-grow" style={{ flex: 1 }}>
          <b style={{ fontWeight: 600 }}>{busy ? "Uploading…" : currentUrl ? "Drop a new file to replace" : <>Drop a file or <span className="ui-link">browse</span></>}</b>
          <div className="ui-t3" style={{ fontSize: 13 }}>{hint}</div>
        </div>
        {currentUrl && onRemove ? (
          <Button
            kind={ButtonKind.Ghost}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            Remove
          </Button>
        ) : null}
        <input ref={input} type="file" accept={accept} hidden onChange={(e) => take(e.target.files?.[0])} />
      </div>
      {localError || error ? <div className="ui-error">{localError ?? error}</div> : null}
    </div>
  );
}

export interface ComboOption {
  value: string;
  label: string;
  detail?: string;
}

export interface ComboboxProps {
  label: ReactNode;
  name: string;
  placeholder?: string;
  hint?: ReactNode;
  error?: ReactNode;
  /** Server search; called debounced with the typed text. */
  search: (q: string) => Promise<ComboOption[]>;
  /** Offer "Use <text>" when nothing matches (new customer). Return the value to store. */
  allowFreeText?: (text: string) => string | null;
  freeTextLabel?: (text: string) => string;
  defaultOption?: ComboOption | null;
  onSelect?: (o: ComboOption | null) => void;
}

/** Type to search a list that lives on the server (customers, products). Keyboard: ↑ ↓ Enter Esc. */
export function Combobox({ label, name, placeholder, hint, error, search, allowFreeText, freeTextLabel = (t) => `Use "${t}"`, defaultOption = null, onSelect }: ComboboxProps) {
  const [text, setText] = useState(defaultOption?.label ?? "");
  const [chosen, setChosen] = useState<ComboOption | null>(defaultOption);
  const [results, setResults] = useState<ComboOption[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const seq = useRef(0);

  useEffect(() => {
    if (!open || chosen?.label === text) return;
    const q = text.trim();
    if (!q) {
      setResults([]);
      return;
    }
    const n = ++seq.current;
    setBusy(true);
    const t = setTimeout(() => {
      search(q)
        .then((r) => n === seq.current && (setResults(r), setActive(0)))
        .catch(() => n === seq.current && setResults([]))
        .finally(() => n === seq.current && setBusy(false));
    }, 250);
    return () => clearTimeout(t);
  }, [text, open, chosen, search]);

  const free = allowFreeText?.(text.trim()) ?? null;
  const options: Array<ComboOption & { free?: boolean }> = [...results, ...(free && !results.some((r) => r.value === free) ? [{ value: free, label: freeTextLabel(text.trim()), free: true }] : [])];
  const pick = (o: ComboOption & { free?: boolean }) => {
    const c = o.free ? { value: o.value, label: text.trim() } : o;
    setChosen(c);
    setText(c.label);
    setOpen(false);
    onSelect?.(c);
  };

  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <div className="ui-combo">
          <div className="ui-affix" aria-invalid={invalid || undefined}>
            <input
              id={id}
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-describedby={describedBy}
              autoComplete="off"
              placeholder={placeholder}
              value={text}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 120)}
              onChange={(e) => {
                setText(e.target.value);
                setChosen(null);
                onSelect?.(null);
                setOpen(true);
              }}
              onKeyDown={(e) => {
                if (!open || !options.length) return;
                if (e.key === "ArrowDown") (e.preventDefault(), setActive((a) => Math.min(a + 1, options.length - 1)));
                else if (e.key === "ArrowUp") (e.preventDefault(), setActive((a) => Math.max(a - 1, 0)));
                else if (e.key === "Enter") { e.preventDefault(); const o = options[active]; if (o) pick(o); }
                else if (e.key === "Escape") setOpen(false);
              }}
            />
            {busy ? <span style={{ background: "var(--bg)", border: 0 }}><span className="ui-spin" /></span> : null}
          </div>
          {open && options.length ? (
            <div className="ui-combo-list" id={listId} role="listbox">
              {options.map((o, i) => (
                <div key={`${o.value}-${i}`} role="option" aria-selected={i === active} onMouseDown={(e) => (e.preventDefault(), pick(o))} onMouseEnter={() => setActive(i)}>
                  {o.free ? <Icon name="plus" /> : <span className="ui-avatar">{initials(o.label)}</span>}
                  <span>
                    {o.label}
                    {o.detail ? <small>{o.detail}</small> : null}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
          <input type="hidden" name={name} value={chosen?.value ?? ""} />
        </div>
      )}
    </Field>
  );
}

export function initials(name: string): string {
  const parts = name.trim().split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export const SaveState = { Dirty: "dirty", Saving: "saving", Saved: "saved", Failed: "failed" } as const;
export type SaveState = (typeof SaveState)[keyof typeof SaveState];

export interface SaveBarProps {
  state: SaveState | null;
  /** What changed, or why it failed. */
  message?: ReactNode;
  /** Submits this form id. */
  formId: string;
  onDiscard: () => void;
  saveLabel?: string;
}

/** Pinned to the bottom of the app from the first change until saved. */
export function SaveBar({ state, message, formId, onDiscard, saveLabel = "Save" }: SaveBarProps) {
  if (!state) return null;
  const title = { dirty: "Unsaved changes", saving: "Saving…", saved: "Saved", failed: "Didn't save" }[state];
  return (
    <div className={cx("ui-savebar", state === SaveState.Failed && "bad", state === SaveState.Saved && "ok")} role="status">
      <span className="dot" />
      <b>{title}</b>
      {message ? <span className="ui-t3">{message}</span> : null}
      <span className="ui-grow" />
      {state !== SaveState.Saved ? (
        <>
          <Button onClick={onDiscard} disabled={state === SaveState.Saving}>
            Discard
          </Button>
          <Button kind={ButtonKind.Primary} type="submit" form={formId} busy={state === SaveState.Saving}>
            {state === SaveState.Failed ? "Try again" : saveLabel}
          </Button>
        </>
      ) : null}
    </div>
  );
}
