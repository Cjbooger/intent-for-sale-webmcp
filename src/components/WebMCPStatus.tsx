import type { WebMcpStatus } from "../webmcp/types";

export function WebMCPStatus({ status }: { status: WebMcpStatus }) {
  const supported = Boolean(status?.supported);
  const registered = Boolean(status?.registered);
  const label = registered ? "WebMCP active" : supported ? "WebMCP available" : "WebMCP unavailable";
  const detail = registered ? `${status.toolsRegistered} tools registered` : status.error ? status.error : supported ? "registration pending" : "manual fallback enabled";
  return <div className={`webmcp-status ${registered ? "is-active" : supported ? "is-available" : "is-off"}`} role="status" aria-label={`${label}. ${detail}`}><span className="status-led" aria-hidden="true" /><div className="status-copy"><strong>{label}</strong><small><b>MODEL CONTEXT</b>{detail}</small></div></div>;
}
