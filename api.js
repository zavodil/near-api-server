module.exports = {
    reject: (err) => {
        console.log(err);
        return {error: JSON.stringify(err)};
    },
    notify: (message) => {
        return {text: message};
    }
}