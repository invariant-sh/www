# Local evidence fixtures

JSON shaped like Maul schema `0.2`, Holds schema `1`, and Vigil audit events
`v1`. The homepage **Use cases** section renders a fail/hold tape per product.

These are **local fixtures**, not yet copied from GitHub Actions. They match:

- Maul `action-smoke`: `ci/retry_agent.py` under `force_500`
- Holds `examples/deterministic_agent`: `classify-refund-request`
- Vigil `examples/support_agent`: repeated-fingerprint circuit breaker

Replace the files in place when CI publishing lands. Keep `schema_version`
stable so `demo.js` does not need a rewrite.
