# TMDB API Integration Guide for Cinemetrics# TMDB API Integration Guide for Cinemetrics

This guide explains how to integrate The Movie Database (TMDB) API into your Cinemetrics project to fetch real movie data.This guide explains how to integrate The Movie Database (TMDB) API into your Cinemetrics project to fetch real movie data.

## 🚀 Quick Setup## 🚀 Quick Setup

### 1. Get Your TMDB API Key### 1. Get Your TMDB API Key

1. Go to [https://www.themoviedb.org/](https://www.themoviedb.org/)1. Go to [https://www.themoviedb.org/](https://www.themoviedb.org/)

2. Create a free account2. Create a free account

3. Go to Settings → API → Create API Key (v3 auth)3. Go to Settings → API → Create API Key (v3 auth)

4. Copy your API key4. Copy your API key

### 2. Configure Your Project### 2. Configure Your Project

1. Open `utils/tmdbApi.js`eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2OTk3MWMxNzFjYTI1ZDIxMTM0ODgwYmNmZTg2MWU2NyIsIm5iZiI6MTc1Njc3NTE3MS41MTgwMDAxLCJzdWIiOiI2OGI2NDMwMzlkYzFjNTdmM2JiNGZjYTgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.TMYHfLRkeg2ruQlNLWExhFEaE5KmWK2xi1NpmmymJow

2. Replace `"YOUR_TMDB_API_KEY_HERE"` with your actual API key:

3. Open `utils/tmdbApi.js`

```javascript2. Replace `"YOUR_TMDB_API_KEY_HERE"` with your actual API key:

API_KEY: "your_actual_api_key_here"; 69971c171ca25d21134880bcfe861e67

````

```javascript

### 3. Enable API in ComponentsAPI_KEY: "your_actual_api_key_here";

````

1. Open `views/releases.js`

2. Uncomment the import line:### 3. Enable API in Components

```javascript1. Open `views/releases.js`

import { fetchUpcomingMovies, isApiConfigured } from "../utils/tmdbApi.js";2. Uncomment the import line:

````

```javascript

3. Uncomment the `loadUpcomingMovies()` functionimport { fetchUpcomingMovies, isApiConfigured } from "../utils/tmdbApi.js";

4. Update the main component to use API data```



## 📊 Available TMDB Endpoints3. Uncomment the `loadUpcomingMovies()` function

4. Update the main component to use API data:

### Movies

- **Upcoming**: `/movie/upcoming` - Movies coming soon```javascript

- **Popular**: `/movie/popular` - Currently popular movies// In the main component function, replace:

- **Now Playing**: `/movie/now_playing` - Movies in theaters${generateMovieCards()}

- **Top Rated**: `/movie/top_rated` - Highest rated movies

- **Trending**: `/trending/movie/week` - Trending this week// With:

${generateMovieCards(await loadUpcomingMovies())}

### Data Available```

- Title, release date, overview, ratings

- High-quality poster images (500px width)## 📊 Available TMDB Endpoints

- Backdrop images (1280px width)

- Genre IDs (requires separate call to map to names)### Movies

- Popularity scores, vote averages
- **Upcoming**: `/movie/upcoming` - Movies coming soon
- **Popular**: `/movie/popular` - Currently popular movies
- **Now Playing**: `/movie/now_playing` - Movies in theaters
- **Top Rated**: `/movie/top_rated` - Highest rated movies
- **Trending**: `/trending/movie/week` - Trending this week

### Data Available

- Title, release date, overview, ratings
- High-quality poster images (500px width)
- Backdrop images (1280px width)
- Genre IDs (requires separate call to map to names)
- Popularity scores, vote averages

## 🔧 Implementation Examples

### Basic Fetch (Already implemented in tmdbApi.js)

```javascript
const movies = await fetchUpcomingMovies();
````

### With Error Handling

```javascript
try {
  const movies = await fetchUpcomingMovies();
  renderMovies(movies);
} catch (error) {
  console.error("Failed to load movies:", error);
  renderMovies(mockData); // Fallback
}
```

### Fetch Multiple Pages

```javascript
const page1 = await fetchUpcomingMovies(1);
const page2 = await fetchUpcomingMovies(2);
const allMovies = [...page1, ...page2];
```

## 🎨 Image Optimization

TMDB provides multiple image sizes:

- **Posters**: w92, w154, w185, w342, w500, w780, original
- **Backdrops**: w300, w780, w1280, original

Current implementation uses:

- Posters: 500px width (`w500`)
- Backdrops: 1280px width (`w1280`)

## 📝 Data Mapping

TMDB API data is automatically mapped to your component format:

| TMDB Field     | Your Format   | Notes                     |
| -------------- | ------------- | ------------------------- |
| `title`        | `title`       | Movie title               |
| `release_date` | `releaseDate` | Formatted as "Month Year" |
| `overview`     | `description` | Movie plot summary        |
| `poster_path`  | `poster`      | Full URL with base path   |
| `vote_average` | `voteAverage` | Rating out of 10          |
| `id`           | `tmdbId`      | Unique TMDB identifier    |

## 🚦 Rate Limiting

TMDB API limits:

- **Free Tier**: 40 requests per 10 seconds
- **Paid Tier**: Higher limits available

The utility functions include error handling for rate limiting.

## 🔒 Security Notes

- **Never commit your API key** to version control
- Consider using environment variables in production:

```javascript
API_KEY: process.env.TMDB_API_KEY || "fallback_key";
```

## 🧪 Testing

Test your API integration:

1. Check browser console for any errors
2. Verify images load correctly
3. Test with network disabled (should show mock data)
4. Test API key validation with `isApiConfigured()`

## 📚 Additional Resources

- [TMDB API Documentation](https://developers.themoviedb.org/3/getting-started/introduction)
- [Image Configuration Guide](https://developers.themoviedb.org/3/getting-started/images)
- [Rate Limiting Info](https://developers.themoviedb.org/3/getting-started/request-rate-limiting)

## 🎯 Next Steps

Once basic integration works, consider adding:

- Genre mapping (fetch genre list and map IDs to names)
- Movie details page (click to see full info)
- Search functionality
- Favorite movies (localStorage)
- Movie trailers (YouTube integration)
- User ratings and reviews

## 🐛 Troubleshooting

### Common Issues:

1. **Images not loading**: Check CORS and image paths
2. **API calls failing**: Verify API key and network connectivity
3. **Rate limiting**: Add delays between requests if needed
4. **Empty results**: Check API response format changes

### Debug Mode:

Add this to see raw API responses:

```javascript
console.log("TMDB Response:", data);
```
