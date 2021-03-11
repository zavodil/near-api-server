const nearApi = require('near-api-js');
const settings = require('./settings');
const user = require('./user');

module.exports = {

    /**
     * @return {string}
     */
    View: async function (recipient, method, params) {
        const nearRpc = new nearApi.providers.JsonRpcProvider('https://rpc.testnet.near.org');

        const account = new nearApi.Account({ provider: nearRpc });
        return await account.viewFunction(
            recipient,
            method,
            params
        );
    },

    GetMasterAccount: async function () {
        const keyPair = nearApi.utils.KeyPair.fromString(settings.masterKey);
        const keyStore = new nearApi.keyStores.InMemoryKeyStore();
        keyStore.setKey("default", settings.masterAccountId, keyPair);

        const near = await nearApi.connect({
            networkId: "default",
            deps: {keyStore},
            masterAccount: settings.masterAccountId,
            nodeUrl: 'https://rpc.testnet.near.org'
        });

        return await near.account(settings.masterAccountId);
    },

    GetUserAccount: async function (accountId) {
        const account_raw = await user.GetAccount(accountId);
        const account = JSON.parse(account_raw);

        const keyPair = nearApi.utils.KeyPair.fromString(account.private_key);
        const keyStore = new nearApi.keyStores.InMemoryKeyStore();
        keyStore.setKey("default", account.account_id, keyPair);

        const near = await nearApi.connect({
            networkId: "default",
            deps: {keyStore},
            masterAccount: account.account_id,
            nodeUrl: 'https://rpc.testnet.near.org'
        });

        return await near.account(account.account_id);
    }


};