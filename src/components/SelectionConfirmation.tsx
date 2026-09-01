import { useEffect, useRef } from "react";
import type { OfferView } from "./types";
import { Panel } from "./Panel";

export function SelectionConfirmation({ selectedOffer, pendingOffer, confirmationSource, onConfirm, onCancel }: { selectedOffer: OfferView | null; pendingOffer: OfferView | null; confirmationSource: "manual_ui" | "webmcp_caller" | null; onConfirm: () => void; onCancel: () => void }) {
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
    if (wasOpenRef.current) previousFocusRef.current?.focus();
    wasOpenRef.current = false;
  }, [pendingOffer]);

  return (
    <Panel title="Staged selection" eyebrow="Requires human confirmation" action={<span className="disclosure-label">NO PURCHASE</span>} className="selection-panel">
      {pendingOffer ? (
        <div className="confirm-box" role="dialog" aria-modal="true" aria-labelledby="selection-confirm-title" aria-describedby="selection-confirm-description" onKeyDown={(event) => { if (event.key === "Escape") onCancel(); }}>
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
