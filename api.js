const CONFIG_PATH = './near-api-server.config.json';

module.exports = {
    CONFIG_PATH,

    reject: (err) => {
        return {error: typeof err === "string" ? err : JSON.stringify(err)};
    },
    notify: (message) => {
        return {text: message};
    },
    getNetworkFromRpcNode(rpc_node){
        return rpc_node.replace("https://rpc.", "").replace(".near.org", "");
    }
}
