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

const warp = WarpNodeFactory.forTesting(arweave)

const result = await warp
  .pst('D5fL2OjA_Y-ihuFodMGRw2ptQmZKqJZRoXy36zC6UGE')
  .readState()

console.log(result)