// Lists: status tabs, search, filter selects, the boxed data table with selection, bulk bar, cursor pager.
// Search/filter state lives in the URL (?q=, ?status=…) so lists are shareable and loaders do the work.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { cx, Icon } from "./primitives";
import { Align } from "./types";

export interface StatusTab {
  /** Value written to the URL param; "" = no filter. */
  value: string;
  label: string;
  count?: number;
  /** Count shown as a filled accent badge (something needs attention). */
  alert?: boolean;
}

/** Status tabs bound to one URL search param (default `status`). Changing tab drops paging. */
export function StatusTabs({ tabs, param = "status" }: { tabs: StatusTab[]; param?: string }) {
  const [params] = useSearchParams();
  const current = params.get(param) ?? "";
  return (
    <nav className="ui-tabs-pill" aria-label="Status">
      {tabs.map((t) => {
        const next = new URLSearchParams(params);
        if (t.value) next.set(param, t.value);
        else next.delete(param);
        next.delete("after");
        next.delete("before");
        return (
          <Link key={`${t.value}|${t.label}`} to={`?${next}`} aria-current={current === t.value ? "page" : undefined} preventScrollReset>
            {t.label}
            {t.count !== undefined ? <span className={t.alert ? "n" : "c"}>{t.count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}

function useParamSetter(): (key: string, value: string) => void {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  return (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("after");
    next.delete("before");
    navigate(`?${next}`, { replace: true, preventScrollReset: true });
  };
}

/** Debounced search bound to `?q=`. */
export function SearchBox({ placeholder = "Search", param = "q" }: { placeholder?: string; param?: string }) {
  const [params] = useSearchParams();
  const set = useParamSetter();
  const [value, setValue] = useState(params.get(param) ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => setValue(params.get(param) ?? ""), [params, param]);
  const update = (v: string) => {
    setValue(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => set(param, v.trim()), 300);
  };
  return (
    <label className="ui-qsearch">
      <Icon name="search" />
      <input type="search" value={value} placeholder={placeholder} aria-label={placeholder} onChange={(e) => update(e.target.value)} />
      {value ? (
        <button type="button" className="ui-btn ghost sm" aria-label="Clear search" style={{ height: 22, padding: "0 4px" }} onClick={() => update("")}>
          <Icon name="x" />
        </button>
      ) : null}
    </label>
  );
}

export interface FilterOption {
  value: string;
  label: string;
}

/** "Source: All" select bound to a URL param. Turns blue once set. */
export function FilterSelect({ label, param, options, allLabel = "All" }: { label: string; param: string; options: FilterOption[]; allLabel?: string }) {
  const [params] = useSearchParams();
  const set = useParamSetter();
  const value = params.get(param) ?? "";
  return (
    <label className={cx("ui-filter", value && "set")}>
      {label}:
      <select value={value} onChange={(e) => set(param, e.target.value)}>
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** The row above a list: search, filters, a spacer, then trailing controls. */
export function FilterBar({ children, trailing }: { children: ReactNode; trailing?: ReactNode }) {
  return (
    <div className="ui-bar-row">
      {children}
      {trailing ? (
        <>
          <span className="ui-grow" />
          {trailing}
        </>
      ) : null}
    </div>
  );
}

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  align?: Align;
  /** Hide below 700px. */
  hideOnSmall?: boolean;
  width?: number | string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Whole-row link (the row opens the detail). */
  rowHref?: (row: T) => string;
  selected?: Set<string>;
  onSelectedChange?: (next: Set<string>) => void;
  /** Shown instead of the table body when there are no rows. */
  empty?: ReactNode;
  footer?: ReactNode;
}

export function DataTable<T>({ columns, rows, rowKey, rowHref, selected, onSelectedChange, empty, footer }: DataTableProps<T>) {
  const navigate = useNavigate();
  const selectable = Boolean(selected && onSelectedChange);
  const keys = rows.map(rowKey);
  const all = selectable && keys.length > 0 && keys.every((k) => selected!.has(k));
  const some = selectable && keys.some((k) => selected!.has(k));
  const toggle = (k: string) => {
    const next = new Set(selected);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    onSelectedChange!(next);
  };
  return (
    <section className="ui-box">
      {rows.length === 0 && empty ? (
        empty
      ) : (
        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                {selectable ? (
                  <th className="ui-check-cell">
                    <input
                      type="checkbox"
                      aria-label="Select all on this page"
                      checked={all}
                      ref={(el) => {
                        if (el) el.indeterminate = some && !all;
                      }}
                      onChange={() => onSelectedChange!(all ? new Set() : new Set(keys))}
                    />
                  </th>
                ) : null}
                {columns.map((c) => (
                  <th key={c.key} className={cx(c.align === Align.Right && "r", c.hideOnSmall && "hide-sm")} style={c.width ? { width: c.width } : undefined}>
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const k = rowKey(r);
                const href = rowHref?.(r);
                return (
                  <tr
                    key={k}
                    className={href ? "link" : undefined}
                    aria-selected={selectable && selected!.has(k) ? true : undefined}
                    onClick={href ? (e) => {
                      if ((e.target as HTMLElement).closest("input,button,a,label")) return;
                      navigate(href);
                    } : undefined}
                  >
                    {selectable ? (
                      <td className="ui-check-cell">
                        <input type="checkbox" aria-label="Select row" checked={selected!.has(k)} onChange={() => toggle(k)} />
                      </td>
                    ) : null}
                    {columns.map((c) => (
                      <td key={c.key} className={cx(c.align === Align.Right && "r ui-num", c.hideOnSmall && "hide-sm")}>
                        {c.render(r)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {footer ? <div className="ui-box-foot">{footer}</div> : null}
    </section>
  );
}

/** "1–25 of 143" with cursor links. Pass hrefs from the loader; a missing href disables that side. */
export function Pager({ label, prevHref, nextHref }: { label: ReactNode; prevHref?: string | null; nextHref?: string | null }) {
  return (
    <>
      <span>{label}</span>
      <span className="ui-actions">
        {prevHref ? (
          <Link className="ui-btn sm" to={prevHref} preventScrollReset>
            <Icon name="left" />
            Previous
          </Link>
        ) : (
          <span className="ui-btn sm" aria-disabled="true">
            <Icon name="left" />
            Previous
          </span>
        )}
        {nextHref ? (
          <Link className="ui-btn sm" to={nextHref} preventScrollReset>
            Next
            <Icon name="right" />
          </Link>
        ) : (
          <span className="ui-btn sm" aria-disabled="true">
            Next
            <Icon name="right" />
          </span>
        )}
      </span>
    </>
  );
}

/** Dark bar at the bottom of the app while rows are selected. */
export function BulkBar({ count, summary, children, onClear }: { count: number; summary?: ReactNode; children: ReactNode; onClear: () => void }) {
  if (count === 0) return null;
  return (
    <div className="ui-bulk" role="region" aria-label="Selected rows">
      <b>{count} selected</b>
      {summary ? <span className="sum">{summary}</span> : null}
      <span className="ui-grow" />
      {children}
      <button type="button" className="ui-btn sm ghost" onClick={onClear}>
        Clear
      </button>
    </div>
  );
}
