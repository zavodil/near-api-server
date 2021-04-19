const CONFIG_PATH = './near-api-server.config.json';

module.exports = {
    CONFIG_PATH,

    reject: (err) => {
        console.log(err);
        return {error: typeof err === "string" ? err : JSON.stringify(err)};
    },
    notify: (message) => {
        return {text: message};
    }
}