'use strict';
const user = require('./user');
const token = require('./token');
const settings = require('./settings');

const Hapi = require('@hapi/hapi');
const bodyParser = require('body-parser');

const init = async () => {

    const server = Hapi.server({
        port: 4000,
        host: '95.216.165.53'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return 'Hello World!';
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
        path: '/add_user',
        handler: async (request, h) => {
            const name = request.payload.name + "." + settings.masterAccountId;
            let account = await user.CreateKeyPair(name);

            let status = await user.CreateAccount(account);

            console.log(status);
            if (status)
                return `Account ${name} created. Public key: ${account.public_key}`;
            else
                return "Error";

        }
    });

    server.route({
        method: 'POST',
        path: '/mint_nft',
        handler: async (request, h) => {
            const tokenId = request.payload.token_id;
            const metadata = request.payload.metadata;

            await token.MintNFT(tokenId, metadata);

            return await token.ViewNFT(tokenId);
        }
    });

    server.route({
        method: 'POST',
        path: '/transfer_nft',
        handler: async (request, h) => {
            const tokenId = request.payload.token_id;
            const receiverId = request.payload.receiver_id;
            const enforceOwnerId = request.payload.enforce_owner_id;
            const memo = request.payload.memo;

            await token.TransferNFT(tokenId, receiverId, enforceOwnerId, memo);

            return await token.ViewNFT(tokenId);
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