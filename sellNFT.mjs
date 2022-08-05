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

const contract = await warp.pst(contractID).connect(wallet)
// sellNFT
// const tokenTx = await contract.writeInteraction({
//   function: 'transfer',
//   target: contractID,
//   qty: 1
// })

// await arweave.api.get('mine')

const orderResult = contract.writeInteraction({
  function: 'createOrder',
  transaction: 'k_4dMwlW7UCE3ZnLGo5ZwPpsdYv-oUc7X7Pb1493tJQ',
  pair: [contractID, bAR],
  price: arweave.ar.arToWinston('0.4')
})

await arweave.api.get('mine')
console.log(orderResult)
// Pair ID = ya1fuTTUH087HTjdRtqID6-4l3KzBgU8DzidWuDUgZM
