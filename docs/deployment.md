# Public deployment boundary

The release candidate is a static Vite site for GitHub Pages:

<https://cjbooger.github.io/intent-for-sale-webmcp/>

The Pages workflow runs on pushes to `main` and on manual dispatch. It installs
from the lockfile, typechecks, runs the unit suite, builds `dist/`, and deploys
that artifact using GitHub's Pages/OIDC actions. The workflow does not use
repository secrets or enable any backend, database, payment, or analytics path.

Vite uses `/` for development and test servers and
`/intent-for-sale-webmcp/` for production builds. The Playwright suite therefore
continues to exercise the loopback dev server; the deployed smoke check should
use the public HTTPS URL above after the workflow publishes it.

The site itself remains a client-only demo: state is ephemeral and synthetic,
WebMCP registration is host-dependent, and the staged selection has no external
side effect. GitHub Pages settings, the repository's Pages source, DNS/HTTPS
availability, and browser-host WebMCP behavior are host-owned deployment checks.
