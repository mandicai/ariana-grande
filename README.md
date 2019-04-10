# The Evolution of Ariana Grande
#### Demo: https://mandicai.github.io/ariana-grande/

## Intro
Since the release of her debut album Yours Truly in 2013, Ariana Grande has sold 30.5 million digital singles. She was named one of TIME's 100 most influential people in the world in 2016, and has been nominated for 4 Grammy's.

I wanted to visualize how her albums have evolved over the years, given that she has a four octave soprano vocal range to work with.

## How it works
Data is from Spotify's API. I used JMPerez's [spotify-web-api-js](https://github.com/JMPerez/spotify-web-api-js) library to fetch the data, and Spotify's [implicit grant flow](https://github.com/spotify/web-api-auth-examples/tree/master/implicit_grant) for authentication. More information on implicit grant authentication can be found [here](https://developer.spotify.com/documentation/general/guides/authorization-guide/). Visualizations are created with [D3.js](https://d3js.org/).

The scatter plot with a menu was created with the help of Curran Kelleher's [tutorial](https://vizhub.com/curran/98ba4daacc92442f8d9fd7d91bfd712a).

## Run it
To run, `git clone` the repo, `cd` into the project, and run `http-server -c-1 -p 8000` (or any local server of your choice) to view the project at `localhost:8000`.

## Sources
- [TIME 100: The Most Influential People of 2016](http://time.com/4299766/ariana-grande-2016-time-100/)
- [Gold & Platinum – RIAA](https://www.riaa.com/gold-platinum/?tab_active=top_tallies&ttt=TAS#search_section)
- [Ariana Grande: The diva with a heart](https://www.bbc.com/news/entertainment-arts-40005064)

## Resources
Spotify authentication
- https://developer.spotify.com/documentation/general/guides/authorization-guide/

Fetching data from Spotify's API
- https://github.com/JMPerez/spotify-web-api-js

Creating the radial charts
- https://bl.ocks.org/tlfrd/fd6991b2d1947a3cb9e0bd20053899d6

Creating the scatter plot
- https://vizhub.com/curran/98ba4daacc92442f8d9fd7d91bfd712a

Creating the scrolly story
- https://github.com/russellgoldenberg/scrollama
