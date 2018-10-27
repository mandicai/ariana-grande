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
                spotifyApi.setAccessToken('BQAav-kxiiRFzf9vR-WiEdqMkaD828BcoomoEwn_0-0Ws-M8x0s5eztR1OhmjyJOT3zaGoPn_g0e68vH2GqejBVC6OpfpUnNUQF6BFIlP5UafCQcGf7qrZeKWeQIuS41U323iFSUX9jRVhfc2L4eDd1X7Y3jv2zG')

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

                            let svg = d3.select('#song-scatter-chart').append('svg')
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

                            let colorScale = d3.scaleSequential(d3.interpolateWarm).domain([0, info.length])

                            let g = svg.append('g').attr('class', 'bubbles')

                            let columns = ['acousticness', 'danceability', 'energy', 'valence']
                            let yColumn = columns[0]

                            d3.select('#property').text(yColumn)

                            info.forEach((songInfo, index) => {
                                let albumData = [{
                                    album: songInfo[0].album,
                                    releaseDate: songInfo[0].releaseDate,
                                    range: d3.extent(songInfo, function(d) { return d[yColumn] })[1] - d3.extent(songInfo, function(d) { return d[yColumn] })[0]
                                }]

                                let bubbleGroups = g.append('g')
                                    .data(albumData)
                                    .attr('class', 'bubbleGroup ' + songInfo[0].album)

                                let bubbles = bubbleGroups.selectAll('.bubble')
                                    .data(songInfo)
                                    .enter().append('circle')
                                    .attr('fill', colorScale(index))
                                    .attr('class', 'bubble')
                                    .on('mousemove', d => {
                                        d3.select('#tooltip').style('display', 'initial')
                                        d3.select('#tooltip').html('<div class="song-name">' + d.name + '</div>')
                                            .style('left', (d3.event.pageX + 10) + 'px').style('top', (d3.event.pageY) + 'px')
                                    })
                                    .on('mouseout', function (d) {
                                        d3.select('#tooltip').style('display', 'none')
                                    })
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

                            d3.selectAll('.bubbleGroup')
                                .append('text')
                                .text(d => {
                                    return 'Range: ' + d.range
                                })
                                .attr('dx', width - margin.right)
                                .attr('dy', d => {
                                    return y(d.releaseDate) + 10
                                })
                                .attr('class', 'range-text')

                            let render = () => {
                                // RESET THE DOMAIN OF THE X AXIS AND RECALL
                                x.domain(d3.extent(flatten(info), d => d[yColumn])).nice()
                                xAxisGroup.call(xAxis)

                                // RECALCULATE THE X LOCATION OF CIRCLES
                                d3.selectAll('.bubble')
                                    .attr('r', 5)
                                    .transition()
                                    .attr('cx', d => x(d[yColumn]))
                                    .transition().duration(500)
                                    .attr('cy', d => y(d.releaseDate))

                                d3.select('#property').text(yColumn)
                            }

                            // INITIAL RENDER
                            render()

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

                            let radialWidth = 1000,
                                radialHeight = 600,
                                radialHeightOne = 325

                            let outerRadius = 100,
                                radialLineGenerator = d3.radialLine().curve(d3.curveCardinalClosed),
                                radialColorScale = d3.scaleSequential(d3.interpolateWarm).domain([0, info.length]),
                                gridDimensions = { "rows": 2, "columns": 2 },
                                circleRadii = [outerRadius, outerRadius / 2, 1],
                                trackFeatures = ['acousticness', 'danceability', 'energy', 'valence']
                            
                            let radialScale = d3.scaleLinear()
                                .domain([0, trackFeatures.length])
                                .range([0, 2 * Math.PI])
                            
                            // DIAGRAM OF RADIAL CHART
                            let radialSVGOne = d3.select('#song-radial-chart-one').append('svg')
                                .attr('viewBox', '0 0' + ' ' + radialWidth + ' ' + radialHeightOne)
                            
                            circleRadii.forEach(c => {
                                radialSVGOne.append('circle').attr('r', c)
                                    .attr('transform', "translate(" + radialWidth / 2 + "," + radialHeightOne / 2 + ")")
                                    .attr('fill', 'none')
                                    .attr('stroke', 'gray')
                            })
                            
                            let axialAxis = radialSVGOne.append('g')
                                .attr('class', 'radial-axis')
                                .attr('transform', "translate(" + radialWidth / 2 + "," + radialHeightOne / 2 + ")")
                                .selectAll('g')
                                .data(radialScale.ticks(trackFeatures.length))
                                .enter().append('g')
                                .attr('transform', d => 'rotate(' + (rad2deg(radialScale(d))) + ')')

                            axialAxis.append('line')
                                .attr('x1', outerRadius)
                                .attr('x2', outerRadius + 15)

                            // figure out a better way to do this text positioning...
                            axialAxis.append('text')
                                .text(i => trackFeatures[i])
                                .attr('transform', d => 'rotate(' + (-rad2deg(radialScale(d))) + ',' + outerRadius + ',0)')
                                .attr('text-anchor', 'middle')
                                .attr('dx', d => {
                                    if (radialScale(d) === Math.PI) {
                                        return outerRadius - 50
                                    } else if (radialScale(d) === 0) {
                                        return outerRadius + 70
                                    } else {
                                        return outerRadius
                                    }
                                })
                                .attr('dy', d => {
                                    if (radialScale(d) === Math.PI * 1.5) {
                                        return -30
                                    } else if (radialScale(d) === Math.PI / 2) {
                                        return 35
                                    }
                                })
                            
                            let radialGroupOne = radialSVGOne.append('g')
                                .attr('transform', "translate(" + radialWidth / 2 + "," + radialHeightOne / 2 + ")")

                            let points = [
                                [radialScale(0), info[0][0][trackFeatures[0]] * outerRadius],
                                [radialScale(1), info[0][0][trackFeatures[1]] * outerRadius],
                                [radialScale(2), info[0][0][trackFeatures[2]] * outerRadius],
                                [radialScale(3), info[0][0][trackFeatures[3]] * outerRadius],
                            ]

                            let radialLineOne = radialLineGenerator(points)

                            setTimeout(function () {
                                radialGroupOne
                                    .append('path')
                                    .attr('d', radialLineOne)
                                    .attr('stroke', radialColorScale(0))
                                    .attr('stroke-width', '2px')
                                    .attr('fill', 'none')
                                    .attr('opacity', 0.0)
                                    .transition().duration(500)
                                    .attr('opacity', 0.5)
                            }, 1000)

                            // RADIAL CHARTS OF ALL ALBUMS
                            let radialSVG = d3.select('#song-radial-chart').append('svg')
                                .attr('viewBox', '0 0' + ' ' + radialWidth + ' ' + radialHeight)

                            info.forEach((songInfo, index) => {
                                let curRow = Math.floor(index / gridDimensions.columns)
                                let curCol = index % gridDimensions.columns

                                let currentCenter = {
                                    x: (2 * curCol + 1) * (radialWidth / (gridDimensions.columns * 2)),
                                    y: (2 * curRow + 1) * (radialHeight / (gridDimensions.rows * 2))
                                }

                                let radialGroup = radialSVG.append('g')
                                    .attr('transform', "translate(" + currentCenter.x + "," + currentCenter.y + ")")

                                circleRadii.forEach(c => {
                                    radialSVG.append('circle').attr('r', c)
                                        .attr('transform', "translate(" + currentCenter.x + "," + currentCenter.y + ")")
                                        .attr('fill', 'none')
                                        .attr('stroke', 'gray')
                                })                    

                                radialGroup
                                  .append('text')
                                  .text(songInfo[0].album)
                                  .attr('text-anchor', 'middle')
                                  .attr('dy', -outerRadius - 25)
                                
                                let axialAxis = radialSVGOne.append('g')
                                    .attr('class', 'radial-axis')
                                    .attr('transform', "translate(" + radialWidth / 2 + "," + radialHeightOne / 2 + ")")
                                    .selectAll('g')
                                    .data(radialScale.ticks(trackFeatures.length))
                                    .enter().append('g')
                                    .attr('transform', d => 'rotate(' + (rad2deg(radialScale(d))) + ')')

                                axialAxis.append('line')
                                    .attr('x1', outerRadius)
                                    .attr('x2', outerRadius + 15)

                                // figure out a better way to do this text positioning...
                                axialAxis.append('text')
                                    .text(i => trackFeatures[i])
                                    .attr('transform', d => 'rotate(' + (-rad2deg(radialScale(d))) + ',' + outerRadius + ',0)')
                                    .attr('text-anchor', 'middle')
                                    .attr('dx', d => {
                                        if (radialScale(d) === Math.PI) {
                                            return outerRadius - 50
                                        } else if (radialScale(d) === 0) {
                                            return outerRadius + 70
                                        } else {
                                            return outerRadius
                                        }
                                    })
                                    .attr('dy', d => {
                                        if (radialScale(d) === Math.PI * 1.5) {
                                            return -30
                                        } else if (radialScale(d) === Math.PI / 2) {
                                            return 35
                                        }
                                    })

                                songInfo.forEach((song, i) => {
                                    let points = [
                                        [radialScale(0), song[trackFeatures[0]] * outerRadius],
                                        [radialScale(1), song[trackFeatures[1]] * outerRadius],
                                        [radialScale(2), song[trackFeatures[2]] * outerRadius],
                                        [radialScale(3), song[trackFeatures[3]] * outerRadius],
                                    ]

                                    let radialLine = radialLineGenerator(points)

                                    setTimeout(function () {
                                        radialGroup
                                            .append('path')
                                            .attr('d', radialLine)
                                            .attr('stroke', radialColorScale(index))
                                            .attr('stroke-width', '2px')
                                            .attr('fill', 'none')
                                            .attr('opacity', 0.0)
                                            .transition()
                                            .attr('opacity', 0.5)
                                    },
                                    1000 * i)
                                })
                            })
                        })
                    })
                $('#login').hide()
                $('#loggedin').show()
    //  COMMENT OUT THIS
//             }
//         })
//     } else {
//         $('#login').show()
//         $('#loggedin').hide()
//     }

//     d3.select('#login-button')
//         .on('click', function (d) {
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
//  COMMENT OUT THIS

function flatten(array) {
  return array.reduce((acc, val) => acc.concat(val), [])
}

function rad2deg(angle) {
    return angle * 180 / Math.PI
}

