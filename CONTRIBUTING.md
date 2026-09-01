# Contributing

Thanks for helping make commercial influence in agent recommendations easier to
inspect.

## Setup

```bash
npm ci
npm run typecheck
npm run test:run
npm run build
npm run test:e2e
```

## Pull requests

- Keep each pull request focused and explain the user-visible outcome.
- Add or update tests when changing schemas, ranking behavior, state transitions, or
  tool registration.
- Preserve the fictional-data and no-purchase disclosures.
- Do not add analytics, credentials, environment files, user tracking, or external
  advertiser calls.
- Treat tool input and advertiser-authored claims as untrusted data.
- Avoid renaming the seven public WebMCP tools without a compatibility plan.

Visual changes should not alter scores, fixtures, state order, or tool behavior. When
a change affects the interface, include a screenshot and verify the manual fallback
at 1280x720 and 1440x900.

## Security-sensitive changes

The prototype is deliberately non-transactional. Do not connect the staged-selection
flow to a purchase, message, account change, or other consequential action without a
trusted user-approval design and a focused security review.
