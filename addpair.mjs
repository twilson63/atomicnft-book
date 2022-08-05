import { WarpNodeFactory, LoggerFactory } from 'warp-contracts'
import Arweave from 'arweave'
import fs from 'fs'

const wallet = JSON.parse(fs.readFileSync('./wallet.json', 'utf-8'))

const arweave = Arweave.init({
  host: 'localhost',
  port: 1984,
  protocol: 'http'
})

LoggerFactory.INST.logLevel('debug')

const warp = WarpNodeFactory.forTesting(arweave)

const bAR = 'UVAOB8Ta18WV666-FXf301dpGqJrLB3ga7Z5sabcOwE'
const contractID = 'sc-z6t1CgYxOpsSbAmlvCqUtCDxnsi8zvSNQ-BvOqz8'

// addPair
const result = await warp.pst(contractID).connect(wallet).writeInteraction({
  function: 'addPair',
  pair: bAR
})

console.log(result)

// Pair ID = ya1fuTTUH087HTjdRtqID6-4l3KzBgU8DzidWuDUgZM
await arweave.api.get('mine')