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

const bAR = 'MKcbbRrDED-aI3ojnVXd9DTRY_4DZGOt5dOPHS3HpWk'
const contractID = 'wA0jbG4ZJTO3Tlse_FRHPX_LEGOs_k-J2v9rgj4ufYA'

// addPair
const result = await warp.pst(contractID).connect(wallet).writeInteraction({
  function: 'addPair',
  pair: bAR
})

console.log(result)

// Pair ID = ya1fuTTUH087HTjdRtqID6-4l3KzBgU8DzidWuDUgZM
