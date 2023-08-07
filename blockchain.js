const nearApi = require('near-api-js');
const api = require('./api');
const fs = require('fs');
const fetch = require('node-fetch');
const {getNetworkFromRpcNode} = require("./api");

const settings = JSON.parse(fs.readFileSync(api.CONFIG_PATH, 'utf8'));

module.exports = {
    /**
     * @return {string}
     */
    GetSignUrl: async function (account_id, method, params, deposit, gas, receiver_id, meta, callback_url, network) {
        try {
            if(!network)
                network = "mainnet";
            const deposit_value = typeof deposit == 'string' ? deposit : nearApi.utils.format.parseNearAmount('' + deposit);
            const actions = [method === '!transfer' ? nearApi.transactions.transfer(deposit_value) : nearApi.transactions.functionCall(method, Buffer.from(JSON.stringify(params)), gas, deposit_value)];
            const keypair = nearApi.utils.KeyPair.fromRandom('ed25519');
            const provider = new nearApi.providers.JsonRpcProvider({url: 'https://rpc.' + network + '.near.org'});
            const block = await provider.block({finality: 'final'});
            const txs = [nearApi.transactions.createTransaction(account_id, keypair.publicKey, receiver_id, 1, actions, nearApi.utils.serialize.base_decode(block.header.hash))];
            const newUrl = new URL('sign', 'https://wallet.' + network + '.near.org/');
            newUrl.searchParams.set('transactions', txs.map(transaction => nearApi.utils.serialize.serialize(nearApi.transactions.SCHEMA, transaction)).map(serialized => Buffer.from(serialized).toString('base64')).join(','));
            newUrl.searchParams.set('callbackUrl', callback_url);
            if (meta)
                newUrl.searchParams.set('meta', meta);
            return newUrl.href;
        } catch (e) {
            return api.reject(e);
        }
    },

    /**
     * @return {string}
     */
    View: async function (recipient, method, params, rpc_node, headers) {
        try {
            let rpc = rpc_node || settings.rpc_node;
            const nearRpc = new nearApi.providers.JsonRpcProvider({url: rpc});

            const account = new nearApi.Account({
                    provider: nearRpc,
                    networkId: getNetworkFromRpcNode(rpc),
                    signer: recipient,
                    headers: (typeof headers !== undefined) ? headers : {}
                },
                recipient);
            return await account.viewFunction(
                recipient,
                method,
                params
            );
        } catch (e) {
            return api.reject(e);
        }
    },

    Init: async function (master_account_id, master_key, nft_contract, server_host, server_port, rpc_node) {
        try {
            const new_settings = settings;
            if (master_account_id) new_settings.master_account_id = master_account_id;
            if (master_key) new_settings.master_key = master_key;
            if (nft_contract) new_settings.nft_contract = nft_contract;
            if (server_host) new_settings.server_host = server_host;
            if (server_port) new_settings.server_port = server_port;
            if (rpc_node) new_settings.rpc_node = rpc_node;

            await fs.promises.writeFile(api.CONFIG_PATH, JSON.stringify({
                ...new_settings
            }));

            return api.notify("Settings updated.");
        } catch (e) {
            return api.reject(e);
        }
    },

    GetBalance: async function (account_id) {
        try {
            const body = {
                jsonrpc: '2.0',
                id: "dontcare",
                method: "query",
                params: {
                    request_type: "view_account",
                    finality: "final",
                    account_id: account_id
                }
            };

            return fetch(settings.rpc_node, {
                method: 'post',
                body: JSON.stringify(body),
                headers: {'Content-Type': 'application/json'}
            })
                .then(res => res.json())
                .then(json => {
                    if (json.error)
                        return api.reject(json.error.data);

                    return json.result.amount
                });
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

    Call: async function (account_id, private_key, attached_tokens, attached_gas, recipient, method, params, network, rpc_node, headers) {
        try {
            const account = await this.GetAccountByKey(account_id, private_key, network, rpc_node, headers);

            return await account.functionCall({
                contractId: recipient,
                methodName: method,
                args: params,
                gas: attached_gas,
                attachedDeposit: attached_tokens
            });
        } catch (e) {
            return api.reject(e);
        }
    },

    GetMasterAccount: async function () {
        try {
            const keyPair = nearApi.utils.KeyPair.fromString(settings.master_key);
            const keyStore = new nearApi.keyStores.InMemoryKeyStore();
            keyStore.setKey("testnet", settings.master_account_id, keyPair);

            const near = await nearApi.connect({
                networkId: "testnet",
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
            keyStore.setKey("testnet", account.account_id, keyPair);

            const near = await nearApi.connect({
                networkId: "testnet",
                deps: {keyStore},
                masterAccount: account.account_id,
                nodeUrl: settings.rpc_node
            });

            return await near.account(account.account_id);
        } catch (e) {
            return api.reject(e);
        }
    },

    GetAccountByKey: async function (account_id, private_key, network, rpc_node, headers) {
        try {
            network = network || "testnet";
            rpc_node = rpc_node || settings.rpc_node;

            private_key = private_key.replace('"', '');

            const keyPair = nearApi.utils.KeyPair.fromString(private_key);
            const keyStore = new nearApi.keyStores.InMemoryKeyStore();
            keyStore.setKey(network, account_id, keyPair);

            const near = await nearApi.connect({
                networkId: network,
                deps: {keyStore},
                masterAccount: account_id,
                nodeUrl: rpc_node,
                headers: (typeof headers !== undefined) ? headers : {}
            });

            return await near.account(account_id);
        } catch (e) {
            return api.reject(e);
        }
    }
};
