import React, { useEffect, useState } from "react";
import {
  calculateTotalDuration,
  fetchPlaylistData,
  fetchVideoData,
  formatTime,
} from "./features/playlistInfo";
import ytlogo from "../public/YouTube.png"

const App = () => {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [playlistData, setPlaylistData] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const [watchSpeed, setWatchSpeed] = useState("1 x");

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
      setPlaylistData(response);

      const videoData = response.items;
      const videoIds = videoData
        .map((video) => video.contentDetails.videoId)
        .join(",");

      const videoResponse = await fetchVideoData(videoIds);
      setVideoData(videoResponse);

      const duration = calculateTotalDuration(videoResponse);
      setTotalDuration(duration);
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
      <div className="max-w-[750px] w-full min-w-[400px] p-8">
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
          <button
            type="submit"
            className="w-fit p-3 bg-blue-500 hover:bg-blue-400 duration-300"
          >
            Analyze
          </button>
        </form>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {playlistData && (
          <div className="flex justify-center flex-col w-full mt-8">
            <h2 className="text-3xl w-full text-center">Playlist Data</h2>
            <p className="items-start">
              Total videos : {playlistData.pageInfo.totalResults}
            </p>
          </div>
        )}
        <div>
          {totalDuration ? <h2>Total Duration : {formatTime(totalDuration)}</h2> : null}
        </div>
        {
          totalDuration ? <div className="mt-6 flex gap-4 items-center text-xl">
          <label htmlFor="watchSpeed">
            Select you speed :{" "}
          </label>
          <select
            name="watchSpeed"
            value={watchSpeed}
            className="bg-slate-500 border rounded-md outline-none p-1 border-slate-100"
            onChange={e => setWatchSpeed(e.target.value)}
            defaultValue="1 x"
          >
            <option value="0.25 x">0.25 x</option>
            <option value="0.5 x">0.5 x</option>
            <option value="0.75 x">0.75 x</option>
            <option value="1 x">1 x</option>
            <option value="1.25 x">1.25 x</option>
            <option value="1.5 x">1.5 x</option>
            <option value="1.75 x">1.75 x</option>
            <option value="2 x">2 x</option>
          </select>
          <div>{formatTime((totalDuration / watchSpeed.split(" ")[0]).toFixed(2))}</div>
        </div>
        : null
        }
        <div className="flex flex-col gap-6 mt-6">
          {playlistData &&
            playlistData.items.map((video) => (
              <div
                key={video.id}
                className="border rounded-md hover:-translate-y-1 duration-500 p-2 shadow-md shadow-slate-900 flex gap-4"
              >
                <img
                  src={video.snippet.thumbnails.high.url}
                  width={120}
                  alt="thumbnail"
                />
                <div className="flex flex-col gap-2">
                  <div>{video.snippet.title}</div>
                  <div>{convertToTimeZone(video.snippet.publishedAt, -5)}</div>
                  <button className="w-fit"><a href={`https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`} target="_blank"><img src={ytlogo} alt="ytLogo" /></a></button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default App;
