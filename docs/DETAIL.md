# Campus network guard

Campus subscriptions follow the network. This plugin answers two questions cheaply: which network is
the machine on, and is that still the network whose subscription works.

## Tools

| Tool | Purpose |
|---|---|
| `campus_status` | Interfaces, public egress, recorded prefixes, verdict. |
| `campus_mark` | Record the current egress prefix as campus. |

## Behaviour

- Egress is read from public echo services, with two fallbacks.
- A recorded prefix is the first two octets of the IPv4 address (or two groups of an IPv6 address).
- `unknown` means nothing has been recorded yet; run `campus_mark` while access is known to work.

## Limits

- A coarse prefix cannot distinguish a campus NAT from another network inside the same block.
- The plugin does not log in to any portal and does not change the network.
