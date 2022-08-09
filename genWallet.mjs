import Arweave from 'arweave'
import fs from 'fs'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

const wallet = await arweave.wallets.generate()
const addr = await arweave.wallets.jwkToAddress(wallet)
await arweave.api.get(`mint/${addr}/${arweave.ar.arToWinston('100')}`)

fs.writeFileSync('wallet.json', JSON.stringify(wallet))
console.log('addr: ', addr)