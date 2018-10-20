// let stateKey = 'spotify_auth_state'
// /**
//  * Obtains parameters from the hash of the URL
//  * @return Object
//  */
// function getHashParams() {
//     let hashParams = {}
//     let e, r = /([^&;=]+)=?([^&;]*)/g,
//         q = window.location.hash.substring(1)
//     while (e = r.exec(q)) {
//         hashParams[e[1]] = decodeURIComponent(e[2])
//     }
//     return hashParams
// }
// /**
//  * Generates a random string containing numbers and letters
//  * @param  {number} length The length of the string
//  * @return {string} The generated string
//  */
// function generateRandomString(length) {
//     let text = ''
//     let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
//     for (let i = 0; i < length; i++) {
//         text += possible.charAt(Math.floor(Math.random() * possible.length))
//     }
//     return text
// }

// let userProfilePlaceholder = document.getElementById('show_access_token')

// let params = getHashParams()
// let access_token = params.access_token,
//     state = params.state,
//     storedState = localStorage.getItem(stateKey)

// if (access_token && (state == null || state !== storedState)) {
//     alert('There was an error during authentication, or you need to log in again!')
// } else {
//     localStorage.removeItem(stateKey)
//     if (access_token) {
//         $.ajax({
//             url: 'https://api.spotify.com/v1/me',
//             headers: {
//                 'Authorization': 'Bearer ' + access_token
//             },
//             success: function (response) {
//                 userProfilePlaceholder.innerHTML = access_token

                let spotifyApi = new SpotifyWebApi()
                spotifyApi.setAccessToken('BQC9ITb0gjnEqRnp6vovhY2QphRb1c3YVl_vuqUo2_PXQVJSntOT_gQ2EOkTDO8cmsPT-44ijUADmRWbuV8S6vNytyGR2_w48VxXdbFSmt6KVD9TWR_9stF_UDBFqR5-rSv_l8fQJ0fFUvYNqqHfTFABDGx7Q-0m')

                // search tracks whose artist's name contains 'Love'
                spotifyApi.getAlbums(['3tx8gQqWbGwqIGZHqDNrGe', '3OZgEywV4krCZ814pTJWr7', '6EVYTRG1drKdO8OnIQBeEj', '6czdbbMtGbAkZ6ud2OMTcg'], {limit: 50})
                    .then(data => {
                        return data.albums.map(album => {
                            return album.tracks.items.map(track => {
                               let trackObject = {}
                               trackObject.album = album.name
                               trackObject.name = track.name
                               trackObject.id = track.id
                               trackObject.releaseDate = new Date(album.release_date)

                               return trackObject
                            })
                        })
                    })
                    .then(trackData => {
                        return trackData.map(track => {
                            return track.map(t => {
                                return spotifyApi.getAudioFeaturesForTrack(t.id).then(features => {
                                    t.tempo = features.tempo
                                    t.acousticness = features.acousticness
                                    t.danceability = features.danceability
                                    t.duration_ms = features.duration_ms
                                    t.energy = features.energy
                                    t.instrumentalness = features.instrumentalness
                                    t.key = features.key
                                    t.liveness = features.liveness
                                    t.loudness = features.loudness
                                    t.mode = features.mode
                                    t.speechiness = features.speechiness

                                    return t
                                })
                            })
                        })
                    })
                    .then(trackInfo => {
                        return trackInfo.map(t => {
                            return Promise.all(t)
                        })
                    })
                    .then(trackInfo => {
                        Promise.all(trackInfo).then(info => {

                            let width = 500,
                                height = 300,
                                margin = {
                                    top: 20,
                                    right: 100,
                                    bottom: 50,
                                    left: 50
                                }

                            let svg = d3.select('#tempo-chart').append('svg')
                                .attr('viewBox', '0 0' + ' ' + width + ' ' + width)

                            let y = d3.scaleTime()
                                .domain(d3.extent(info.flat(), d => d.releaseDate)).nice()
                                .range([height - margin.bottom, margin.top])

                            let yAxis = g => g
                                .attr('transform', `translate(${margin.left},0)`)
                                .call(d3.axisLeft(y))
                                .call(g => g.select('.tick:last-of-type text').clone()
                                    .attr('x', 4)
                                    .attr('text-anchor', 'start')
                                    .attr('font-weight', 'bold'))
                                .attr('class', 'y-axis')

                            svg.append('g')
                                .call(yAxis)

                            let x = d3.scaleLinear()
                                .domain(d3.extent(info.flat(), d => d.tempo)).nice()
                                .range([margin.left, width - margin.right])

                            let xAxis = g => g
                                .attr('transform', `translate(0,${height - margin.bottom})`)
                                .call(d3.axisBottom(x))
                                .call(g => g.append('text')
                                    .attr('x', width - margin.right)
                                    .attr('y', -4)
                                    .attr('fill', '#000')
                                    .attr('font-weight', 'bold')
                                    .attr('text-anchor', 'end'))
                                .attr('class', 'x-axis')

                            svg.append('g')
                                .call(xAxis)

                            let colorScale = d3.scaleSequential(d3.interpolateWarm).domain([100, 200])

                            let g = svg.append('g').attr('class', 'bubbles')

                            info.forEach(i => {
                                let bubbles = g.data([{ album: i[0].album, releaseDate: i[0].releaseDate }])
                                    .append('g')
                                    .attr('class', 'bubbleGroup ' + i[0].album)
                                    .selectAll('.bubble')
                                    .data(i)
                                    .enter().append('circle')
                                    .on('mousemove', d => {
                                        console.log(d)
                                    })

                                 bubbles.merge(g)
                                     .attr('r', 5)
                                     .attr('opacity', 0.5)
                                     .attr('cx', d => x(d.tempo))
                                     .transition().duration(750)
                                     .attr('cy', d => y(d.releaseDate))
                                     .attr('fill', d => colorScale(d.tempo))
                                     .attr('stroke', 'gray')
                                     .transition().duration(750)
                                     .attr('opacity', 1)
                            })

                            d3.selectAll('.bubbleGroup')
                                .append('text')
                                .text(d => {
                                    return d.album
                                })
                                .attr('dx', width - margin.right)
                                .attr('dy', d => {
                                    return y(d.releaseDate)
                                })
                                .attr('class', 'album-text')

                            // let bubbles = g.selectAll('.bubble')
                            //     .data(info)
                            //     .enter().append('circle')
                            //     .on('mousemove', d => {
                            //         console.log(d)
                            //     })

                            // bubbles.merge(g)
                            //     .attr('r', 5)
                            //     .attr('opacity', 0.5)
                            //     .attr('cx', d => x(d.tempo))
                            //     .transition().duration(750)
                            //     .attr('cy', d => y(d.releaseDate))
                            //     .attr('fill', d => colorScale(d.tempo))
                            //     .attr('stroke', 'gray')
                            //     .attr('stoke-width', 0.1)
                            //     .transition().duration(750)
                            //     .attr('opacity', 1)
                        })
                    })
//                 $('#login').hide()
//                 $('#loggedin').show()
//             }
//         })
//     } else {
//         $('#login').show()
//         $('#loggedin').hide()
//     }

//     d3.select('#login-button')
//         .on('click', function(d) {
//             let client_id = '59b8b201c88f468fa70b18adb98097e8' // Your client id
//             let redirect_uri = 'http://localhost:8000' // Your redirect uri
//             let state = generateRandomString(16)
//             localStorage.setItem(stateKey, state)
//             let scope = 'user-read-private user-read-email'
//             let url = 'https://accounts.spotify.com/authorize'
//             url += '?response_type=token'
//             url += '&client_id=' + encodeURIComponent(client_id)
//             url += '&scope=' + encodeURIComponent(scope)
//             url += '&redirect_uri=' + encodeURIComponent(redirect_uri)
//             url += '&state=' + encodeURIComponent(state)
//             window.location = url
//         })
// }