import { StateInterface, ActionInterface, BalanceInterface, ForeignCallInterface } from "./faces";

declare const ContractError: any;
declare const SmartWeave: any;

export async function handle(
  state: StateInterface,
  action: ActionInterface
  // @ts-expect-error
): Promise<{ state: StateInterface; } | { result: BalanceInterface; }> {
  const balances = state.balances;
  const input = action.input;
  const caller = action.caller;

  if (input.function === "mint") {
    const amountToMint = parseInt(SmartWeave.transaction.quantity);
    const target = SmartWeave.transaction.target;

    if (target !== state.reserve) {
      throw new ContractError(
        "Incorrect target. Send tokens to " + state.reserve + " to mint."
      );
    }
    if (!balances[caller]) {
      balances[caller] = amountToMint;
    } else {
      balances[caller] += amountToMint;
    }

    return { state };
  }

  if (input.function === "transfer") {
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

  if (input.function === "readOutbox") {
    // Ensure that a contract ID is passed
    // @ts-expect-error
    ContractAssert(!!input.contract, "Missing contract to invoke");
  
    // Read the state of the foreign contract
    const foreignState = await SmartWeave.contracts.readContractState(
      input.contract
    );
  
    // Check if the foreign contract supports the foreign call protocol and compatible with the call
    // @ts-expect-error
    ContractAssert(
      !!foreignState.foreignCalls,
      "Contract is missing support for foreign calls"
    );
  
    // Get foreign calls for this contract that have not been executed
    const calls: ForeignCallInterface[] = foreignState.foreignCalls.filter(
      (element: ForeignCallInterface) =>
        element.contract === SmartWeave.contract.id &&
        !state.invocations.includes(element.txID)
    );
  
    // Run all invocations
    let res: StateInterface = state;
  
    for (const entry of calls) {
      // Run invocation
      // @ts-expect-error
      res = (await handle(res, { caller: input.contract, input: entry.input })).state;
      // Push invocation to executed invocations
      res.invocations.push(entry.txID);
    }
  
    return { state: res };
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
        balance: balances[target],
      },
    };
  }
}
