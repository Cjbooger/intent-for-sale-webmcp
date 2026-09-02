import { useEffect, useRef } from "react";
import type { OfferView } from "./types";
import { Panel } from "./Panel";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[contenteditable=true]",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function SelectionConfirmation({ selectedOffer, pendingOffer, confirmationSource, onConfirm, onCancel }: { selectedOffer: OfferView | null; pendingOffer: OfferView | null; confirmationSource: "manual_ui" | "webmcp_caller" | null; onConfirm: () => void; onCancel: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (pendingOffer) {
      if (!wasOpenRef.current) previousFocusRef.current = document.activeElement as HTMLElement | null;
      wasOpenRef.current = true;
      confirmButtonRef.current?.focus();
      return;
    }
    if (wasOpenRef.current) {
      const previousFocus = previousFocusRef.current;
      if (previousFocus?.isConnected) previousFocus.focus();
      previousFocusRef.current = null;
    }
    wasOpenRef.current = false;
  }, [pendingOffer]);

  useEffect(() => {
    if (!pendingOffer) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!first || !last) return;

      if (!dialog.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, pendingOffer]);

  return (
    <Panel title="Staged selection" eyebrow="Requires human confirmation" action={<span className="disclosure-label">NO PURCHASE</span>} className="selection-panel">
      {pendingOffer ? (
        <div ref={dialogRef} className="confirm-box" role="dialog" aria-modal="true" aria-labelledby="selection-confirm-title" aria-describedby="selection-confirm-description">
          <span className="confirm-icon" aria-hidden="true">!</span>
          <strong id="selection-confirm-title">Stage {pendingOffer.name}?</strong>
          <p id="selection-confirm-description">This only records a fictional demo choice. It cannot subscribe, purchase, or contact anyone.</p>
          <div className="confirm-actions"><button className="outline-button" onClick={onCancel}>Cancel</button><button ref={confirmButtonRef} className="confirm-button" onClick={onConfirm}>Confirm selection</button></div>
        </div>
      ) : selectedOffer ? (
        <div className="selected-box"><span className="selected-mark">✓</span><strong>{selectedOffer.name} staged</strong><p>Confirmed for demonstration only. No purchase occurred.</p></div>
      ) : (
        <div className="selection-empty"><span>⌛</span><p>Choose a recommendation to stage it. The agent must receive explicit confirmation before this action.</p></div>
      )}
      <div className="selection-meta"><span>Current stage <b>{selectedOffer ? "CONFIRMED" : "NONE"}</b></span><span>Source <b>{selectedOffer ? confirmationSource === "manual_ui" ? "Manual confirmation" : "WebMCP caller declaration" : "—"}</b></span></div>
    </Panel>
  );
}
