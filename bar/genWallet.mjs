import Arweave from 'arweave'
import fs from 'fs'

const arweave = Arweave.init({
  host: 'localhost',
  port: 1984,
  protocol: 'http'
})

const wallet = await arweave.wallets.generate()
const addr = await arweave.wallets.jwkToAddress(wallet)
await arweave.api.get(`mint/${addr}/${arweave.ar.arToWinston('100000')}`)

fs.writeFileSync('wallet.json', JSON.stringify(wallet))
console.log('addr: ', addr)