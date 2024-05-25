import axios from "axios";
const apiKey = import.meta.env.VITE_API_KEY;

const fetchPlaylistData = async (playlistId) => {
  try {
    const playlistResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/playlistItems",
      {
        params: {
          part: "snippet,contentDetails",
          maxResults: 50,
          playlistId: playlistId,
          key: apiKey,
        },
      }
    );
    return playlistResponse.data;
  } catch (error) {
    console.log("ERROR : ", error);
  }
};

const fetchVideoData = async (videoId) => {
  try {
    const videoResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "contentDetails",
          id: videoId,
          key: apiKey,
        },
      }
    );
    return videoResponse.data.items;
  } catch (error) {
    console.log("ERROR : ", error);
  }
};

const calculateTotalDuration = (videos) => {
  let totalDuration = 0;
  let strDate = ""

  videos.forEach((video) => {
    const duration = video.contentDetails.duration;
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (parseInt(match[1]) || 0) * 3600;
    const minutes = (parseInt(match[2]) || 0) * 60;
    const seconds = parseInt(match[3]) || 0;
    strDate = hours === 0 ? `${minutes/60} minutes : ${seconds} seconds` : `${hours/3600} Hours : ${minutes/60} minutes : ${seconds} seconds`
    totalDuration += hours + minutes + seconds;
  });

  return [totalDuration, strDate];
};


export { fetchPlaylistData, fetchVideoData, calculateTotalDuration };
