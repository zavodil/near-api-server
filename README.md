# NEAR REST API SERVER

> Interact with the NEAR blockchain using a simple REST API.

---

## Requirements

- [NEAR Account](https://docs.near.org/docs/develop/basics/create-account) _(with access to private key or seed phrase)_
- [Node.js](https://nodejs.org/en/download/package-manager/)
- [npm](https://www.npmjs.com/get-npm) or [Yarn](https://yarnpkg.com/getting-started/install)
- API request tool such as [Postman](https://www.postman.com/downloads/)

## Setup

1. Clone repository

```bash
git clone git@github.com:near-examples/near-api-server.git
```

2. Install dependencies

```bash
npm install
```

3. Configure `near-api-server.config.json`

Default settings:

```json
{
  "server_host": "localhost", // IP address for server
  "server_port": 3000, // server port
  "rpc_node": "https://rpc.testnet.near.org", // connected NEAR network (testnet, mainnet, or betanet)
  "allow_rpc_update": false // determines if you can update rpc node address via init route
}
```

4. Start server

```bash
node app
```

---

## Overview

_Click on a route for more information and examples_

### Contracts

| Route                | Method | Description                            |
| -------------------- | ------ | -------------------------------------- |
| [`/deploy`](#deploy) | POST   | Deploys a smart contract on NEAR.      |
| [`/view`](#view)     | POST   | Performs a smart contract view call.   |
| [`/call`](#call)     | POST   | Performs a smart contract change call. |

### Utils

| Route                                      | Method | Description                                                          |
| ------------------------------------------ | ------ | -------------------------------------------------------------------- |
| [`/init`](#init)                           | POST   | sets up the master account and updates `near-api-server-config.json` |
| [`/create_user`](#create_user)             | POST   | Creates a NEAR account and stores credentials in /storage            |
| [`/parse_seed_phrase`](#parse_seed_phrase) | POST   | displays public and private key pair from a given seed phrase        |

### NFT Example Contract

| Route                            | Method | Description                                     |
| -------------------------------- | ------ | ----------------------------------------------- |
| [`/mint_nft`](#mint_nft)         | POST   | Mints an NFT on deployed contract.              |
| [`/transfer_nft`](#transfer_nft) | POST   | Transfers NFT ownership to a specified account. |
| [`/view_nft`](#view_nft)         | POST   | View details of an NFT.                         |

---

# Contracts

## `/deploy`

**Method:** **`POST`**

_Deploys a smart contract to the NEAR blockchain based on the wasm file located in `/contracts` folder._

| Param                            | Description                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| `account_id`                     | _Account id that you will be deploying the contract to._                             |
| `seed_phrase` _OR_ `private_key` | _Seed phrase OR private key of the account id above._                                |
| `contract`                       | _wasm file of compiled contract located in the `/contracts` folder of this project._ |

_**Note:** Use [`near login`](https://docs.near.org/docs/tools/near-cli#near-login) to save your key pair to your local machine._

Example:

```
{
    "account_id": "YOUR_ACCOUNT.testnet",
    "seed_phrase":  "seed phrase for account_id above goes here",
    "contract": "nft_simple.wasm"
}
```

---

## `/view`

**Method:** **`POST`**

_Performs a smart contract view call._

| Param      | Description                                                                               |
| ---------- | ----------------------------------------------------------------------------------------- |
| `contract` | _Account id of the smart contract you are calling._                                       |
| `method`   | _Name of the public method on the contract you are calling._                              |
| `params`   | _Arguments the method of the contract takes. Pass an empty object if no args are needed._ |

Example:

```
{
    "contract": "inotel.pool.f863973.m0",
    "method": "get_accounts",
    "params": {"from_index": 0, "limit": 100}
}
```

---

## `/call`

**Method:** **`POST`**

_Performs a smart contract call that changes state._

| Param                            | Description                                                                                                           |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `account_id`                     | _Account id that will be performing the call and will be charged for gas and attached tokens / deposit._              |
| `seed_phrase` _OR_ `private_key` | _Seed phrase OR private key of the account id above._                                                                 |
| `contract`                       | _Account id of the smart contract you will be calling._                                                               |
| `method`                         | _Public method on the smart contract that you will be calling._                                                       |
| `params`                         | _Arguments the method of the contract takes. Pass an empty object if no args are needed._                             |
| `attached_gas`                   | _Amount of gas you will be attaching to the call in [TGas](https://docs.near.org/docs/concepts/gas#thinking-in-gas)._ |
| `attached_tokens`                | _Amount of tokens to be sent to the contract you are calling in yoctoNEAR (10^-24 NEAR)._                             |

_**Note:** Use [`near login`](https://docs.near.org/docs/tools/near-cli#near-login) to save your key pair to your local machine._

Example:

```
{
    "account_id": "YOUR_ACCOUNT.testnet",
    "private_key": "YOUR_PRIVATE_KEY",
    "contract": "inotel.pool.f863973.m0",
    "method": "ping",
    "params": {},
    "attached_gas": "100000000000000",
    "attached_tokens": "0"
}

```

---

# Utils

## `/init`

**Method:** **`POST`**

_Configures master account for use with "simple method" NFT examples._

| Param                            | Description                                                                                                             |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `master_account_id`              | _Master account that has full access to the NFT contract below_                                                         |
| `seed_phrase` _OR_ `private_key` | _Seed phrase OR private key of the account id above._                                                                   |
| `nft_contract`                   | _Contract account that has NFT contract deployed to it_                                                                 |
| `server_host`                    | _Public IP address for your API server (localhost is default)_                                                          |
| `server_port`                    | _(Port your API server will listen on)_                                                                                 |
| `rpc_node`                       | _[Network](https://docs.near.org/docs/concepts/networks) your server will be running on (testnet, mainnet, or betanet)_ |

_**Note:** Use [`near login`](https://docs.near.org/docs/tools/near-cli#near-login) to save your key pair to your local machine._

Example:

```
{
   "master_account_id": "example.testnet",
   "seed_phrase":  "seed phrase for master_account_id goes here",
   "nft_contract": "nft-contract.example.testnet",
   "server_host": "localhost",
   "server_port": 3000,
   "rpc_node": "https://rpc.testnet.near.org"
}
```

### `/create_user`

**Method:** **`POST`**

_Creates a NEAR account using initialized master account and saves to `/storage` directory_

```
{
    "name" : "james"
}
```

### `/parse_seed_phrase`

**Method:** **`POST`**

_Converts seed phrase into public / private key pair._

Example:

```
{
    "seed_phrase" : "your seed phrase your seed phrase your seed phrase your seed phrase"
}
```

---

## NFTs

### `/mint_nft`

**Method:** **`POST`**

_Mints a new NFT for specified contract._

### Standard NFT Minting

| Param                            | Description                                            |
| -------------------------------- | ------------------------------------------------------ |
| `token_id`                       | _ID for new token you are minting_                     |
| `metadata`                       | _Metadata for the new token as a string._              |
| `account_id`                     | _Account ID for the new token owner._                  |
| `seed_phrase` _OR_ `private_key` | _Seed phrase OR private key for the NFT contract._     |
| `nft_contract`                   | _Account ID for the NFT contract your are minting on._ |

_**Note:** Use [`near login`](https://docs.near.org/docs/tools/near-cli#near-login) to save your key pair to your local machine._

Example:

```
{
    "token_id": "EXAMPLE-TOKEN",
    "metadata": "",
    "account_id": "YOUR_ACCOUNT.testnet",
    "private_key": "YOUR_PRIVATE_KEY",
    "contract": "nft.example.near",
}
```

### Simple NFT Minting

_Requires [`/init`](#init) configuration with master account._

Example:

```
{
    "token_id": "007",
    "metadata": "Golden Eye"
}
```

### Batch NFT minting (simple)

_Requires [`/init`](#init) configuration with master account._

Example: 

```
{
    "token_id": "test_{inc}",
    "metadata": "",
    "min": 21,
    "max": 23
}
```

This will create 3 NFTs: `test_21`, `test_22` and `test_23`.


## Transfer NFT

### Transfer NFT (simple)

> Transfer NFT from specified `contract` on behalf of provided `enforce_owner_id` signed with `owner_private_key`.

POST `transfer_nft`

```
{
    "token_id": "007",
    "receiver_id": "james.YOUR_ACCOUNT.testnet",
    "enforce_owner_id": "YOUR_ACCOUNT.testnet",
    "memo": "Welcome gift"
}
```

### Generic Transfer NFT

POST `transfer_nft`

```
{
    "token_id": "007",
    "receiver_id": "james.YOUR_ACCOUNT.testnet",
    "enforce_owner_id": "YOUR_ACCOUNT.testnet",
    "memo": "Welcome gift",
    "owner_private_key": "YOUR_PRIVATE_KEY",
    "contract": "nft.something.near"
}
```

## View NFT

### View NFT (simple)

GET `nft/{token_id}`

Receive information about NFT

### Generic view NFT

POST `nft`

```
{
	"token_id": "test_123",
	"contract": "nft.something.near"
}
```

---

### Faker data

If some value equals to the following tag then value will be filled with the random value:

- {username}
- {number}
- {word}
- {words}
- {image}
- {color}

Video Presentation:

[![Live App Review 15 - NFT Server Side API](https://img.youtube.com/vi/d71OscmH4cA/0.jpg)](https://youtu.be/d71OscmH4cA)
