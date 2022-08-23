const { WarpFactory } = require('warp-contracts')
const Arweave = require('arweave')

const fs = require('fs')

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

// create Atomic NFT

const warp = WarpFactory.forMainnet()
const wallet = JSON.parse(fs.readFileSync('./nftowner.json', 'utf-8'))

async function deployBAR() {
  const src = fs.readFileSync('./bar/contract.js', 'utf-8')
  const initState = fs.readFileSync('./bar/state.json', 'utf-8')
  const barOwner = JSON.parse(fs.readFileSync('./barowner.json', 'utf-8'))
  const addr = await arweave.wallets.jwkToAddress(barOwner)

  const { contractTxId } = await warp.createContract.deploy({
    src,
    wallet: barOwner,
    initState
  })
  return contractTxId
}

async function createNft() {
  const src = fs.readFileSync('./dist/contract.js', 'utf-8')
  const addr = await arweave.wallets.jwkToAddress(wallet)

  const initState = JSON.stringify({
    emergencyHaltWallet: addr,
    ticker: "TEST-NFT",
    halted: false,
    pairs: [],
    invocations: [],
    foreignCalls: [],
    balances: {
      [addr]: 10000
    },
    claims: [],
    claimable: [],
    settings: [["isTradeable", true]],
  })
  const { contractTxId } = await warp.createContract.deploy({
    src,
    wallet,
    initState,
    data: { "Content-Type": 'text/html', body: "<h1>Hello World</h1>" }
  })
  return contractTxId
}

async function main() {
  const BAR = await deployBAR()
  const contractTxId = await createNft()

  // // In order to sell an NFT I need to pair a tradeable token with the NFT
  const NFT = await warp.contract(contractTxId).connect(wallet).writeInteraction({
    function: 'addPair',
    pair: BAR
  })

  // // In order to sell an NFT I need to call allow function indicating the amount I want to allow to be sold.
  const allowTx = await warp.contract(contractTxId).connect(wallet).writeInteraction({
    function: 'allow',
    target: contractTxId,
    qty: 100
  })

  //console.log(allowTx)
  // In order to sell an NFT I need to call createOrder function to place the qty I wish to sell in the contract balance.
  console.log(await warp.contract(contractTxId).connect(wallet)
    .setEvaluationOptions({
      internalWrites: true
    })
    .dryWrite({
      function: 'createOrder',
      transaction: allowTx.originalTxId,
      pair: [contractTxId, BAR],
      qty: 100, price: 1
    })
  )
  console.log({ BAR, contractTxId })
}

async function readState(CONTRACT) {
  await warp.contract(CONTRACT)
    .connect(wallet)
    .setEvaluationOptions({
      internalWrites: true,
      allowBigInt: true
    })
    .readState().then(result => console.log(JSON.stringify(result, null, 2)))
}

//main()
//readState('lzc6SOhoEUwCJ4Gcx1lpzkFLm7CFA982QayNFMTyjNg')
//readState('KdssCuw7B2NKAZFlZiRMjs9kVujJXaDWS2K67Q3swcc')
//deployBAR().then(x => console.log('BAR: ', x))