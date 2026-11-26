/**
 * dsh-campus-guard — tell the user which network they are on, whether it is the one
 * whose subscription works, and let them record a campus network after a good run.
 */

import { egressAddresses, judgePool, loadStore, localAddresses, prefixOf, rememberPrefix, storePath } from './lib/network.js'

export const name = 'dsh-campus-guard'
export const inject = ['tools']

const text = value => [{ type: 'text', text: value }]

function guard(fn) {
  return async args => {
    try {
      return JSON.parse(JSON.stringify(await fn(args)))
    } catch (error) {
      throw new Error(`[${error.name || 'Error'}] ${error.message}`)
    }
  }
}

export function apply(ctx) {
  ctx.tools.register({
    name: 'campus_status',
    description:
      'Report the network the machine is on: local interfaces, the public egress address, and whether '
      + 'that address matches a campus network recorded earlier. Use it before a literature run when a '
      + 'database might stop recognising the subscription.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => text(value.summary),
    },
    execute: guard(async () => {
      const addresses = localAddresses()
      const egress = await egressAddresses()
      const store = loadStore()
      const verdict = judgePool(egress, store.prefixes)
      const lines = [
        `verdict: ${verdict}${verdict === 'unknown' ? ' (no campus network recorded yet; run campus_mark while it works)' : ''}`,
        `egress: ${egress.length ? egress.map(ip => `${ip} (${prefixOf(ip)})`).join(', ') : 'unavailable'}`,
        `recorded campus prefixes: ${store.prefixes.length ? store.prefixes.join(', ') : 'none'}`,
        `local addresses: ${addresses.map(item => `${item.interface} ${item.address}`).join(', ') || 'none'}`,
        `store: ${storePath()}`,
      ]
      if (verdict === 'off-campus') {
        lines.push('note: subscription access usually needs the campus network or a CARSI sign-in')
      }
      return { verdict, egress, prefixes: store.prefixes, addresses, summary: lines.join('\n') }
    }),
  })

  ctx.tools.register({
    name: 'campus_mark',
    description:
      'Record the current public egress address as a campus network, so campus_status can tell later '
      + 'whether the machine has left it. Run it while database access is known to work.',
    parameters: {
      type: 'object',
      properties: {
        label: { type: 'string', description: 'Optional note, for example the campus name.' },
      },
      additionalProperties: false,
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => text(value.summary),
    },
    execute: guard(async args => {
      const egress = await egressAddresses()
      if (!egress.length) throw new Error('could not determine the public egress address; check the network first')
      let store = loadStore()
      for (const address of egress) store = rememberPrefix(prefixOf(address))
      return {
        prefixes: store.prefixes,
        summary: `recorded ${egress.map(ip => `${prefixOf(ip)}.x`).join(', ')} as campus${args.label ? ` (${args.label})` : ''}; ${store.prefixes.length} prefix(es) known`,
      }
    }),
  })
}
