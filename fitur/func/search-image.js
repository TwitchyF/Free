var gis = require('g-i-s');
var axios = require('axios');
var sharp = require('sharp');

const get = (query) => {
  return new Promise((resolve, reject) => {
    gis(query, async (error, results) => {
      if (error) {
        reject(error);
      }
      else {
        let promises = results.map(result => checkImage(result.url));
        let urls = await Promise.all(promises);
        urls = urls.filter(url => url !== null); // Filter out null values
        resolve(urls);
      }
    });
  });
}

const checkImage = async (url) => {
  try {
    let response = await axios.get(url, { responseType: 'arraybuffer' });
    let metadata = await sharp(response.data).metadata();
    if(metadata.width >= 1280 && metadata.height >= 720) { // Check if the image is HD
      return url;
    }
  } catch(err) {
    console.error(err);
  }
  return null;
}

module.exports = { get };
