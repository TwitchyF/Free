const ytdl = require('ytdl-core');

module.exports = async (link) => {
  if (!link.includes('youtube.com/watch?v=') && !link.includes('youtu.be/')){
    return { success: false, reason: 'Video not found!' };
  };

  const
    validate = ytdl.validateURL(link),
    info = await ytdl.getInfo(link);

  if (!validate) {
    return { success: false, reason: 'Video not found!' };
  };

  try {
    let thumbnail, hd, sd;
    for (let i = 0; i < info.formats.length; i++) {
      const itag = info.formats[i]['itag'];

      if ( itag == '22'){
        hd = info.formats[i]['url'];
      } else if (itag == '18') {
        sd = info.formats[i]['url'];
      };
    };

    if(!info.videoDetails.thumbnails[4]){
      thumbnail = info.videoDetails.thumbnails[3].url;
    } else if(!info.videoDetails.thumbnails[3].url) {
      thumbnail = info.videoDetails.thumbnails[2].url;
    } else {
      thumbnail = info.videoDetails.thumbnails[4].url;
    };

    let result = {
      success: true,
      id: info.videoDetails.videoId,
      title: info.videoDetails.title,
      author: info.videoDetails.ownerChannelName,
      thumbnail,
      urls: { hd, sd }
    };

		return result;
  } catch (error) {
    console.log(error);
    return { success: false, reason: 500 };
  };
};