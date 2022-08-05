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

LoggerFactory.INST.logLevel('error')

const warp = WarpNodeFactory.forTesting(arweave)

const initState = JSON.stringify({
  ticker: 'ATOMIC-NFT',
  balances: {
    'dxSa6PQlQCqOHBY2BXh10GFDJVzbtq1oqkO80nF6IzY': 1
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
})

console.log(result)

