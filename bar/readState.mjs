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
const addr = await arweave.wallets.jwkToAddress(wallet)
console.log(addr)
LoggerFactory.INST.logLevel('error')

const warp = WarpNodeFactory.forTesting(arweave)

const result = await warp
  .pst('_1ZXFB2Llu0ljjiBz5jmZz8pZrmJP3AvCZKe5D_YZYo')
  .readState()

//console.log(result)