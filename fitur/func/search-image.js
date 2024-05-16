var gis = require('g-i-s');

const get = (query) => {
  return new Promise((resolve, reject) => {
    gis(query, (error, results) => {
      if (error) {
        reject(error);
      }
      else {
        let urls = results.map(result => result.url);
        resolve(urls);
      }
    });
  });
}

module.exports = { get };
