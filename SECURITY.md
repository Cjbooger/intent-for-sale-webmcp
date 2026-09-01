# Security policy

## Supported code

Security fixes target the latest commit on `main`.

## Reporting a vulnerability

Please use the repository's **Security** tab to submit a private vulnerability report
through GitHub Security Advisories. Do not open a public issue for an unpatched
vulnerability or include credentials, personal data, or exploit data in a public
thread.

Include the affected file or tool, reproduction steps, expected impact, and any
suggested mitigation. Reports about a deployed fork should also identify the host and
deployment configuration because this repository ships only a static client.

## Prototype boundary

INTENT//FOR SALE is a deterministic fictional simulation:

- no backend, authentication, payment, analytics, or advertiser connection;
- no application data fetch, browser persistence, or user-account storage;
- no purchase, subscription, message, transfer, or external mutation;
- strict bounded tool schemas and React text rendering;
- advertiser claims explicitly marked as untrusted content.

The `userConfirmed` field on `stage_demo_selection` is a declaration made by the tool
caller. It is sufficient only because the resulting record is reversible, ephemeral,
fictional, and incapable of an external side effect. It must not be reused as proof of
identity or consent in a consequential application. Such an application should use a
short-lived, single-use approval capability bound to the exact user, session, and
action.

Browser support for `document.modelContext`, origin handling, and tool-caller
authorization is owned by the WebMCP host. Production HTTPS and security headers are
owned by the deployment platform and must be reviewed separately.
