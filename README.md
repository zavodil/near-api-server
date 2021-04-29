# NEAR REST API SERVER

> Interact with the NEAR blockchain using a simple REST API.

---

## Overview

_Click on a route for more information and examples_

| Route                                      | Method | Description                                                          |
| ------------------------------------------ | ------ | -------------------------------------------------------------------- |
| **CONTRACTS**                              |        |                                                                      |
| [`/deploy`](#deploy)                       | POST   | Deploys a smart contract on NEAR.                                    |
| [`/view`](#view)                           | POST   | Performs a smart contract view call.                                 |
| [`/call`](#call)                           | POST   | Performs a smart contract change call.                               |
|                                            |        |                                                                      |
| **UTILS**                                  |        |                                                                      |
| [`/init`](#init)                           | POST   | sets up the master account and updates `near-api-server-config.json` |
| [`/create_user`](#create_user)             | POST   | Creates a NEAR account and stores credentials in /storage            |
| [`/parse_seed_phrase`](#parse_seed_phrase) | POST   | displays public and private key pair from a given seed phrase        |
|                                            |        |                                                                      |
| **NFT Ex. CONTRACT**                       |        |                                                                      |
| [`/mint_nft`](#mint_nft)                   | POST   | Mints an NFT on deployed contract.                                   |
| [`/transfer_nft`](#transfer_nft)           | POST   | Transfers NFT ownership to a specified account.                      |
| [`/view_nft`](#view_nft)                   | POST   | View details of an NFT.                                              |

---

## Requirements

- [NEAR Account](https://docs.near.org/docs/develop/basics/create-account) _(with access to private key or seed phrase)_
- [Node.js](https://nodejs.org/en/download/package-manager/)
- [npm](https://www.npmjs.com/get-npm) or [Yarn](https://yarnpkg.com/getting-started/install)
- API request tool such as [Postman](https://www.postman.com/downloads/)

---

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
  "server_host": "localhost",
  "server_port": 3000,
  "rpc_node": "https://rpc.testnet.near.org",
  "allow_rpc_update": false
}
```

_**Note:** `allow_rpc_update` determines if this param can be changed via `/init` route._

4. Start server

```bash
node app
```

---

# Contracts

## `/deploy`

> _Deploys a smart contract to the NEAR blockchain based on the wasm file located in `/contracts` folder._

**Method:** **`POST`**

| Param                            | Description                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| `account_id`                     | _Account id that you will be deploying the contract to._                             |
| `seed_phrase` _OR_ `private_key` | _Seed phrase OR private key of the account id above._                                |
| `contract`                       | _wasm file of compiled contract located in the `/contracts` folder of this project._ |

_**Note:** Use [`near login`](https://docs.near.org/docs/tools/near-cli#near-login) to save your key pair to your local machine._

Example:

```json
{
  "account_id": "example.testnet",
  "seed_phrase": "witch collapse practice feed shame open despair creek road again ice least",
  "contract": "nft_simple.wasm"
}
```

Example Response:

```json
{
  "status": {
    "SuccessValue": ""
  },
  "transaction": {
    "signer_id": "example.testnet",
    "public_key": "ed25519:Cgg4i7ciid8uG4K5Vnjzy5N4PXLst5aeH9ApRAUA3y8U",
    "nonce": 5,
    "receiver_id": "example.testnet",
    "actions": [
      {
        "DeployContract": {
          "code": "hT9saWV3aok50F8JundSIWAW+lxOcBOns1zenB2fB4E="
        }
      }
    ],
    "signature": "ed25519:3VrppDV8zMMRXErdBJVU9MMbbKZ4SK1pBZqXoyw3oSSiXTeyR2W7upNhhZPdFJ1tNBr9h9SnsTVeBm5W9Bhaemis",
    "hash": "HbokHoCGcjGQZrz8yU8QDqBeAm5BN8iPjaSMXu7Yp2KY"
  },
  "transaction_outcome": {
    "proof": [
      {
        "hash": "Dfjn2ro1dXrPqgzd5zU7eJpCMKnATm295ceocX73Qiqn",
        "direction": "Right"
      },
      {
        "hash": "9raAgMrEmLpL6uiynMAi9rykJrXPEZN4WSxLJUJXbipY",
        "direction": "Right"
      }
    ],
    "block_hash": "B64cQPDNkwiCcN3SGXU2U5Jz5M9EKF1hC6uDi4S15Fb3",
    "id": "HbokHoCGcjGQZrz8yU8QDqBeAm5BN8iPjaSMXu7Yp2KY",
    "outcome": {
      "logs": [],
      "receipt_ids": ["D94GcZVXE2WgPGuaJPJq8MdeEUidrN1FPkuU75NXWm7X"],
      "gas_burnt": 1733951676474,
      "tokens_burnt": "173395167647400000000",
      "executor_id": "example.testnet",
      "status": {
        "SuccessReceiptId": "D94GcZVXE2WgPGuaJPJq8MdeEUidrN1FPkuU75NXWm7X"
      }
    }
  },
  "receipts_outcome": [
    {
      "proof": [
        {
          "hash": "3HLkv7KrQ9LPptX658QiwkFagv8NwjcxF6ti15Een4uh",
          "direction": "Left"
        },
        {
          "hash": "9raAgMrEmLpL6uiynMAi9rykJrXPEZN4WSxLJUJXbipY",
          "direction": "Right"
        }
      ],
      "block_hash": "B64cQPDNkwiCcN3SGXU2U5Jz5M9EKF1hC6uDi4S15Fb3",
      "id": "D94GcZVXE2WgPGuaJPJq8MdeEUidrN1FPkuU75NXWm7X",
      "outcome": {
        "logs": [],
        "receipt_ids": [],
        "gas_burnt": 1733951676474,
        "tokens_burnt": "173395167647400000000",
        "executor_id": "example.testnet",
        "status": {
          "SuccessValue": ""
        }
      }
    }
  ]
}
```

---

## `/view`

> _Performs a smart contract view call._

**Method:** **`POST`**

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

> _Performs a smart contract call that changes state._

**Method:** **`POST`**

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

---

## `/init`

> _Configures `near-api-server.config.json` and creates a master account that stores credentials in this file. This allows for "simple methods" to be called where you won't have to pass as many parameters, primarily the master account id and private key or seed phrase._

**Method:** **`POST`**

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

```json
{
  "master_account_id": "example.testnet",
  "seed_phrase": "seed phrase for master_account_id goes here",
  "nft_contract": "nft-contract.example.testnet",
  "server_host": "localhost",
  "server_port": 3000,
  "rpc_node": "https://rpc.testnet.near.org"
}
```

Example Response:

```json
{
  "text": "Settings updated."
}
```

---

## `/create_user`

> _Creates a NEAR account using initialized master account and saves to `/storage` directory._

**Method:** **`POST`**

```
{
    "name" : "james"
}
```

_Requires [`/init`](#init) configuration with master account._

---

## `/parse_seed_phrase`

> _Converts seed phrase into public / private key pair._

**Method:** **`POST`**

Example:

```
{
    "seed_phrase" : "witch collapse practice feed shame open despair creek road again ice least"
}
```

Example Response:

```
{
    "seedPhrase": "witch collapse practice feed shame open despair creek road again ice least",
    "secretKey": "ed25519:41oHMLtYygTsgwDzaMdjWRq48Sy9xJsitJGmMxgA9A7nvd65aT8vQwAvRdHi1nruPP47B6pNhW5T5TK8SsqCZmjn",
    "publicKey": "ed25519:Cgg4i7ciid8uG4K5Vnjzy5N4PXLst5aeH9ApRAUA3y8U"
}
```

---

# NFTs

---

## `/mint_nft`

> _Mints a new NFT for specified contract._

**Method:** **`POST`**

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

---

## `/transfer_nft`

> _Transfers ownership of NFT from specified contract on behalf of provided `enforece_owner_if` signed with `owner_private_key`._

**Method:** **`POST`**

### Standard Transfer NFT

| Param               | Description                                               |
| ------------------- | --------------------------------------------------------- |
| `token_id`          | _Token ID of the token being transferred_                 |
| `receiver_id`       | _Account ID taking ownership of the NFT_                  |
| `enforce_owner_id`  | _Account ID for the account that currently owns the NFT._ |
| `memo`              | _Optional message to new token holder._                   |
| `owner_private_key` | _Private key of the `enforce_owner_id`._                  |
| `nft_contract`      | _NFT contract that the token being transferred is on._    |

_**Note:** Use [`near login`](https://docs.near.org/docs/tools/near-cli#near-login) to save your key pair to your local machine._

Example:

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

### Simple Transfer NFTs

> _Requires [`/init`](#init) configuration with master account._

| Param              | Description                                               |
| ------------------ | --------------------------------------------------------- |
| `token_id`         | _Token ID of the token being transferred_                 |
| `receiver_id`      | _Account ID taking ownership of the NFT_                  |
| `enforce_owner_id` | _Account ID for the account that currently owns the NFT._ |
| `memo`             | _Optional message to new token holder._                   |

Example:

```
{
    "token_id": "007",
    "receiver_id": "james.YOUR_ACCOUNT.testnet",
    "enforce_owner_id": "YOUR_ACCOUNT.testnet",
    "memo": "Welcome gift"
}
```

---

## `view_nft`

### Simple View NFT

> _Receive detailed information about NFT._

GET `view_nft/{token_id}`

### Standard View NFT

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
