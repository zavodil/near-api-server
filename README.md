# NEAR API SERVER

Perform blockchain calls with the simple REST API.

Create blockchain accounts, mint NFT, transfer NFT, view NFT owners with the POST/GET requests.

Video Presentation:
 
[![Live App Review 15 - NFT Server Side API](https://img.youtube.com/vi/d71OscmH4cA/0.jpg)](https://youtu.be/d71OscmH4cA)

## Install Guide

###### Install NEAR CLI

`npm install -g near-cli`

More details https://www.npmjs.com/package/near-cli

###### Create a NEAR Testnet Account 

Master account to mint NFT, register palyers, etc. 
Sign up for free: https://wallet.testnet.near.org/create

###### Set up blockchain account on a server

`near login`

Follow provided link and grant an access using the web wallet, then comeback to and enter your account name. 

###### Create NFT contract

1. Create account for nft contract `near create-account nft.YOUR_ACCOUNT.testnet --masterAccount YOUR_ACCOUNT.testnet`

2. Download the [nft_simple contract](https://github.com/near/core-contracts/blob/nft-simple/nft-simple/res/nft_simple.wasm) by cloning `https://github.com/near/core-contracts/tree/nft-simple/nft-simple`

3. Deploy contract to the blockchain `near deploy nft.YOUR_ACCOUNT.testnet --wasmFile=/root/PATH_TO_THE_FILE/nft_simple.wasm`

4. Initialize your contract `near call nft.YOUR_ACCOUNT.testnet new '{"owner_id": "YOUR_ACCOUNT.testnet"}' --accountId YOUR_ACCOUNT.testnet`

###### Configure API Server

Clone this repo, go to the application folder and edit config.js file.

* masterAccountId: `YOUR_ACCOUNT.testnet`
* exports.masterKey: account private key. Copy from `/root/.near-credentials/default` or call `/parse_seed_phrase` from NEAR API  
* nftContract: `nft.YOUR_ACCOUNT.testnet`
* server_host: `PUBLIC_IP`
* server_port: `PORT`

Install modules

`npm install`

###### Install Node.JS

`sudo apt-get install -y nodejs`
 
 More details  https://nodejs.org/en/download/package-manager/
 
###### Run the app

`node app`

NEAR API server will be available on `http://PUBLIC_IP:PORT`

## Available methods

Send requests using Postman/Insomnia/etc

Generic view
---

POST `view`
```
{
    "contract": "inotel.pool.f863973.m0",
    "method": "get_accounts",
    "params": {"from_index": 0, "limit": 100}
}
```

Generic call
---

POST `call`
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

Deploy contract
---

POST `call`
```
{
    "account_id": "YOUR_ACCOUNT.testnet",
    "private_key": "YOUR_PRIVATE_KEY",	
    "contract": "nft_simple.wasm"
}
```

`contract` - filename of the wasm binary located in the `/contracts` folder, auto init for `nft_simple.wasm`

Mint NFT Token (simple)
---

POST `mint_nft`
```
{
    "token_id": "007",
    "metadata": "Golden Eye"	
}
```
Original token owner is `YOUR_ACCOUNT.testnet`

Generic NFT minting 
---
```
{
    "token_id": "test_123",
    "metadata": "",
    "account_id": "YOUR_ACCOUNT.testnet",
    "private_key": "YOUR_PRIVATE_KEY",	
    "contract": "nft.something.near",	    
}
```

Mints NFT using specified `contract` on behalf of provided `account_id`.

Batch NFT minting 
---
```
{
    "token_id": "test_{inc}",
    "metadata": "",    
    "min": 21,
    "max": 23
}
```

This will create 3 NFTs: `test_21`, `test_22` and `test_23`

Create user
---
POST `create_user`

```
{
    "name" : "james"
}
```
Transfer NFT (simple)
---

POST `transfer_nft`
```
{
    "token_id": "007",
    "receiver_id": "james.YOUR_ACCOUNT.testnet",
    "enforce_owner_id": "YOUR_ACCOUNT.testnet",
    "memo": "Welcome gift"	
}
```

Generic Transfer NFT
---

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
Transfer NFT from specified `contract` on behalf of provided `enforce_owner_id` signed with `owner_private_key`.

View NFT (simple)
---

GET `nft/{token_id}`

Receive information about NFT

Generic view NFT
---
```
{
	"token_id": "test_123",
	"contract": "nft.something.near"
}
```

Transfer NFT
---
POST `transfer_nft`
```
{
    "token_id": "007",
    "receiver_id": "james.YOUR_ACCOUNT.testnet",
    "enforce_owner_id": "YOUR_ACCOUNT.testnet",
    "memo": "Welcome gift"	
}
```

Parse Seed Phrase
---
POST `parse_seed_phrase`
```
{
    "seed_phrase" : "your seed phrase your seed phrase your seed phrase your seed phrase"
}
```

Faker data
---
If some value equals to the following tag then value will be filled with the random value:

* {username}
* {number}
* {word}
* {words}
* {image}
* {color}
