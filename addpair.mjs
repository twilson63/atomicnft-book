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

const bAR = 'D5fL2OjA_Y-ihuFodMGRw2ptQmZKqJZRoXy36zC6UGE'
const contractID = 'FFjC-GrNkvBS5WlN4_kH9ofORcYXF04ivE7YGpN5jok'

// addPair
const result = await warp.pst(contractID).connect(wallet).writeInteraction({
  function: 'addPair',
  pair: bAR
})

console.log(result)

// Pair ID = ya1fuTTUH087HTjdRtqID6-4l3KzBgU8DzidWuDUgZM
