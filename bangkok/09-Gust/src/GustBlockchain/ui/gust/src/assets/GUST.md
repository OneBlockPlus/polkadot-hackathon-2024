## Gustavo Smart Contract DSL - Developer Documentation

### Overview

Gustavo is a domain-specific language (DSL) for writing smart contracts on the Gustavo blockchain. The language is designed with simplicity in mind, aiming to be token-agnostic and capable of handling native external requests through built-in HTTP functions. Gustavo contracts are written using a straightforward syntax, focusing on usability for developers while abstracting complexities commonly associated with blockchain development.

### Key Features

- **Token-Agnostic**: Contracts are not tied to any specific token, making them flexible in handling various assets.
- **Native HTTP Requests**: Gustavo allows contracts to interact with external services directly, enabling developers to create more interactive and feature-rich contracts.
- **Native Oracle Access**: Contracts can natively access on-chain oracles to retrieve trusted data.
- **No Loops**: To prevent on-chain computation overload, Gustavo does not support looping structures. Complex logic should be handled off-chain and only essential operations should be executed on-chain.
- **Simple Types and Operations**: Gustavo supports fundamental data types and operations to maintain simplicity and accessibility.

### Gustavo Language Semantics

#### Naming Conventions
- **Contracts**: Always written in PascalCase.
- **Variables**: Always camelCase and strongly typed.
- **State Management**: Contracts must include a `State` object to manage on-chain state, along with an `initState` method to set initial state values.

#### Types

- **number**: Unsigned 256-bit integer.
- **string**: UTF-8 encoded string.
- **list**: A collection of items (e.g., list<number>).
- **boolean**: True or false values.
- **dict**: Key-value pair data structure.
- **account**: Represents blockchain accounts.
- **token**: Represents tokens for payments or other interactions.

#### Operations

- **Mathematical Operations**: Standard operations (addition, subtraction, multiplication, division).
- **Conditional Statements**: Supports `if`, `else`, and `assert` for flow control and error handling.
- **No Loops**: Loops are not supported to avoid long-running on-chain computations. All loop-based logic should be handled off-chain.

#### Contract Structure

Gustavo contracts follow a strict structure, comprising state definitions, initialization, and methods.

```gustavo
Contract <ContractName> accepts <comma-separated-token-addresses>:
State:
<type>(<variableName>);
<type>(<variableName>);
<type>(<variableName>);

initState<type(argument1), type(argument2), type(argument3)>:
State.<variableName> = <argument1>;
State.<variableName> = <argument2>;
State.<variableName> = <argument3>;

<functionName><comma-separated-typed-arguments> <accessibility(Open by default)>:
//Function logic here
```

#### Function Accessibility

- **Open**: The function is publicly accessible. This is the default.
- **Close**: The function can only be accessed internally.

#### State Management

- **State Object**: All contracts must have a `State` object where the contract’s state variables are stored. These can be updated and accessed during the contract’s execution.
 
```gustavo
State.<stateVariable> = <newValue>;
```

### Built-ins

1. **State**:
   Accesses the contract's state variables. Examples:
   ```gustavo
   State.variableName = value;
   ```

2. **Contr**:
   Provides data about the current contract.
   - `Contr.acc`: The account of the contract.
   - `Contr.deployer`: The account of the contract deployer.
   - `Contr.blockTime`: The amount of tokens available to maintain contract activity (based on developer-paid fees).

3. **CallBy**:
   Provides information about the caller (the account invoking the contract).
   - `CallBy.acc`: The caller's account.
   - `CallBy.tokens`: A list of tokens the caller holds with a balance greater than 0.
   - `CallBy.balance(<tokenAddress>)`: Returns the caller's balance of a specified token.
   - `CallBy.use`: A list of tokens the caller allows for transactions (defaults to all).
   - `CallBy.pay(<token>, <receiver>, <amount>)`: Sends tokens to a specified receiver.

4. **Oracle**:
   Allows the contract to retrieve data from the native Gust oracle.
   - `Oracle.get(<dataPointName>)`: Retrieves data from the oracle.

### External Requests

Gustavo supports native HTTP requests, allowing contracts to interact with external data sources or APIs directly. Requests are created as functions and stipulate a callback function in the signature.

Example:
```gustavo
requestExternalData<string(url), function(response)>:
// Code to handle HTTP request and response
```

### Example Contract

Below is a simple contract example demonstrating Gustavo’s syntax and features.

```gustavo
Contract PaidIncrementor accepts <token1>:
State:
string(contractName);
dict<account(), number()>(accountToNumber);
number(currentNumber);
number(fee);

initState<string(givenContractName)>:
State.contractName = givenContractName;
State.currentNumber = 0;

incrementAndPay:
// Check if the user has an available balance and allowed token
if checkAvailable<token1>() && checkAllowed<token1>():
CallBy.pay(token1, Contr.deployer, State.fee);
State.currentNumber++;
State.accountToNumber[CallBy.acc] = State.currentNumber;

checkAvailable<token(tokenToCheck)><Close>:
boolean(result) = CallBy.balance(tokenToCheck) > State.fee;
return result;

checkAllowed<token(tokenToCheck)><Close>:
boolean(result) = tokenToCheck in CallBy.use;
return result;
```

### Additional Features

1. **Contract Lifecycle Management**: Although not detailed in the specification, you can implement lifecycle hooks such as `onDeploy` or `onDestroy` to manage contract setup and teardown.

2. **Events**: Gustavo could support contract events to emit data for off-chain consumption. Example:
   ```gustavo
   event<string(eventName), dict(eventData)>;
   ```

3. **Error Handling**: While `assert` is used for checks, introducing structured error messages and error codes would enhance developer experience.

4. **Gas/Execution Cost Considerations**: Transactions are gasless to the caller, however developers are charged block time and will need to maintain a positive block time balance for the contract or else the contract will become inactive and uncallable if the block time balance is below the execution threshold. 

### Conclusion

Gustavo is a streamlined, developer-friendly smart contract language that prioritizes simplicity and usability while offering the necessary tools to create robust, token-agnostic contracts. With its native support for external requests and oracle access, it is well-suited for a wide variety of decentralized applications.
