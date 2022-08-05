import { WarpNodeFactory, LoggerFactory } from 'warp-contracts'
import Arweave from 'arweave'
import fs from 'fs'

const wallet = JSON.parse(fs.readFileSync('./bar/wallet.json', 'utf-8'))

const arweave = Arweave.init({
  host: 'localhost',
  port: 1984,
  protocol: 'http'
})

const addr = await arweave.wallets.jwkToAddress(wallet)

LoggerFactory.INST.logLevel('error')

const warp = WarpNodeFactory.forTesting(arweave)

const bAR = 'MKcbbRrDED-aI3ojnVXd9DTRY_4DZGOt5dOPHS3HpWk'
const contractID = 'wA0jbG4ZJTO3Tlse_FRHPX_LEGOs_k-J2v9rgj4ufYA'

// Buy NFT
// Step 1 transfer bAR to owner
const txId = await warp.pst(bAR).connect(wallet).writeInteraction({
  function: 'transfer',
  target: '2O8jEY7D0E50OgjwFy_4C4LgXLA_4dd59euHhsilAjg',
  qty: Number(arweave.ar.arToWinston('0.4'))
})
await arweave.api.get('mine')
//const txId = 'Mm2rJfCilcECK_FjEPSAsGOIwBPaEz9bPlCCPI5BE00'
console.log('txId', txId)

// Step 2 createOrder to transfer asset to wallet
const orderId = await warp.pst(contractID).connect(wallet).writeInteraction({
  function: 'createOrder',
  transaction: txId,
  pair: [contractID, bAR],
  price: arweave.ar.arToWinston('0.4')
})

console.log('orderId', orderId)

await arweave.api.get('mine')