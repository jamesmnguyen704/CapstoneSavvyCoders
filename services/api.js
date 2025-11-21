import axios from "axios";
const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const buildUrl = (endpoint, params = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append("api_key", API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
};

export const fetchTrending = async () => {
  try {
    const response = await axios.get(buildUrl("/trending/movie/day"));
    return response.data.results;
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
};

export const fetchNowPlaying = async () => {
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

export const fetchPopular = async () => {
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

export const fetchHomeData = async () => {
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

export const fetchUpcoming = async () => {
  try {
    const response = await axios.get(
      buildUrl("/movie/upcoming", { region: "US", page: 1 })
    );
    return response.data.results;
  } catch (error) {
    console.error("Error fetching upcoming movies:", error);
    return [];
  }
};
