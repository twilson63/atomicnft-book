import { AddPair, CreateOrder, CancelOrder, Halt } from '@verto/component'

const handleComponent = (f) => async (s, a) => ({ state: await f(s, a) })

const functions = {
  transfer, balance, readOutbox,
  addPair: handleComponent(AddPair),
  createOrder: handleComponent(CreateOrder),
  cancelOrder: handleComponent(CancelOrder),
  halt: handleComponent(Halt)
}

export async function handle(state, action) {
  if (action.input.function === 'addPair') {
    const s = await AddPair(state, action)
    return { state: s }
  }
  if (action.input.function === 'createOrder') {
    const resultObj = await CreateOrder(state, action)
    return { state: resultObj.state }
  }

  try {
    const data = state

    //const data = state
    if (Object.keys(functions).includes(action.input.function)) {
      return functions[action.input.function](data, action)
    }
    throw new ContractError('Function is not found!')
  } catch (e) {
    throw new ContractError('could not validate state')
  }
}

function transfer(state, action) {
  const balances = state.balances;
  const input = action.input;
  const caller = action.caller;

  const target = input.target;
  const quantity = input.qty;

  if (!Number.isInteger(quantity) || quantity === undefined) {
    throw new ContractError(
      "Invalid value for quantity. Must be an integer."
    );
  }
  if (!target) {
    throw new ContractError("No target specified.");
  }
  if (quantity <= 0 || caller === target) {
    throw new ContractError("Invalid token transfer.");
  }
  if (balances[caller] < quantity) {
    throw new ContractError(
      "Caller balance not high enough to send " + quantity + " token(s)."
    );
  }

  balances[caller] -= quantity;
  if (target in balances) {
    balances[target] += quantity;
  } else {
    balances[target] = quantity;
  }

  return { state };
}

function balance(state, action) {
  const balances = state.balances;
  const input = action.input;
  const caller = action.caller;

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
      balance: balances[target],
    },
  };
}

async function readOutbox(state, action) {
  const input = action.input;

  // Ensure that a contract ID is passed
  ContractAssert(!!input.contract, "Missing contract to invoke");

  // Read the state of the foreign contract
  const foreignState = await SmartWeave.contracts.readContractState(
    input.contract
  );

  // Check if the foreign contract supports the foreign call protocol and compatible with the call
  ContractAssert(
    !!foreignState.foreignCalls,
    "Contract is missing support for foreign calls"
  );

  // Get foreign calls for this contract that have not been executed
  const calls = foreignState.foreignCalls.filter(
    (element) =>
      element.contract === SmartWeave.contract.id &&
      !state.invocations.includes(element.txID)
  );

  // Run all invocations
  let res = state;

  for (const entry of calls) {
    // Run invocation
    res =
      // @ts-expect-error
      (await handle(res, { caller: input.contract, input: entry.input }))
        .state;
    // Push invocation to executed invocations
    res.invocations.push(entry.txID);
  }

  return { state: res };
}
