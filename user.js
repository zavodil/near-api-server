const nearApi = require('near-api-js');
const blockchain = require('./blockchain');
const nearSeedPhrase = require('near-seed-phrase');
const fs = require('fs');

const storageFolder = "storage";

module.exports = {
    GenerateKeyPair: async function () {
        const keypair = nearApi.utils.KeyPair.fromRandom('ed25519');

        return {
            public_key: keypair.publicKey.toString(),
            private_key: keypair.secretKey
        };
    },

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
        return `${storageFolder}/${account_id}.json`;
    },

    SaveKeyPair: async function (account) {
        if (!fs.existsSync(storageFolder))
            fs.mkdirSync(storageFolder);

        const filename = this.GetFileName(account.account_id);
        account.private_key = "ed25519:" + account.private_key;

        await fs.promises.writeFile(filename, JSON.stringify(account));
    },

    /**
     * @return {boolean}
     */
    CreateAccount: async function (new_account) {
        const account = await blockchain.GetMasterAccount();

        const res = await account.createAccount(new_account.account_id, new_account.public_key, '200000000000000000000000');

        try {
            if (res['status'].hasOwnProperty('SuccessValue')) {
                await this.SaveKeyPair(new_account);
                return true
            }
        } catch (e) {
            console.log(e);
        }
        return false;
    },

    GetAccount: async function (account_id) {
        const filename = this.GetFileName(account_id);
        return await fs.promises.readFile(filename, 'utf8');
    },

    GetKeysFromSeedPhrase: async function (seedPhrase) {
        return nearSeedPhrase.parseSeedPhrase(seedPhrase);
    }
};


