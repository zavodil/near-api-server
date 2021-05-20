const {data} = require('./token_types.js');
const homedir = require("os").homedir();
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

const API_SERVER_URL = "https://rest.nearapi.org";
const CONTRACT_ID = "dev-1621541447792-38210652756946";
const ACCOUNT_ID = "zavodil.testnet";
const CREDENTIALS_DIR = ".near-credentials/testnet/";

const run = async () => {
    const tokens = data.map(({token_type, metadata}, i) => {
        return {
            token_type,
            token_id: token_type + '_1',
            metadata: {
                ...metadata,
                issued_at: Date.now().toString(),
            },
            perpetual_royalties: {
                ['escrow-' + (i + 1) + '.nft.near']: 1000, //10%
                "account-2.near": 500, // 5%
                "account-3.near": 100 // 1%
            }
        }
    });
    
    // initial add_token_types: 100 tokens of each type
    const supply_cap_by_type = tokens.map(({token_type}) => ({
        [token_type]: '100'
    })).reduce((a, c) => ({...a, ...c}), {});

    let tx = await init(CONTRACT_ID, supply_cap_by_type);
    console.log(tx);

    // initial mint 1 token of every type
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        tx = await mint(CONTRACT_ID, token);
        console.log(tx)
    }
    return "Finish"
};

const init = async function (contract, supply_cap_by_type) {
    const body = {
        method: 'new',
        contract: contract,

        params: {
            owner_id: ACCOUNT_ID,
            metadata: {
                "spec": "nft-1",
                "name": "NAME",
                "symbol": "NFT"
            },
            unlocked: true,
            supply_cap_by_type: supply_cap_by_type,
        },

        account_id: ACCOUNT_ID,
        private_key: await getPrivateKey(ACCOUNT_ID),
        attached_gas: "300000000000000",
        attached_tokens: ""
    };

    return await PostResponse("call", body);
};

const mint = async function (contract, token) {
    const body = {
        method: 'nft_mint',
        contract: contract,

        params: {
            token_id: token.token_id,
            metadata: token.metadata,
            perpetual_royalties: token.perpetual_royalties,
            token_type: token.token_type,
        },

        account_id: ACCOUNT_ID,
        private_key: await getPrivateKey(ACCOUNT_ID),
        attached_gas: "100000000000000",
        attached_tokens: "20000000000000000000000"
    };

    return await PostResponse("call", body);
};

const PostResponse = async (operation, body, options) => {
    const response = fetch(`${API_SERVER_URL}/${operation}`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    })
        .then(res => {
            return res.text().then(response => {
                if (options && options.convertToNear) {
                    return module.exports.RoundFloat(module.exports.ConvertYoctoNear(response, config.FRACTION_DIGITS));
                } else {
                    try {
                        const json = JSON.parse(response);
                        try {
                            if (json.error)
                                return (JSON.parse(json.error));
                            else {
                                return (json);
                            }
                        } catch (e) {
                            throw new Error("PostResponse error for " + operation + " request " + JSON.stringify(body) + ". Error: " + e.message);
                        }
                    } catch {
                        return response;
                    }
                }
            });

        });
    return response;
};

const getPrivateKey = async (accountId) => {
    const credentialsPath = path.join(homedir, CREDENTIALS_DIR);
    const keyPath = credentialsPath + accountId + '.json';
    try {
        const credentials = JSON.parse(fs.readFileSync(keyPath));
        return (credentials.private_key);
    } catch (e) {
        throw new Error("Key not found for account " + keyPath + ". Error: " + e.message);
    }
};

run().then(r => console.log(r));