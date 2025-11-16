// api.js will handle all TMDB API calls
import axios from "axios";
const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const buildUrl = (endpoint, params = {}) => { // function to pull api url
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append("api_key", API_KEY);
  Object.entries(params).forEach(([key, value]) => { // get all of my objects to be in array pair
    url.searchParams.append(key, value);
  });
  return url.toString();
};
export const fetchTrending = async () => { // api fetch for trend
  try {
    const response = await axios.get(buildUrl("/trending/movie/day"));
    return response.data.results;
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
};
export const fetchNowPlaying = async () => { // api fetch for now
  try {
    const response = await axios.get(
      buildUrl("/movie/now_playing", { region: "US" })
    );
    return response.data.results;
  } catch (error) {
    console.error("Error fetching now playing movies:", error);
    return [];
  }
};
export const fetchPopular = async () => { // api fetch for popular
  try {
    const response = await axios.get(
      buildUrl("/movie/popular", { region: "US" })
    );
    return response.data.results;
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    return [];
  }
};
export const fetchHomeData = async () => { // fetchHomeData will pull all three
  console.log("Fetching TMDB Home Data");
  try {
    const [trending, nowPlaying, popular] = await Promise.all([
      fetchTrending(),
      fetchNowPlaying(),
      fetchPopular()
    ]);
    return { trending, nowPlaying, popular };
  } catch (error) {
    console.error("TMDB Home API Error:", error);
    return { trending: [], nowPlaying: [], popular: [] };
  }
};
