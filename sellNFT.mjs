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

const bAR = 'UVAOB8Ta18WV666-FXf301dpGqJrLB3ga7Z5sabcOwE'
const contractID = 'sc-z6t1CgYxOpsSbAmlvCqUtCDxnsi8zvSNQ-BvOqz8'

const contract = await warp.pst(contractID).connect(wallet)
// sellNFT
const tokenTx = await contract.writeInteraction({
  function: 'transfer',
  target: contractID,
  qty: 1
})
//const tokenTx = 'G0I0-mFpFfU0qn1g32eYQz1LMLx7IxCKANnVxyYvDpE'
console.log('tokenTx', tokenTx)

await arweave.api.get('mine')

const orderResult = await contract.writeInteraction({
  function: 'createOrder',
  transaction: tokenTx,
  pair: [contractID, bAR],
  price: Number(arweave.ar.arToWinston('0.4'))
})

await arweave.api.get('mine')

console.log('orderResult', orderResult)
// Pair ID = ya1fuTTUH087HTjdRtqID6-4l3KzBgU8DzidWuDUgZM
