# The Trading UI Still Does Not Trade: Robinhood MCP Control Plane

On July 14, 2026, `xingai-robinhood-mcp` shipped version `0.7.0`: a small HTTP control-plane API for the private Robinhood operator UI.

The important part is what it does not do. It does not place orders. It does not cancel orders. It does not create a second execution path around the gateway. It gives the UI a stable way to read monitor state, inspect pending approvals, resolve G1 approve/deny decisions, and review the ledger.

## Why This Exists

Before this change, the same information existed in several places:

- CLI commands
- SQLite ledger rows
- read-only shape-check scripts
- signal watcher output

That was enough for engineering drills, but not enough for a private operator screen. A UI needs a stable HTTP contract. It also needs sanitized responses, predictable auth behavior, and one clear answer to a safety question: can this endpoint trade?

For v1, the answer is no.

## The Contract

The control plane now exposes:

- `GET /v1/health`
- `GET /v1/monitor/summary`
- `GET /v1/readonly/snapshot`
- `GET /v1/approvals/pending`
- `GET /v1/approvals/{id}`
- `POST /v1/approvals/{id}/approve`
- `POST /v1/approvals/{id}/deny`
- `GET /v1/ledger/recent`

The approve and deny routes call the same local approval ledger path as the CLI. They resolve a local decision record. They do not call Robinhood `place_*` or `cancel_*`.

## Safety Defaults

The server binds to `127.0.0.1` by default. If it is bound outside loopback, `XINGAI_MCP_CONTROL_TOKEN` is required and clients must use bearer auth.

Responses must not include OAuth tokens, full account numbers, or full account identifiers. If `XINGAI_MCP_TRADE_ENABLED=true`, the monitor summary surfaces that fact as an explicit warning, and the read-only snapshot endpoint can refuse to return data.

That gives us a private UI transport without weakening the gateway model:

- UI reads state through HTTP.
- Gateway keeps G1-G7.
- Trade forwarding still requires the final explicit trade switch.
- Approval remains human-in-the-loop.

## Why This Matters

Agentic trading infrastructure needs boring boundaries. The most dangerous bug is not a syntax error; it is a second path that looks like observability but quietly becomes execution.

This release keeps the control plane boring on purpose. It is a transport layer over existing state, not a broker client.

Implementation was validated with the Robinhood MCP test suite at release time: `103 passed`.

## What Comes Next

The private UI can now wire its Operator Monitor to a real local endpoint. Later versions can add better watcher status, push updates, and richer audit views. The execution boundary should stay the same: no autonomous trading loop, no request-time investment decisions, and no UI path that bypasses gateway approval.
