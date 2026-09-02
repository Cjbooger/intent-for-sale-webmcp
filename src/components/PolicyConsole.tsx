import type { PolicyView } from "./types";
import { Panel } from "./Panel";

export function PolicyConsole({ policy, phase, onApply, onPolicyChange }: { policy: PolicyView; phase: string; onApply: () => void; onPolicyChange: (policy: Partial<PolicyView>) => void }) {
  const disabled = phase === "EMPTY" || phase === "INTENT_READY" || phase === "AUCTION_COMPLETE";
  return <Panel title="Policy console" eyebrow={`Policy v${policy.sponsorshipMode === "block" ? "3.0" : "2.4"}`} action={<span className="policy-state">{policy.sponsorshipMode === "block" ? "CLEAN" : "OPEN"}</span>} className="policy-panel">
    <div className="policy-row"><label htmlFor="sponsor-mode">Sponsorship</label><select id="sponsor-mode" value={policy.sponsorshipMode} disabled={disabled} onChange={(e) => onPolicyChange({ sponsorshipMode: e.target.value })}><option value="allow_labeled">Allow labeled</option><option value="deprioritize">Deprioritize</option><option value="block">Block</option></select></div>
    <div className="policy-row"><label htmlFor="weight">Maximum sponsor weight <output>{Math.round(policy.maximumSponsorWeight * 100)}%</output></label><input id="weight" type="range" min="0" max="40" value={Math.round(policy.maximumSponsorWeight * 100)} disabled={disabled} onChange={(e) => onPolicyChange({ maximumSponsorWeight: Number(e.target.value) / 100 })} /></div>
    <div className="policy-row"><label htmlFor="signals">Inferred signals</label><button id="signals" className={`toggle ${policy.allowInferredSignals ? "is-on" : ""}`} aria-pressed={policy.allowInferredSignals} disabled={disabled} onClick={() => onPolicyChange({ allowInferredSignals: !policy.allowInferredSignals })}>{policy.allowInferredSignals ? "ON" : "OFF"}</button></div>
    <div className="policy-row"><label htmlFor="constraint-mode">Constraint mode</label><select id="constraint-mode" value={policy.hardConstraintMode} disabled={disabled} onChange={(e) => onPolicyChange({ hardConstraintMode: e.target.value })}><option value="warn">Warn on conflicts</option><option value="strict">Strict requirements</option></select></div>
    <div className="policy-row"><label>Reason codes required</label><span className="yes-value">{policy.requireReasonCodes ? "YES" : "NO"}</span></div>
    <button className="clean-room-button" disabled={disabled} onClick={onApply}>⌬ Apply clean-room policy</button>
  </Panel>;
}
