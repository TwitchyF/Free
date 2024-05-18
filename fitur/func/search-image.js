var gis = require('g-i-s');

const get = (query) => {
  return new Promise((resolve, reject) => {
    gis(query, (error, results) => {
      if (error) {
        reject(error);
      }
      else {
        let urls = results
          .filter(result => result.width >= 800 && result.height >= 600) // Check if the image is HD
          .map(result => result.url); // Map to array of URLs
        resolve(urls);
      }
    });
  });
}

module.exports = { get };
