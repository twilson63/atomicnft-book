import { WarpNodeFactory, LoggerFactory } from 'warp-contracts'
import Arweave from 'arweave'
import fs from 'fs'

const wallet = JSON.parse(fs.readFileSync('./wallet.json', 'utf-8'))

const arweave = Arweave.init({
  host: 'localhost',
  port: 1984,
  protocol: 'http'
})

LoggerFactory.INST.logLevel('error')

const warp = WarpNodeFactory.forTesting(arweave)

const bAR = '5kv0gVf9LrWCDmqvidJlPW4T0Nsll6uYdC7YvvdUzaI'
const contractID = 'MLpPmOFlreTUI_-hZZ2BvJhukD3kL7vLLwLU8_adF7s'

// addPair
const result = await warp.pst(contractID).connect(wallet).writeInteraction({
  function: 'addPair',
  pair: bAR
})

console.log(result)

// Pair ID = ya1fuTTUH087HTjdRtqID6-4l3KzBgU8DzidWuDUgZM
