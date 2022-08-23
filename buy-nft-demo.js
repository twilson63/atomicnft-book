const { WarpFactory } = require('warp-contracts')
const fs = require('fs')
const { Async } = require('crocks')

const wallet = JSON.parse(fs.readFileSync('./nftowner.json', 'utf-8'))
const barowner = JSON.parse(fs.readFileSync('./barowner.json', 'utf-8'))

const addr = '9A7WiTOdLvHig9gLjEdSHRhayENNLuu21ZNMir785CY'

// create an NFT Contract
const context = {
  barowner,
  wallet,
  addr,
  warp: WarpFactory.forMainnet(),
  BAR: 'HGoudalT17-QwVoE_Vkp2atD4ST38QY8AFl3ZiL9ARc',
  contract: 'YeR0RL292OLmuC4aQlT4Mioj6aJ27cyUXVknm1rJqR8',
  allowTx: 'MVaaCmGNWOzsy280sq9Nz3oVnJiKw5_D45Ioyt9BbgA'
}

//Async.fromPromise(createNft)(context)
Async.of(context)
  //.chain(Async.fromPromise(transfer))
  //.chain(Async.fromPromise(addPair))
  //.chain(Async.fromPromise(allow))
  .chain(Async.fromPromise(createOrder))

  // .chain(createOrder)
  // transfer balance from owner to contract
  // addPair BAR to NFT
  // allow on BAR
  // createOrder on NFT
  .chain(Async.fromPromise(readState))
  .fork(e => console.log(e), ctx => null)

async function createOrder(ctx) {
  const { warp, barowner, BAR, contract, allowTx } = ctx
  await warp.contract(contract).connect(barowner)
    .setEvaluationOptions({
      internalWrites: true
    })
    .dryWrite({
      function: 'createOrder',
      transaction: allowTx,
      pair: [BAR, contract],
      qty: 100,
      price: 1
    })
  return ctx
}

async function allow(ctx) {
  const { originalTxId } = await ctx.warp.contract(ctx.BAR).connect(ctx.barowner).writeInteraction({
    function: 'allow',
    target: ctx.contract,
    qty: 1
  })
  return { ...ctx, allowTx: originalTxId }
}

async function addPair(ctx) {
  await ctx.warp.contract(ctx.contract).connect(ctx.wallet).writeInteraction({
    function: 'addPair',
    pair: ctx.BAR
  })
  return ctx
}

async function transfer(ctx) {
  await ctx.warp.contract(ctx.contract).connect(ctx.wallet).writeInteraction({
    function: 'transfer',
    target: ctx.contract,
    qty: 1000
  })
  return ctx
}

async function readState(ctx) {
  await ctx.warp.contract(ctx.contract)
    .setEvaluationOptions({
      internalWrites: true
    })
    .readState().then(result => console.log(JSON.stringify(result, null, 2)))
  return ctx
}

async function createNft(ctx) {
  const src = fs.readFileSync('./dist/contract.js', 'utf-8')
  const { addr, wallet, warp } = ctx
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
  ctx.contract = contractTxId
  return ctx
}
