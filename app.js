#!/usr/bin/env node

'use strict';
const user = require('./user');
const token = require('./token');
const blockchain = require('./blockchain');
const api = require('./api');
const faker = require('faker');

const Hapi = require('@hapi/hapi');
let fs = require('fs');


const settings = JSON.parse(fs.readFileSync(api.CONFIG_PATH, 'utf8'));

const init = async () => {

    const server = Hapi.server({
        port: settings.server_port,
        host: settings.server_host
    });

    function PrecessRequest(request) {
        Object.keys(request.payload).map((key) => {
            switch (request.payload[key]) {
                case "{username}":
                    request.payload[key] = faker.internet.userName().replace(/[^0-9a-z]/gi, '');
                    break;
                case "{color}":
                    request.payload[key] = faker.internet.color();
                    break;
                case "{number}":
                    request.payload[key] = faker.random.number();
                    break;
                case "{word}":
                    request.payload[key] = faker.random.word();
                    break;
                case "{words}":
                    request.payload[key] = faker.random.words();
                    break;
                case "{image}":
                    request.payload[key] = faker.random.image();
                    break;
            }
        });

        return request;
    }

    server.route({
        method: 'GET',
        path: '/',
        handler: () => {
            return api.notify('Welcome to NEAR API! ' +
                (!settings.master_account_id
                    ? "Please initialize your NEAR account in order to use simple nft mint/transfer methods"
                    : `Master Account: ${settings.master_account_id}`));
        }
    });

    server.route({
        method: 'POST',
        path: '/view',
        handler: async (request) => {
            request = PrecessRequest(request);
            return await blockchain.View(request.payload.contract, request.payload.method, request.payload.params);
        }
    });

    server.route({
        method: 'POST',
        path: '/call',
        handler: async (request) => {
            request = PrecessRequest(request);
            let {account_id, private_key, attached_tokens, attached_gas, contract, method, params} = request.payload;
            return await blockchain.Call(account_id, private_key, attached_tokens, attached_gas, contract, method, params);
        }
    });

    server.route({
        method: 'POST',
        path: '/init',
        handler: async (request) => {
            request = PrecessRequest(request);
            let {master_account_id, seed_phrase, private_key, nft_contract, server_host, server_port, rpc_node} = request.payload;

            if(seed_phrase)
                private_key =  (await user.GetKeysFromSeedPhrase(seed_phrase)).secretKey;

            let response = await blockchain.Init(master_account_id, private_key, nft_contract, server_host, server_port, rpc_node);
            if (!response.error) {
                process.on('SIGINT', function () {
                    console.log('Stopping server...');
                    server.stop({ timeout: 1000 }).then(async function () {
                        await server.start();
                    })
                })
            }

            return response;
        }
    });

    server.route({
        method: 'POST',
        path: '/deploy',
        handler: async (request) => {
            request = PrecessRequest(request);
            let {account_id, private_key, seed_phrase, contract} = request.payload;

            if(seed_phrase)
                private_key =  (await user.GetKeysFromSeedPhrase(seed_phrase)).secretKey;

            return await blockchain.DeployContract(account_id, private_key, contract);
        }
    });


    server.route({
        method: 'GET',
        path: '/view_nft/{token_id}',
        handler: async (request) => {
            return await token.ViewNFT(request.params.token_id);
        }
    });

    server.route({
        method: 'POST',
        path: '/view_nft/',
        handler: async (request) => {
            return await token.ViewNFT(request.payload.token_id, request.payload.contract);
        }
    });

    server.route({
        method: 'POST',
        path: '/create_user',
        handler: async (request) => {
            request = PrecessRequest(request);

            const name = (request.payload.name + "." + settings.master_account_id).toLowerCase();
            let account = await user.CreateKeyPair(name);

            let status = await user.CreateAccount(account);

            if (status)
                return {text: `Account ${name} created. Public key: ${account.public_key}`};
            else
                return {text: "Error"};
        }
    });

    server.route({
        method: 'POST',
        path: '/parse_seed_phrase',
        handler: async (request, h) => {
            request = PrecessRequest(request);

            return await user.GetKeysFromSeedPhrase(request.payload.seed_phrase);
        }
    });

    server.route({
        method: 'POST',
        path: '/mint_nft',
        handler: async (request) => {
            let {min, max} = request.payload;

            if (!min || !max)
                min = max = 0;
            let response = [];

            request = PrecessRequest(request);
            for (let i = min; i <= max; i++) {
                const tokenId = request.payload.token_id.replace("{inc}", i);

                let {account_id, private_key, metadata, contract} = request.payload;

                const tx = await token.MintNFT(tokenId, metadata, contract, account_id, private_key);

                if (tx) {
                    if (min === max) {
                        let create_token = await token.ViewNFT(tokenId, account_id);
                        create_token.token_id = tokenId;
                        response.push({token: create_token, tx: tx})
                    } else {
                        response.push({tx: tx})
                    }
                } else {
                    response.push({text: "Error. Check backend logs."});
                }
            }

            return response;
        }
    });

    server.route({
        method: 'POST',
        path: '/transfer_nft',
        handler: async (request, h) => {
            request = PrecessRequest(request);

            let {token_id, receiver_id, enforce_owner_id, memo, contract, owner_private_key} = request.payload;

            const txStatus = await token.TransferNFT(token_id, receiver_id, enforce_owner_id, memo, contract, owner_private_key);

            if (txStatus.error) {
                return txStatus;
            } else if (txStatus.status.Failure) {
                return {error: "Because of some reason transaction was not applied as expected"}
            } else {
                const new_token = await token.ViewNFT(token_id, contract);
                if (!new_token)
                    return api.reject("Token not found");

                new_token.tx = txStatus.transaction.hash;
                return new_token;
            }
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();

