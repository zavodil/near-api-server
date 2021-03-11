const nearApi = require('near-api-js');
const settings = require('./settings');
const fs = require('fs').promises;

module.exports = {
    CreateKeyPair: async function (name) {
        const keypair = nearApi.utils.KeyPair.fromRandom('ed25519');

        const account =
            {
                account_id: name,
                public_key: keypair.publicKey.toString(),
                private_key: keypair.secretKey
            };

        return account;
    },

    /**
     * @return {string}
     */
    GetFileName: function (account_id) {
        return `storage/${account_id}.json`;
    },

    SaveKeyPair: async function (account) {
        const filename = this.GetFileName(account.account_id);
        account.private_key = "ed25519:" + account.private_key;

        console.log(account);

        await fs.writeFile(filename, JSON.stringify(account));
    },

    /**
     * @return {boolean}
     */
    CreateAccount: async function (new_account) {
        const keyPair = nearApi.utils.KeyPair.fromString(settings.masterKey);

        const keyStore = new nearApi.keyStores.InMemoryKeyStore();
        keyStore.setKey("default", settings.masterAccountId, keyPair);

        let result = false;

        await (async () => {
            const near = await nearApi.connect({
                networkId: "default",
                deps: {keyStore},
                masterAccount: settings.masterAccountId,
                nodeUrl: 'https://rpc.testnet.near.org'
            });

            const account = await near.account(settings.masterAccountId);

            const res = await account.createAccount(new_account.account_id, new_account.public_key, '200000000000000000000000');

            try {
                if (res['status'].hasOwnProperty('SuccessValue')) {
                    await this.SaveKeyPair(new_account);
                    result = true
                }
            } catch (e) {
                console.log(e);
            }
        })();

        return result;
    },

    GetAccount: async function (account_id) {
        const filename = this.GetFileName(account_id);
        return await fs.readFile(filename, 'utf8');
    }
};


