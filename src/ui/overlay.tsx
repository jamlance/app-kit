// Overlays the app draws itself (tasks): Dialog and SidePanel on the native <dialog> (focus trap, Esc, backdrop).
// Questions ("Deactivate 3 cards?") go to the host instead: useConfirm() from @inkress/app-kit/client.
// Also: copy-to-clipboard through the host bridge, with a browser fallback.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useBv } from "../client/bv-provider";
import { Button, cx, Icon } from "./primitives";
import { ButtonKind, ButtonSize } from "./types";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
  /** Buttons for the footer; usually Cancel + the primary action (type="submit" form=…). */
  footer?: ReactNode;
  /** Left side of the footer ("2 selected"). */
  footerNote?: ReactNode;
  wide?: boolean;
  /** Slides in from the right, full height. */
  sheet?: boolean;
}

function Overlay({ open, onClose, title, sub, children, footer, footerNote, wide, sheet }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={cx("ui-dialog", wide && "wide", sheet && "sheet")}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={typeof title === "string" ? title : undefined}
    >
      {open ? (
        <>
          <div className="ui-dialog-head">
            <div className="ui-grow">
              <h2>{title}</h2>
              {sub ? <p className="ui-sub">{sub}</p> : null}
            </div>
            <Button kind={ButtonKind.Ghost} size={ButtonSize.Small} aria-label="Close" onClick={onClose}>
              <Icon name="x" />
            </Button>
          </div>
          <div className="ui-dialog-body">{children}</div>
          {footer ? (
            <div className="ui-dialog-foot">
              {footerNote ? <span className="l">{footerNote}</span> : null}
              {footer}
            </div>
          ) : null}
        </>
      ) : null}
    </dialog>
  );
}

/** A short task over the page. */
export function Dialog(props: Omit<DialogProps, "sheet">) {
  return <Overlay {...props} />;
}

/** A longer task beside the list it belongs to. */
export function SidePanel(props: Omit<DialogProps, "sheet" | "wide">) {
  return <Overlay {...props} sheet />;
}

/** Copy through the host (works under the iframe's clipboard policy), falling back to the browser API. */
export function useClipboard(): (text: string) => Promise<boolean> {
  const { bridge } = useBv();
  return async (text) => {
    try {
      if (bridge) {
        const r = await bridge.clipboard.write(text);
        if (r && (r as { ok?: boolean }).ok !== false) return true;
      }
    } catch {
      /* fall through */
    }
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };
}

/** A read-only value with a Copy button that turns into "Copied". */
export function CopyField({ value, label = "Copy", mono = true }: { value: string; label?: string; mono?: boolean }) {
  const copy = useClipboard();
  const [done, setDone] = useState(false);
  return (
    <div className="ui-affix">
      <input readOnly value={value} className={mono ? "ui-mono" : undefined} aria-label="Value to copy" onFocus={(e) => e.target.select()} />
      <button
        type="button"
        style={done ? { background: "var(--ok-bg)", color: "var(--ok-ink)" } : undefined}
        onClick={async () => {
          if (await copy(value)) {
            setDone(true);
            setTimeout(() => setDone(false), 1800);
          }
        }}
      >
        <Icon name={done ? "check" : "copy"} />
        {done ? "Copied" : label}
      </button>
    </div>
  );
}
