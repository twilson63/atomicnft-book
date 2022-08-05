import { WarpNodeFactory, LoggerFactory } from 'warp-contracts'
import Arweave from 'arweave'
import fs from 'fs'

const src = fs.readFileSync('./dist/contract.js', 'utf-8')
const wallet = JSON.parse(fs.readFileSync('./wallet.json', 'utf-8'))

const arweave = Arweave.init({
  host: 'localhost',
  port: 1984,
  protocol: 'http'
})

LoggerFactory.INST.logLevel('debug')
const addr = await arweave.wallets.jwkToAddress(wallet)

const warp = WarpNodeFactory.forTesting(arweave)

const bAR = 'UVAOB8Ta18WV666-FXf301dpGqJrLB3ga7Z5sabcOwE'
const contractID = 'sc-z6t1CgYxOpsSbAmlvCqUtCDxnsi8zvSNQ-BvOqz8'

const result = await warp
  .pst(contractID)
  .setEvaluationOptions({
    allowUnsafeClient: true,

  })
  .readState()

// tjm seller
// 9J- buyer

console.log(JSON.stringify(result, null, 2))

