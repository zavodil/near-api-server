const nearApi = require('near-api-js');
const api = require('./api');
const fs = require('fs');

const settings = JSON.parse(fs.readFileSync(api.CONFIG_PATH, 'utf8'));

module.exports = {
    /**
     * @return {string}
     */
    View: async function (recipient, method, params) {
        try {
            const nearRpc = new nearApi.providers.JsonRpcProvider(settings.rpc_node);

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

    Init: async function (master_account_id, master_key, nft_contract, server_host, server_port, rpc_node){
        try{
          if(!settings.allow_rpc_update && rpc_node !== settings.rpc_node)
              return api.reject("RPC update restricted. Please update config if you have access");

            await fs.promises.writeFile(api.CONFIG_PATH, JSON.stringify({
                ...settings,
                "master_account_id": master_account_id,
                "master_key": master_key,
                "nft_contract": nft_contract,
                "server_host": server_host,
                "server_port": server_port,
                "rpc_node": rpc_node
            }));

            return api.notify("Settings updated.");
        } catch (e) {
            return api.reject(e);
        }
    },

    DeployContract: async function (account_id, private_key, contract_file) {
        try {
            const path = `contracts/${contract_file}`;
            if (!fs.existsSync(path))
                return api.reject("Contract not found");

            const account = await this.GetAccountByKey(account_id, private_key);

            const data = [...fs.readFileSync(path)];
            const txs = [nearApi.transactions.deployContract(data)];

            let res = await account.signAndSendTransaction(account_id, txs);

            if (contract_file === "nft_simple.wasm")
                await this.Call(account_id, private_key, 0, "100000000000000",
                    account_id, "new", {"owner_id": account_id});

            return res;
        } catch (e) {
            return api.reject(e);
        }
    },

    Call: async function (account_id, private_key, attached_tokens, attached_gas, recipient, method, params) {
        try {
            const account = await this.GetAccountByKey(account_id, private_key);

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
            const keyPair = nearApi.utils.KeyPair.fromString(settings.master_key);
            const keyStore = new nearApi.keyStores.InMemoryKeyStore();
            keyStore.setKey("default", settings.master_account_id, keyPair);

            const near = await nearApi.connect({
                networkId: "default",
                deps: {keyStore},
                masterAccount: settings.master_account_id,
                nodeUrl: settings.rpc_node
            });

            return await near.account(settings.master_account_id);
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
                nodeUrl: settings.rpc_node
            });

            return await near.account(account.account_id);
        } catch (e) {
            return api.reject(e);
        }
    },

    GetAccountByKey: async function (account_id, private_key) {
        try {
            private_key = private_key.replace('"', '');

            const keyPair = nearApi.utils.KeyPair.fromString(private_key);
            const keyStore = new nearApi.keyStores.InMemoryKeyStore();
            keyStore.setKey("default", account_id, keyPair);

            const near = await nearApi.connect({
                networkId: "default",
                deps: {keyStore},
                masterAccount: account_id,
                nodeUrl: settings.rpc_node
            });

            return await near.account(account_id);
        } catch (e) {
            return api.reject(e);
        }
    }
};
