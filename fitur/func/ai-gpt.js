const { gpt } = require('gpti');
const get = async (model, prompt) => {
  
    return new Promise((resolve, reject) => {
        gpt({
            messages: [],
            prompt: prompt,
            model: model,
            markdown: false
        }, (err, data) => {
            if (err != null) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};
module.exports = {get};