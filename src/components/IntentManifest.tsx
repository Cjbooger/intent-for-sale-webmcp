import { Panel, SectionLabel } from "./Panel";

export function IntentManifest({ intent, phase, signalsEnabled, onCreate }: { intent: any; phase: string; signalsEnabled: boolean; onCreate: () => void }) {
  const empty = phase === "EMPTY";
  return <Panel title="Intent manifest" eyebrow={empty ? "Awaiting user intent" : `State ${phase}`} action={<span className="panel-mark">⌁</span>}>
    {empty ? <div className="empty-panel"><p>Give the agent a task and this page will turn it into a structured, auditable intent.</p><button className="outline-button" onClick={onCreate}>Load demo intent</button></div> : <>
      <dl className="manifest-list"><div><dt>Intent</dt><dd>{intent.taskSummary}</dd></div><div><dt>Budget</dt><dd>${intent.budgetMonthlyUsd.toFixed(2)} / month</dd></div><div><dt>Category</dt><dd>AI video generation</dd></div></dl>
      <SectionLabel>Must-have constraints</SectionLabel><ul className="tag-list">{intent.mustHave.map((item: string) => <li key={item}>{item}</li>)}</ul>
      <SectionLabel>Nice-to-have</SectionLabel><ul className="compact-list">{intent.niceToHave.map((item: string) => <li key={item}>{item}</li>)}</ul>
      <div className="manifest-foot"><span>Inferred signals</span><b>{signalsEnabled ? "ON" : "OFF"}</b><small>{signalsEnabled ? "Benign task signals permitted" : "Explicit task data only"}</small></div>
    </>}
  </Panel>;
}
