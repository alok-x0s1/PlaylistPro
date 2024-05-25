import React, { useEffect, useState } from "react";
import {
  calculateTotalDuration,
  fetchPlaylistData,
  fetchVideoData,
} from "./features/playlistInfo";

const App = () => {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [playlistData, setPlaylistData] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setPlaylistUrl(e.target.value);
  };

  const convertToTimeZone = (isoTimestamp, targetTimeZone) => {
    // Create a Date object from the ISO timestamp
    const utcDate = new Date(isoTimestamp);

    // Get the UTC time in milliseconds
    const utcTime = utcDate.getTime();

    // Calculate the offset for the target time zone
    const timeZoneOffset = new Date().getTimezoneOffset() * 60000; // in milliseconds
    const targetTimeOffset = new Date(
      utcTime + timeZoneOffset + targetTimeZone * 3600000
    ); // offset in milliseconds

    // Get date components
    const day = targetTimeOffset.getDate();
    const monthIndex = targetTimeOffset.getMonth();
    const year = targetTimeOffset.getFullYear();

    // Define an array of month names
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Format the date components
    const formattedDate = `${day} ${monthNames[monthIndex]} ${year}`;

    // Get the time in proper format
    const formattedTime = targetTimeOffset.toLocaleTimeString();

    // Combine date and time
    const formattedDateTime = `${formattedDate}, ${formattedTime}`;

    return formattedDateTime;
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetchPlaylistData(
  //         "PLEjRWorvdxL6LnWXJxnFB_9DXHhUxJ3dk"
  //       );
  //       console.log("Playlist", response);
  //       setPlaylistData(response);

  //       const videoData = response.items;

  //       const videoIds = videoData
  //         .map((video) => video.contentDetails.videoId)
  //         .join(",");

  //       const videoResponse = await fetchVideoData(videoIds);
  //       setVideoData(videoResponse);
  //       console.log("Video", videoResponse);

  //       const duration = calculateTotalDuration(videoResponse);
  //       setTotalDuration(duration);
  //       console.log(duration);
  //     } catch (error) {
  //       console.error("Error fetching playlist data:", error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      setError("Invalid playlist URL");
      return;
    }

    setLoading(true);
    setError("");
    setPlaylistData(null);
    setVideoData(null);
    setTotalDuration(0);

    try {
      const response = await fetchPlaylistData(playlistId);
      console.log("Playlist", response);
      setPlaylistData(response);

      const videoData = response.items;
      const videoIds = videoData
        .map((video) => video.contentDetails.videoId)
        .join(",");

      const videoResponse = await fetchVideoData(videoIds);
      setVideoData(videoResponse);
      console.log("Video", videoResponse);

      const duration = calculateTotalDuration(videoResponse);
      setTotalDuration(duration);
      console.log(duration);
    } catch (error) {
      console.error("Error fetching playlist data:", error);
      setError("Error fetching playlist data");
    } finally {
      setLoading(false);
    }
  };

  const extractPlaylistId = (url) => {
    const regex = /[?&]list=([^#\&\?]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <div className="w-full min-h-screen bg-slate-500 flex pt-12 justify-center items-start">
      <div className="max-w-[750px] min-w-[600px] bg-red-600 p-8">
        <form
          onSubmit={handleFormSubmit}
          className="w-full flex rounded-md overflow-hidden"
        >
          <input
            className="w-full p-3 text-xl border-none outline-none shadow-md"
            type="text"
            value={playlistUrl}
            onChange={handleInputChange}
            placeholder="Enter YouTube Playlist URL"
          />
          <button type="submit" className="w-fit p-2 bg-blue-600">
            Analyze
          </button>
        </form>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {playlistData && (
          <div className="flex justify-center flex-col w-full text-center mt-12">
            <h2>Playlist Data</h2>
            <p>Total videos : {playlistData.pageInfo.totalResults}</p>
          </div>
        )}
        {playlistData &&
          playlistData.items.map((video) => (
            <div
              key={video.id}
              className="border p-2 flex justify-start gap-4"
            >
              <img src={video.snippet.thumbnails.default.url} alt="thumbnail" />
              <div>
                <div>{video.snippet.title}</div>
                <div>{convertToTimeZone(video.snippet.publishedAt, -5)}</div>
              </div>
            </div>
          ))}
        <div>
          <h2>Total Duration</h2>
          <p>{totalDuration[1]}</p>
        </div>
      </div>
    </div>
  );
};

export default App;