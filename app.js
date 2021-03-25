'use strict';
const user = require('./user');
const token = require('./token');
const blockchain = require('./blockchain');
const settings = require('./settings');
const faker = require('faker');

const Hapi = require('@hapi/hapi');
const bodyParser = require('body-parser');

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
        handler: (request, h) => {
            return 'Hello NEAR API!';
        }
    });

    server.route({
        method: 'POST',
        path: '/view',
        handler: async (request, h) => {
            request = PrecessRequest(request);
            return await blockchain.View(request.payload.contract, request.payload.method, request.payload.params);
        }
    });

    server.route({
        method: 'POST',
        path: '/call',
        handler: async (request, h) => {
            request = PrecessRequest(request);
            let {account_id, private_key, attached_tokens, attached_gas, contract, method, params} = request.payload;
            return await blockchain.Call(account_id, private_key, attached_tokens, attached_gas, contract, method, params);
        }
    });

    server.route({
        method: 'GET',
        path: '/nft/{token_id}',
        handler: async (request, h) => {
            return await token.ViewNFT(request.params.token_id);
        }
    });

    server.route({
        method: 'POST',
        path: '/create_user',
        handler: async (request) => {
            request = PrecessRequest(request);

            const name = (request.payload.name + "." + settings.masterAccountId).toLowerCase();
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
        handler: async (request, h) => {
            let {min, max} = request.payload;

            if (!min || !max)
                min = max = 0;
            let response = [];

            request = PrecessRequest(request);
            for (let i = min; i <= max; i++) {
                const tokenId = request.payload.token_id.replace("{inc}", i);
                const metadata = request.payload.metadata;

                const tx = await token.MintNFT(tokenId, metadata);

                if (tx) {
                    let create_token = await token.ViewNFT(tokenId);
                    create_token.token_id = tokenId;
                    response.push({token: create_token, tx: tx})
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

            const tokenId = request.payload.token_id;
            const receiverId = request.payload.receiver_id;
            const enforceOwnerId = request.payload.enforce_owner_id;
            const memo = request.payload.memo;

            const txStatus = await token.TransferNFT(tokenId, receiverId, enforceOwnerId, memo);

            if(txStatus.error){
                return txStatus;
            }
            else if (txStatus.status.Failure) {
                return {error: "Because of some reason transaction was not applied as expected"}
            } else {
                const new_token = await token.ViewNFT(tokenId);
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