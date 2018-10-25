//  COMMENT OUT THIS
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
                //  COMMENT OUT THIS
                let spotifyApi = new SpotifyWebApi()
                spotifyApi.setAccessToken('BQBg3eA889Jgai-9VzBMH2fCGWvkaWxfQ-5aqrHgLip6aXUnLFKjNFbAokNpoEoXtRAzBegvgRsoOqTKGDwWpkNY_6-No6R36ZTDA8FRamSd_429bk207m4HC-bmRK9sRwB9M2lr6ySh43sE1UahN5GYPdTCMezl')

                // search tracks whose artist's name contains 'Love'
                spotifyApi.getAlbums(['3tx8gQqWbGwqIGZHqDNrGe', '3OZgEywV4krCZ814pTJWr7', '6EVYTRG1drKdO8OnIQBeEj', '6czdbbMtGbAkZ6ud2OMTcg'], {
                        limit: 50
                    })
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
                                    t.valence = features.valence

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

                            let svg = d3.select('#song-chart').append('svg')
                                .attr('viewBox', '0 0' + ' ' + width + ' ' + height)

                            let y = d3.scaleTime()
                                .domain(d3.extent(flatten(info), d => d.releaseDate)).nice()
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

                            let xAxisGroup = svg.append('g')
                                .call(xAxis)

                            let colorScale = d3.scaleSequential(d3.interpolateWarm).domain([0, 4])

                            let g = svg.append('g').attr('class', 'bubbles')

                            let render = () => {
                                // RESET THE DOMAIN OF THE X AXIS AND RECALL
                                x.domain(d3.extent(flatten(info), d => d[yColumn])).nice()
                                xAxisGroup.call(xAxis)

                                info.forEach((songInfo, index) => {
                                    let bubbles = g.data([{
                                        album: songInfo[0].album,
                                        releaseDate: songInfo[0].releaseDate
                                    }])
                                        .append('g')
                                        .attr('class', 'bubbleGroup ' + songInfo[0].album)
                                        .selectAll('.bubble')
                                        .data(songInfo)
                                        .enter().append('circle')
                                        .on('mousemove', d => {
                                            d3.select('#tooltip').style('display', 'initial')
                                            d3.select('#tooltip').html('<div class="song-name">' + d.name + '</div>')
                                                .style('left', (d3.event.pageX + 10) + 'px').style('top', (d3.event.pageY) + 'px')
                                        })
                                        .on('mouseout', function (d) {
                                            d3.select('#tooltip').style('display', 'none')
                                        })

                                    bubbles.merge(g)
                                        .attr('r', 5)
                                        .attr('opacity', 0.5)
                                        .attr('cx', d => x(d[yColumn]))
                                        .transition().duration(750)
                                        .attr('cy', d => y(d.releaseDate))
                                        .attr('fill', colorScale(index))
                                        .attr('stroke', 'gray')
                                        .transition().duration(750)
                                        .attr('opacity', 1)
                                })
                            }

                            let columns = ['acousticness', 'danceability', 'energy', 'valence']
                            let yColumn = columns[0]

                            render()

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
                            
                            // DROPDOWN MENU HANDLING
                            let onYColumnClicked = column => {
                                yColumn = column
                                render()
                            }

                            let dropdownMenu = (selection, props) => {
                                let {
                                    options,
                                    onOptionClicked,
                                    selectedOption
                                } = props

                                let select = selection.selectAll('select').data([null])
                                select = select.enter().append('select')
                                    .merge(select)
                                    .on('change', function () {
                                        onOptionClicked(this.value)
                                    })

                                let option = select.selectAll('option').data(options)
                                option.enter().append('option')
                                    .merge(option)
                                    .attr('value', d => d)
                                    .property('selected', d => d === selectedOption) // why is this here?
                                    .text(d => d)
                            }

                            d3.select("#y-menu").call(dropdownMenu, {
                                options: columns,
                                onOptionClicked: onYColumnClicked,
                                selectedOption: yColumn
                            })

                            let radialHeight = 1100

                            let radialSVG = d3.select('#song-radial-chart').append('svg')
                                .attr('viewBox', '0 0' + ' ' + width + ' ' + radialHeight)

                            let outerRadius = 100,
                                fullCircle = 2 * Math.pi
                                section = 1 / 2

                            let radialLineGenerator = d3.radialLine().curve(d3.curveCardinalClosed)

                            let radialColorScale = d3.scaleSequential(d3.interpolateWarm).domain([0, 4])

                            info.forEach((songInfo, index) => {
                                let chartY = outerRadius * index * 2.5 + (outerRadius * 1.2)

                                let radialGroup = radialSVG.append('g')
                                    .attr("transform", "translate(" + width / 2 + "," + chartY + ")")

                                let radialOuterCircle = radialSVG.append('circle').attr('r', outerRadius)
                                    .attr("transform", "translate(" + width / 2 + "," + chartY + ")")
                                    .attr('fill', 'none')
                                    .attr('stroke', 'gray')

                                let radialMidCircle = radialSVG.append('circle').attr('r', 50)
                                    .attr("transform", "translate(" + width / 2 + "," + chartY + ")")
                                    .attr('fill', 'none')
                                    .attr('stroke', 'gray')

                                let radialInnerCircle = radialSVG.append('circle').attr('r', 1)
                                    .attr("transform", "translate(" + width / 2 + "," + chartY + ")")
                                    .attr('fill', 'none')
                                    .attr('stroke', 'gray')

                                songInfo.forEach((song, i) => {
                                    let points = [
                                        [0, song.acousticness * outerRadius],
                                        [Math.PI * section, song.danceability * outerRadius],
                                        [Math.PI, song.energy * outerRadius],
                                        [Math.PI * (section * 3), song.valence * outerRadius],
                                    ]

                                    let radialLine = radialLineGenerator(points)

                                    radialGroup
                                        .append('path')
                                        .attr('d', radialLine)
                                        .attr('stroke', radialColorScale(index))
                                        .attr('stroke-width', '2px')
                                        .attr('fill', 'none')
                                        .attr('opacity', 0.5)
                                })
                            })
                        })
                    })
                $('#login').hide()
                $('#loggedin').show()
    //  COMMENT OUT THIS
    //         }
    //     })
    // } else {
    //     $('#login').show()
    //     $('#loggedin').hide()
    // }

    // d3.select('#login-button')
    //     .on('click', function (d) {
    //         let client_id = '59b8b201c88f468fa70b18adb98097e8' // Your client id
    //         let redirect_uri = 'http://localhost:8000' // Your redirect uri
    //         let state = generateRandomString(16)
    //         localStorage.setItem(stateKey, state)
    //         let scope = 'user-read-private user-read-email'
    //         let url = 'https://accounts.spotify.com/authorize'
    //         url += '?response_type=token'
    //         url += '&client_id=' + encodeURIComponent(client_id)
    //         url += '&scope=' + encodeURIComponent(scope)
    //         url += '&redirect_uri=' + encodeURIComponent(redirect_uri)
    //         url += '&state=' + encodeURIComponent(state)
    //         window.location = url
    //     })
// }
//  COMMENT OUT THIS

function flatten(array) {
  return array.reduce((acc, val) => acc.concat(val), [])
}
