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

const result = await warp
  .pst('FFjC-GrNkvBS5WlN4_kH9ofORcYXF04ivE7YGpN5jok')
  .setEvaluationOptions({
    allowUnsafeClient: true
  })
  .readState()

console.log(result.state)