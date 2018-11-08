# The Evolution of Ariana Grande

[Demo](https://mandicai.github.io/ariana-grande/)

## Description
Since the release of her debut album Yours Truly in 2013, Ariana Grande has sold 30.5 million digital singles. She was named one of TIME's 100 most influential people in the world in 2016, and has been nominated for 4 Grammy's.

I wanted to visualize how her albums have evolved over the years, given that she has a four octave soprano vocal range to work with.

## How I made it 

Data is from Spotify's API. I used JMPerez's [spotify-web-api-js](https://github.com/JMPerez/spotify-web-api-js) library to fetch the data, and Spotify's [implicit grant flow](https://github.com/spotify/web-api-auth-examples/tree/master/implicit_grant) for authentication. More information on implicit grant authentication can be found [here](https://developer.spotify.com/documentation/general/guides/authorization-guide/). Visualizations are created with [D3.js](https://d3js.org/).

The scatter plot with a menu was created with the help of Curran Kelleher's [tutorial](https://vizhub.com/curran/98ba4daacc92442f8d9fd7d91bfd712a).