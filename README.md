# NEAR API SERVER

Perform blockchain calls with the simple REST API.

Create blockchain accounts, mint NFT, transfer NFT, view NFT owners with the POST/GET requests.

Video Presentation:
 
[![Live App Review 15 - NFT Server Side API](https://img.youtube.com/vi/d71OscmH4cA/0.jpg)](https://youtu.be/d71OscmH4cA)

###### Create a NEAR Testnet Account 

Master account to mint NFT, register palyers, etc. 
Sign up for free: https://wallet.testnet.near.org/create and save your Seed Phrase.

###### Configure API Server

Clone this repo, go to the application folder and edit `near-api-server.config.json` file.

* server_host: `PUBLIC_IP`
* server_port: `PORT`

###### Install Node.JS

`sudo apt-get install -y nodejs`
 
 More details  https://nodejs.org/en/download/package-manager/
 
 Install modules

`npm install`
 
###### Run the app

`node app`

NEAR API server will be available on `http://PUBLIC_IP:PORT`

Init Master Account
---
Simple methods require master account initialization:
 
POST `init`
 ```
 {
    "master_account_id": YOUR_ACCOUNT.testnet",
    "seed_phrase":  "your seed phrase your seed phrase your seed phrase your seed phrase",    
    "nft_contract": "NFT_CONTRACT", 
    "server_host": "PUBLIC_IP",
    "server_port": "PORT",
    "rpc_node": "https://rpc.testnet.near.org"
 }
 ```

`NFT_CONTRACT`: account where you will deploy a contract. You may use `YOUR_ACCOUNT.testnet`

You may optionally specify `private_key` instead of `seed_phrase`


Deploy contract
---

POST `deploy`
```
{
    "account_id": "YOUR_ACCOUNT.testnet",
    "seed_phrase":  "your seed phrase your seed phrase your seed phrase your seed phrase",
    "contract": "nft_simple.wasm"
}
```

`contract` - filename of the wasm binary located in the `/contracts` folder, auto init for `nft_simple.wasm`

You may optionally specify `private_key` instead of `seed_phrase`

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

Batch NFT minting (simple)
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

POST `nft`

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
