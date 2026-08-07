# @inkress/app-kit

Reusable kit for building **Inkress-embedded apps on React Router v7**. It owns the
parts every app re-implements: the embedded session/OAuth handshake, an authenticated
[`@inkress/admin-sdk`](https://www.npmjs.com/package/@inkress/admin-sdk) client in every
loader/action, persistence, webhook verification, and the client provider/hooks over
[`@inkress/app-bridge`](https://github.com/jamlance/app-bridge) +
[`@inkress/storefront-sdk`](https://www.npmjs.com/package/@inkress/storefront-sdk), so an
app author writes features, not plumbing.

This is a private package consumed directly from GitHub (no npm publish).

## Install

Add it to your app as a GitHub dependency:

```jsonc
// package.json
{
  "dependencies": {
    "@inkress/app-kit": "github:jamlance/app-kit",
    "@inkress/app-bridge": "github:jamlance/app-bridge"
  }
}
```

Both `jamlance/app-kit` and its own dependency `jamlance/app-bridge` are **private**
repos, so the installing environment (your machine and CI) must be able to read them
over git. See "Private access" below.

### pnpm 10 note

Both packages ship a `prepare` script that builds `dist` on install. pnpm 10 blocks git
dependencies from running build scripts unless they are allowlisted, so a consuming
project must opt them in:

```yaml
# pnpm-workspace.yaml (or the "pnpm".onlyBuiltDependencies field in package.json)
onlyBuiltDependencies:
  - "@inkress/app-kit"
  - "@inkress/app-bridge"
```

npm and yarn run the `prepare` build without an allowlist.

## Private access

`github:` on a private repo resolves over git, so the client needs read access:

- **SSH**: simplest for local dev if your GitHub SSH key can read the org. Force git to
  rewrite the https form:
  `git config --global url."git@github.com:".insteadOf "https://github.com/"`.
- **HTTPS + token**: a Personal Access Token (classic: `repo` scope; fine-grained:
  Contents read on both repos) via a git credential helper, or in CI:
  `git config --global url."https://${GH_TOKEN}@github.com/".insteadOf "https://github.com/"`.

In CI (e.g. GitHub Actions), expose a token with read access to **both** private repos as
`GH_TOKEN` and install the insteadOf rewrite before the install step.

## Entry points

| Import | Side | Purpose |
|---|---|---|
| `@inkress/app-kit` | iso | Shared types + enums (order-status maps, `Merchant`, `BvTheme`). No secrets. |
| `@inkress/app-kit/server` | **server** | `defineAppKit`, `createInkressServer`, `authenticate.*`, `requireMerchant`, `assertScope`, `loadEnv`, `cspHeaders`, `boundary`, `createWebhookHandler`. |
| `@inkress/app-kit/server/session` | **server** | `SessionStorage` (online tokens): `MemorySessionStorage`, `DrizzleSessionStorage`. |
| `@inkress/app-kit/server/storage` | **server** | `StorageAdapter` (app data) + `createDrizzleStorage`. |
| `@inkress/app-kit/server/tokens` | **server** | `openMerchantTokens` (encrypted offline refresh tokens for webhooks/public). |
| `@inkress/app-kit/server/services` | **server** | `EmailProvider`/`BlobStore`/`NotificationProvider` + AWS defaults. |
| `@inkress/app-kit/client` | client | `BvProvider`, `useBv`, `useToast`, `useConfirm`, `useEmbedNavigate`, `useStorefront`, `bvFetch`. |
| `@inkress/app-kit/styles.css` | client | Design tokens + base styles. |

**Rule:** anything under `/server` is server-only. Importing it from client code leaks the
client secret and admin SDK; the RR7 build will fail (`.server` boundary) and a lint rule
catches it in CI.

## Peer dependencies

Your app provides `react`, `react-dom`, and `react-router` (all v7/v19). The AWS SDK
clients (`@aws-sdk/client-s3` / `-ses` / `-sns`) are optional peers, only needed if you use
the AWS-backed `services` implementations.

## Scaffold

`template/` is a ready-to-copy React Router v7 app wired to app-kit (server bootstrap,
OAuth callback, example routes, Drizzle schema, Dockerfile). Copy it, replace the
`__APP_NAME__` placeholder in `template/package.json`, and start from there.

## Build

`tsup` produces ESM + types for two platforms (a Node server pass and a browser client
pass) matching the `exports` map. `pnpm build` builds locally; the `prepare` script runs
the same build automatically when the package is installed from GitHub.
