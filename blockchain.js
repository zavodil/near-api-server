const nearApi = require('near-api-js');
const settings = require('./settings');
const api = require('./api');

module.exports = {

    /**
     * @return {string}
     */
    View: async function (recipient, method, params) {
        try {
            const nearRpc = new nearApi.providers.JsonRpcProvider('https://rpc.testnet.near.org');

            const account = new nearApi.Account({provider: nearRpc});
            return await account.viewFunction(
                recipient,
                method,
                params
            );
        } catch (e) {
            return api.reject(e);
        }
    },

    Call: async function (account_id, private_key, attached_tokens, attached_gas, recipient, method, params) {
        try {
            private_key = private_key.replace('"', '');
            //console.log(`${account_id}, ${private_key}, ${attached_tokens}, ${attached_gas}, ${recipient}, ${method}, ${params}`)

            const keyPair = nearApi.utils.KeyPair.fromString(private_key);
            const keyStore = new nearApi.keyStores.InMemoryKeyStore();
            keyStore.setKey("default", account_id, keyPair);

            const near = await nearApi.connect({
                networkId: "default",
                deps: {keyStore},
                masterAccount: account_id,
                nodeUrl: 'https://rpc.testnet.near.org'
            });

            const account = await near.account(account_id);

            return await account.functionCall(
                recipient,
                method,
                params,
                attached_gas,
                attached_tokens);
        } catch (e) {
            return api.reject(e);
        }
    },

    GetMasterAccount: async function () {
        try {
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
        } catch (e) {
            return api.reject(e);
        }
    },

    GetUserAccount: async function (accountId) {
        try {
            const user = require('./user');

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
        } catch (e) {
            return api.reject(e);
        }
    }
};