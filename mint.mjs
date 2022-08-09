import { WarpNodeFactory, LoggerFactory } from 'warp-contracts'
import Arweave from 'arweave'
import fs from 'fs'

const src = fs.readFileSync('./dist/contract.js', 'utf-8')
const wallet = JSON.parse(fs.readFileSync('./wallet.json', 'utf-8'))

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

const addr = await arweave.wallets.jwkToAddress(wallet)

LoggerFactory.INST.logLevel('error')

const warp = WarpNodeFactory.memCached(arweave)

const initState = JSON.stringify({
  ticker: 'DATAFI-NFT',
  balances: {
    [addr]: 1
  },
  invocations: [],
  emergencyHaltWallet: '',
  halted: false,
  pairs: [],
  usedTransfers: [],
  foreignCalls: []
})

const result = await warp.createContract.deploy({
  src,
  wallet,
  initState
}, true) // use bundlr

console.log(result)

