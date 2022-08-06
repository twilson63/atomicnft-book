import { WarpNodeFactory, LoggerFactory } from 'warp-contracts'
import Arweave from 'arweave'
import fs from 'fs'

const src = fs.readFileSync('./dist/contract.js', 'utf-8')
const wallet = JSON.parse(fs.readFileSync('./wallet.json', 'utf-8'))

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'httpx'
})

LoggerFactory.INST.logLevel('debug')
//const addr = await arweave.wallets.jwkToAddress(wallet)

const warp = WarpNodeFactory.memCached(arweave)

const bAR = 'UVAOB8Ta18WV666-FXf301dpGqJrLB3ga7Z5sabcOwE'
const contractID = 'zoMuqIBzl4c5ZD5Spy6i9sVQ7Wy9bAuJEBeMPJwe8pc'

const result = await warp
  .pst(contractID)
  .setEvaluationOptions({
    allowUnsafeClient: true,

  })
  .readState()

// tjm seller
// 9J- buyer

console.log(JSON.stringify(result, null, 2))

