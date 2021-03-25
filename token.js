const nearApi = require('near-api-js');
const blockchain = require('./blockchain');
const settings = require('./settings');
const api = require('./api');

module.exports = {

    /**
     * @return {string}
     */
    ViewNFT: async function (tokenId) {
        try {
            return await blockchain.View(
                settings.nftContract,
                "nft_token",
                {token_id: tokenId}
            );
        } catch (e) {
            return api.reject(e);
        }
    },

    /**
     * @return {string}
     */
    MintNFT: async function (tokenId, metadata) {
        let account = await blockchain.GetMasterAccount();
        try {
            const tx = await account.functionCall(
                settings.nftContract,
                "nft_mint",
                {
                    "token_id": tokenId,
                    "metadata": metadata
                },
                '100000000000000',
                '10000000000000000000000');

            if (!tx.status.Failure)
                return tx.transaction.hash
        } catch (e) {
            return api.reject(e);
        }
    },

    TransferNFT: async function (tokenId, receiverId, enforceOwnerId, memo) {
        try {
            let account;
            if (enforceOwnerId === settings.masterAccountId) {
                account = await blockchain.GetMasterAccount();
            } else {
                account = await blockchain.GetUserAccount(enforceOwnerId);
            }

            return await account.functionCall(
                settings.nftContract,
                "nft_transfer",
                {
                    "token_id": tokenId,
                    "receiver_id": receiverId,
                    "enforce_owner_id": enforceOwnerId,
                    "memo": memo
                },
                '100000000000000',
                '1');
        } catch (e) {
            return api.reject(e);
        }
    }
};
