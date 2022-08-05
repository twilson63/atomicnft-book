// import * as ArLocal from "arlocal";
// import { readFile } from "fs";
// import { join, dirname } from "path";
// import { fileURLToPath } from "url";

import Arweave from "arweave";
import { createContract, readContract } from "smartweave";

const reserve = "BAR-Reserve-BARBARBARBARBARweaveBARBARBARBARBAR";
const testWallet = "pvPWBZ8A5HLpGSEfhEmK1A3PfMgB_an8vVS6L14Hsls";
let wallet = {
  address: "",
  jwk: {}
};
let arweave;
const contractSrc = `export async function handle(state, action) {
  const balances = state.balances;
  const input = action.input;
  const caller = action.caller;
  if (input.function === "mint") {
    const amountToMint = SmartWeave.transaction.quantity;
    const target = SmartWeave.transaction.target;
    if (target !== state.reserve) {
      throw new ContractError("Incorrect target. Send tokens to " + state.reserve + " to mint.");
    }
    if (!balances[caller]) {
      balances[caller] = amountToMint;
    } else {
      balances[caller] += amountToMint;
    }
    return {state};
  }
  if (input.function === "transfer") {
    const target = input.target;
    const quantity = input.qty;
    if (!Number.isInteger(quantity) || quantity === void 0) {
      throw new ContractError("Invalid value for quantity. Must be an integer.");
    }
    if (!target) {
      throw new ContractError("No target specified.");
    }
    if (quantity <= 0 || caller === target) {
      throw new ContractError("Invalid token transfer.");
    }
    if (balances[caller] < quantity) {
      throw new ContractError("Caller balance not high enough to send " + quantity + " token(s).");
    }
    balances[caller] -= quantity;
    if (target in balances) {
      balances[target] += quantity;
    } else {
      balances[target] = quantity;
    }
    return {state};
  }
  if (input.function === "readOutbox") {
    ContractAssert(!!input.contract, "Missing contract to invoke");
    const foreignState = await SmartWeave.contracts.readContractState(input.contract);
    ContractAssert(!!foreignState.foreignCalls, "Contract is missing support for foreign calls");
    const calls = foreignState.foreignCalls.filter((element) => element.contract === SmartWeave.contract.id && !state.invocations.includes(element.txID));
    let res = state;
    for (const entry of calls) {
      res = (await handle(res, {caller: input.contract, input: entry.input})).state;
      res.invocations.push(entry.txID);
    }
    return {state: res};
  }
  if (input.function === "balance") {
    let target;
    if (!input.target) {
      target = caller;
    } else {
      target = input.target;
    }
    const ticker = state.ticker;
    if (typeof target !== "string") {
      throw new ContractError("Must specify target to get balance for.");
    }
    if (typeof balances[target] !== "number") {
      throw new ContractError("Cannot get balance; target does not exist.");
    }
    return {
      result: {
        target,
        ticker,
        balance: balances[target]
      }
    };
  }
}`;

async function runTests() {
  // const arLocal = new ArLocal(1800, false);

  // // Start is a Promise, we need to start it inside an async function.
  // await arLocal.start();

  arweave = new Arweave({
    host: "localhost",
    port: 1984,
    protocol: "http"
    // logging: true
  });

  // Generate Arweave wallet
  wallet.jwk = await arweave.wallets.generate();
  wallet.address = await arweave.wallets.getAddress(wallet.jwk);

  // Add balances to test wallets
  await arweave.api.get(`/mint/${wallet.address}/10000000000000`);

  // // Deploy contract locally
  // const __filename = fileURLToPath(import.meta.url);
  // const __dirname = dirname(__filename);

  // console.log("__filename");

  // const contractSrc = new TextDecoder().decode(
  //   await readFile(join(__dirname, "../dist/contract.js"), err => {
  //     if(err) console.log(err)
  //   })
  // );
  
  const initialState = {
    ticker: "BAR",
    reserve,
    balances: {},
    invocations: []
  };

  const contractID = await createContract(
    arweave,
    wallet.jwk,
    contractSrc,
    JSON.stringify(initialState)
  );

  await mine();

  console.log("INITIALIZED CONTRACT STATE:");
  console.log(await readContract(arweave, contractID));

  await mint(arweave, wallet, contractID);
  console.log("\n\nNEW CONTRACT STATE POST MINT");
  console.log(await readContract(arweave, contractID));

  await transfer(arweave, wallet, contractID);
  console.log("\n\nNEW CONTRACT STATE POST TRANSFER");
  console.log(await readContract(arweave, contractID));

  // After we are done with our tests, let's close the connection.
  // await arLocal.stop();
}

async function mint(arweave, wallet, contract) {
  const tx = await arweave.createTransaction({
    data: "1234",
    target: reserve,
    quantity: arweave.ar.arToWinston("1")
  }, wallet.jwk);

  tx.addTag("App-Name", "SmartWeaveAction");
  tx.addTag("App-Version", "0.3.0");
  tx.addTag("Contract", contract);
  tx.addTag("Input", `{"function":"mint"}`);

  await arweave.transactions.sign(tx, wallet.jwk);
  await arweave.transactions.post(tx);
  await mine();
}

async function transfer(arweave, wallet, contract) {
  const tx = await arweave.createTransaction({
    data: "1234",
  }, wallet.jwk);

  tx.addTag("App-Name", "SmartWeaveAction");
  tx.addTag("App-Version", "0.3.0");
  tx.addTag("Contract", contract);
  tx.addTag("Input", `{"function":"transfer", "target":"${testWallet}", "qty":1000}`);

  await arweave.transactions.sign(tx, wallet.jwk);
  await arweave.transactions.post(tx);
  await mine();
}

async function mine() {
  await arweave.api.get("mine");
}


runTests();