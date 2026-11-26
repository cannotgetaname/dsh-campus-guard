import { extractIp, judge, judgePool, localAddresses, prefixOf } from '../lib/network.js'

let passed = 0
const failures = []
const check = (name, condition, detail = '') => {
  if (condition) { passed += 1; console.log(`  ok   ${name}`) }
  else { failures.push(name); console.log(`  FAIL ${name} ${detail}`) }
}

console.log('# prefix')
check('ipv4 /16', prefixOf('202.113.69.46') === '202.113')
check('ipv4 edge', prefixOf('10.0.0.1') === '10.0')
check('ipv6 groups', prefixOf('2001:da8:215::1') === '2001:da8')
check('empty', prefixOf('') === null)
check('garbage', prefixOf('not-an-ip') === null)

console.log('# judge')
check('no record is unknown', judge('202.113.1.1', []) === 'unknown')
check('missing address', judge(null, ['202.113']) === 'unknown')
check('matching prefix is campus', judge('202.113.69.46', ['202.113']) === 'campus')
check('other prefix is off-campus', judge('123.150.1.1', ['202.113']) === 'off-campus')

console.log('# pool')
check('any matching prefix is campus', judgePool(['123.150.1.1', '202.113.69.46'], ['202.113']) === 'campus')
check('no matching prefix is off-campus', judgePool(['123.150.1.1'], ['202.113']) === 'off-campus')
check('empty pool is unknown', judgePool([], ['202.113']) === 'unknown')
check('unrecorded pool is unknown', judgePool(['202.113.1.1'], []) === 'unknown')

console.log('# egress parsing')
check('plain ip', extractIp('202.113.69.46') === '202.113.69.46')
check('decorated ip', extractIp('当前 IP：123.150.255.253 来自于：中国 天津') === '123.150.255.253')
check('no ip', extractIp('nope') === null)

console.log('# interfaces')
const list = localAddresses({
  lo: [{ family: 'IPv4', address: '127.0.0.1', internal: true }],
  eth0: [{ family: 'IPv4', address: '192.168.1.5', internal: false }],
  docker0: [{ family: 'IPv4', address: '172.17.0.1', internal: false }],
  wlan0: [{ family: 'IPv6', address: 'fe80::1', internal: false }],
})
check('skips loopback and docker', list.length === 1)
check('keeps the real interface', list[0].interface === 'eth0')
check('computes the prefix', list[0].prefix === '192.168')

console.log(`\ncampus-guard tests: ${passed}/${passed + failures.length} passed`)
if (failures.length) process.exitCode = 1
