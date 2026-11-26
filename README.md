# dsh-campus-guard

Know which network you are on before a literature run depends on it.

Campus subscriptions are usually tied to the campus network. When the machine switches networks, the
databases quietly stop recognising the institution and every download turns into a paywall. This plugin
records the network that works and warns when you have left it.

| Tool | Purpose |
|---|---|
| `campus_status` | Local interfaces, public egress address, recorded campus prefixes, verdict (`campus`, `off-campus`, `unknown`). |
| `campus_mark` | Record the current egress address as a campus network (run it while access works). |

```sh
dsh plugin add dsh-campus-guard
```

Records live in `$DSH_HOME/campus-guard.json`, keyed by a coarse prefix (`203.0.113.x` → `203.0.113`).
No browser, no dependencies. MIT licensed.
