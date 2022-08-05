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
// yNOtgXlnhVnYkTYm0BQyvKjmje1zMkK5oFJjI6zw4ng
LoggerFactory.INST.logLevel('error')

const warp = WarpNodeFactory.forTesting(arweave)

const bAR = 'UVAOB8Ta18WV666-FXf301dpGqJrLB3ga7Z5sabcOwE'
const contractID = 'sc-z6t1CgYxOpsSbAmlvCqUtCDxnsi8zvSNQ-BvOqz8'

// Buy NFT
// Step 1 transfer bAR to owner
const txId = await warp.pst(bAR).connect(wallet).writeInteraction({
  function: 'transfer',
  target: contractID, // contractID
  qty: Number(arweave.ar.arToWinston('0.4'))
})
await arweave.api.get('mine')
//const txId = 'Mm2rJfCilcECK_FjEPSAsGOIwBPaEz9bPlCCPI5BE00'
console.log('txId', txId)

// Step 2 createOrder to transfer asset to wallet
const orderId = await warp.pst(contractID).connect(wallet).writeInteraction({
  function: 'createOrder',
  transaction: txId,
  pair: [bAR, contractID], // buy, sell
})

console.log('orderId', orderId)

await arweave.api.get('mine')