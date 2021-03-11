const nearApi = require('near-api-js');
const blockchain = require('./blockchain');
const settings = require('./settings');

module.exports = {

    /**
     * @return {string}
     */
    ViewNFT: async function (tokenId) {
        return await blockchain.View(
            settings.nftContract,
            "nft_token",
            {token_id: tokenId}
        );
    },

    MintNFT: async function (tokenId, metadata) {
        let account = await blockchain.GetMasterAccount();
        return await account.functionCall(
            settings.nftContract,
            "nft_mint",
            {
                "token_id": tokenId,
                "metadata": metadata
            },
            '100000000000000',
            '10000000000000000000000');
    },

    TransferNFT: async function (tokenId, receiverId, enforceOwnerId, memo) {
        let account;
        if (enforceOwnerId === settings.masterAccountId){
            account = await blockchain.GetMasterAccount();
        }
        else{
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
    }
};
