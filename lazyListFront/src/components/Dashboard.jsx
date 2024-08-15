import axios from "axios";
import { useState, useEffect } from "react";
import SongDisplay from "./SongDisplay";
import Filter from "./Filters";
import Songs from "./Songs";

// eslint-disable-next-line react/prop-types
const Dashboard = ({code}) => {

    const api = 'https://lazylist.onrender.com/'

    //user access token for spotify api calls
    const [accessToken, setAccessToken] = useState();

    //Playlists that are fetched from User's Spotify (filters will be applied to these playlists)
    const [topSongsOneM, setTopSongsOneM] = useState();
    const [topSongsSixM, setTopSongsSixM] = useState();
    const [topSongsYear, setTopSongsYear] = useState();
    const [likedSongs, setLikedSongs] = useState([]);
    //Playlist displayed after songs are filtered
    const [lazyPlaylist, setLazyPlaylist] = useState([]);
    
    //Utilized to display the playlist selected
    const [playlistSelected, setPlaylistSelected] = useState(2);
    const [prevPlaylistSelected, setPrevPlaylistSelected] = useState(2);

    //Mobile filter handler
    const [mobileHandler, setMobileHandler] = useState(false);

    //Name for the playlist to be created
    const [playlistName, setPlaylistName] = useState('');

    //Utilized to make api call to create Spotify playlist
    const [userId, setUserId] = useState();

    //Valence filter handlers
    const [minValence, setMinValence] = useState(0);
    const [maxValence, setMaxValence] = useState(10);

    const handleValenceInput = (e) => {
        setMinValence(e.minValue);
        setMaxValence(e.maxValue);
    }

    //Danceability filter handlers
    const [minDanceability, setMinDanceability] = useState(0);
    const [maxDanceability, setMaxDanceability] = useState(10);

    const handleDanceabilityInput = (e) => {
        setMinDanceability(e.minValue);
        setMaxDanceability(e.maxValue);
    }
    
    //Energy filter handlers
    const [minEnergy, setMinEnergy] = useState(0);
    const [maxEnergy, setMaxEnergy] = useState(10);

    const handleEnergyInput = (e) => {
        setMinEnergy(e.minValue);
        setMaxEnergy(e.maxValue);
    }

    //Year filter handlers
    const [minYear, setMinYear] = useState(1900);
    const [maxYear, setMaxYear] = useState(2024);

    const handleYearInput = (e) => {
        setMinYear(e.minValue);
        setMaxYear(e.maxValue);
    }

    // Fetch the access token / refresh token and sets the access token, liked songs, top songs in the state
    useEffect(() => {
        axios
            .post(`${api}login`, {code})
            .then((response) => {
                // Clear the code from the URL after fetching the access token
                window.history.pushState({}, null, "/");
                setAccessToken(response.data.accessToken);
                // Immediately fetch top songs after setting the access token
                if (response.data.accessToken !== undefined) {
                    const access = response.data.accessToken.access_token;
                    axios
                        .post(`${api}top-songs-1month`, {access})
                        .then((response) => {
                            setTopSongsOneM(response.data.songs);
                        })
                        .catch(error => console.error("Error fetching top songs from last month", error));
                    axios
                        .post(`${api}top-songs-6months`, {access})
                        .then((response) => {
                            setTopSongsSixM(response.data.songs);
                        })
                        .catch(error => console.error("Error fetching top songs from last 6 months", error));
                    axios
                        .post(`${api}top-songs-year`, {access})
                        .then((response) => {
                            setTopSongsYear(response.data.songs);
                        })
                        .catch(error => console.error("Error fetching top songs from last year", error));
                    axios.post(`${api}liked-songs`, {access})
                        .then((response) => {
                            let likedSongs = response.data.songs;
                            let filteredLikedSongs = [];
                            likedSongs.forEach((song) => {
                                filteredLikedSongs = [...filteredLikedSongs, song.track]
                            });
                            setLikedSongs(filteredLikedSongs);
                        })
                        .catch(error => console.error("Error fetching liked songs", error));
                    axios.post(`${api}user-id`, {access})
                        .then((response) => {
                            setUserId(response.data.id);
                        })
                        .catch(error => console.error("Error fetching user id", error));
                }
            })
            // Redirect to the home page if the access token is not valid
            .catch(() => {
                window.location = "/";
            });
    }, [code]); // This effect depends on `code` and runs when `code` changes.

    const createPlaylist = (e) => {

        //safe guards to ensure that the user has filtered an existing playlist and entered a name for the playlist
        if (playlistSelected !== 5) {
            alert("Please filter a playlist first before creating a new one.")
            return;
        }
        if (playlistName === '') {
            alert("Please enter a name for the playlist.")
            return;
        }

        // Create a playlist with the inputted name. Will return the playlist ID
        axios.post(`${api}create-playlist`, {
            access: accessToken.access_token,
            playlistName: playlistName,
            userId: userId
        })
            .then((response) => {
                let playlistId = response.data.playlistId;
                let uris = [];
                lazyPlaylist.forEach((song) => {
                    uris = [...uris, song.uri]
                })

                // Add the songs to the playlist
                axios.post(`${api}add-songs`, {
                    access: accessToken.access_token,
                    playlistId: playlistId,
                    uris: uris
                })
                    .then(() => {
                    })
                    .catch(error => console.error("Error adding songs to playlist", error)
                )
                alert("Playlist created successfully!")

            })
            .catch(error => console.error("Error creating playlist", error)
        )
    }

    const filterPlaylist = (e) => {

        console.log('filtering playlist')
        console.log(topSongsOneM)
        
        let id = [];
        let lazyPlayIds = []
        let lazyPlay = []
        let valence = [minValence/10, maxValence/10];
        let energy = [minEnergy/10, maxEnergy/10];
        let danceability = [minDanceability/10, maxDanceability/10];
        let yearRange = [minYear, maxYear];
        let remasteredTracks = [];

        // Get the IDs of the songs in the playlist selected
        if (playlistSelected === 1) {
            likedSongs.forEach((song) => {
                if (Number(song.album.release_date.substring(0,4)) >= minYear && Number(song.album.release_date.substring(0,4)) <= maxYear) {
                    id = [...id, song.id]
                } else if (song.name.includes("Remastered") || song.name.includes("Remaster")) {
                    remasteredTracks = [...remasteredTracks, [song.name, song.artists[0].name], song.album.release_date]
                }
            })
        } else if (playlistSelected === 2) {
            topSongsOneM.forEach((song) => {
                if (Number(song.album.release_date.substring(0,4)) >= minYear && Number(song.album.release_date.substring(0,4)) <= maxYear) {
                    id = [...id, song.id]
                } else if (song.name.includes("Remastered")){
                    remasteredTracks = [...remasteredTracks, [song.name, song.artists[0].name]]
                }
            })
            console.log(id.length)
        } else if (playlistSelected === 3) {
            topSongsSixM.forEach((song) => {
                if (Number(song.album.release_date.substring(0,4)) >= minYear && Number(song.album.release_date.substring(0,4)) <= maxYear) {
                    id = [...id, song.id]
                } else if (song.name.includes("Remastered")){
                    remasteredTracks = [...remasteredTracks, [song.name, song.artists[0].name]]
                }
            })
        } else if (playlistSelected === 4) {
            topSongsYear.forEach((song) => {
                if (Number(song.album.release_date.substring(0,4)) >= minYear && Number(song.album.release_date.substring(0,4)) <= maxYear) {
                    id = [...id, song.id]
                } else if (song.name.includes("Remastered")){
                    remasteredTracks = [...remasteredTracks, [song.name, song.artists[0].name]]
                }
            })
        // If the playlist has already been filtered, filter the playlist again according the song pool of the previously filtered playlist and pass ids to api call
        } else if (playlistSelected === 5) {
            if (prevPlaylistSelected === 1) {
                likedSongs.forEach((song) => {
                    if (Number(song.album.release_date.substring(0,4)) >= minYear && Number(song.album.release_date.substring(0,4)) <= maxYear) {
                        id = [...id, song.id]
                    } else if (song.name.includes("Remastered") || song.name.includes("Remaster")) {
                        remasteredTracks = [...remasteredTracks, [song.name, song.artists[0].name], song.album.release_date]
                    }
                })
            } else if (prevPlaylistSelected === 2) {
                topSongsOneM.forEach((song) => {
                    if (Number(song.album.release_date.substring(0,4)) >= minYear && Number(song.album.release_date.substring(0,4)) <= maxYear) {
                        id = [...id, song.id]
                    } else if (song.name.includes("Remastered")){
                        remasteredTracks = [...remasteredTracks, [song.name, song.artists[0].name]]
                    }
                })
                console.log(id.length)
            } else if (prevPlaylistSelected === 3) {
                topSongsSixM.forEach((song) => {
                    if (Number(song.album.release_date.substring(0,4)) >= minYear && Number(song.album.release_date.substring(0,4)) <= maxYear) {
                        id = [...id, song.id]
                    } else if (song.name.includes("Remastered")){
                        remasteredTracks = [...remasteredTracks, [song.name, song.artists[0].name]]
                    }
                })
            } else if (prevPlaylistSelected=== 4) {
                topSongsYear.forEach((song) => {
                    if (Number(song.album.release_date.substring(0,4)) >= minYear && Number(song.album.release_date.substring(0,4)) <= maxYear) {
                        id = [...id, song.id]
                    } else if (song.name.includes("Remastered")){
                        remasteredTracks = [...remasteredTracks, [song.name, song.artists[0].name]]
                    }
                })
            }
        }

        // Filter the playlist based on the user inputted values and display filtered playlist
        axios.post(`${api}filter-playlist`, {
            access: accessToken.access_token,
            id: id,
            valence: valence,
            energy: energy,
            danceability: danceability,
            yearRange: yearRange,
            remasteredTracks: remasteredTracks
        })
            .then((response) => {
                lazyPlayIds = response.data.filteredSongs;
                
                if (playlistSelected === 1) {
                    likedSongs.forEach((song) => {
                        if (lazyPlayIds.includes(song.id)) {
                            lazyPlay = [...lazyPlay, song]
                        }
                    })
                } else if (playlistSelected === 2) {
                    topSongsOneM.forEach((song) => {
                        if (lazyPlayIds.includes(song.id)) {
                            lazyPlay = [...lazyPlay, song]
                        }
                    })
                } else if (playlistSelected === 3) {
                    topSongsSixM.forEach((song) => {
                        if (lazyPlayIds.includes(song.id)) {
                            lazyPlay = [...lazyPlay, song]
                        }
                    })
                } else if (playlistSelected === 4) {
                    topSongsYear.forEach((song) => {
                        if (lazyPlayIds.includes(song.id)) {
                            lazyPlay = [...lazyPlay, song]
                        }
                    })
                // Display the refiltered playlist if the playlist has already been filtered previously
                } else if (playlistSelected === 5) {
                    if (prevPlaylistSelected === 1) {
                        likedSongs.forEach((song) => {
                            if (lazyPlayIds.includes(song.id)) {
                                lazyPlay = [...lazyPlay, song]
                            }
                        })
                    } else if (prevPlaylistSelected === 2) {
                        topSongsOneM.forEach((song) => {
                            if (lazyPlayIds.includes(song.id)) {
                                lazyPlay = [...lazyPlay, song]
                            }
                        })
                    } else if (prevPlaylistSelected === 3) {
                        topSongsSixM.forEach((song) => {
                            if (lazyPlayIds.includes(song.id)) {
                                lazyPlay = [...lazyPlay, song]
                            }
                        })
                    } else if (prevPlaylistSelected === 4) {
                        topSongsYear.forEach((song) => {
                            if (lazyPlayIds.includes(song.id)) {
                                lazyPlay = [...lazyPlay, song]
                            }
                        })
                    }
                }
                // Ensures that the previous selected playlist is never the filtered playlist
                if (playlistSelected !== 5) {
                    setPrevPlaylistSelected(playlistSelected);
                }
                setLazyPlaylist(lazyPlay);
                setPlaylistSelected(5);
                
            })
            .catch(error => console.error("Error filtering playlist", error)
        )
    }


    if (!accessToken) return <div className="loading">Loading...</div>;

    if(!likedSongs || !topSongsOneM || !topSongsSixM || !topSongsYear) return <div className="loading"> Loading...</div>;

    // Display the songs based on the playlist selected
    let songDisplayComponent;
    if (playlistSelected === 1) {
        songDisplayComponent = <SongDisplay songs={likedSongs} number={playlistSelected} />;
    } else if (playlistSelected === 2) {
        songDisplayComponent = <SongDisplay songs={topSongsOneM} number={playlistSelected}/>;
    } else if (playlistSelected === 3) {
        songDisplayComponent = <SongDisplay songs={topSongsSixM} number={playlistSelected}/>;
    } else if (playlistSelected === 4) {
        songDisplayComponent = <SongDisplay songs={topSongsYear} number={playlistSelected}/>;
    } else if (playlistSelected === 5) {
        songDisplayComponent = <SongDisplay songs={lazyPlaylist} number={playlistSelected}/>;
    }

    if (playlistSelected === 1 && likedSongs.length === 0) {
        return (
            <div className="loading">
                <div>Loading...</div>
                <div className="loadingSubtext">(Takes roughly 8 seconds per 1000 songs in Liked Songs)</div>
            </div>
        )
    }

    // Mobile filter handler. If the filter button is clicked on mobile, the left side of the dashboard will be displayed and the song boxes will be hidden and vice versa
    const mobileFilter = (e) => {
        let songBoxes = document.querySelector('.songBoxes');
        let leftSide = document.querySelector('.leftSide');
        if (mobileHandler === false) {
            leftSide.style.display = 'none';
            setMobileHandler(true);
        }
        if (leftSide.style.display == 'none') {
            leftSide.style.display = 'flex';
            leftSide.style.flexDirection = 'column';
            leftSide.style.gap = '10px';
            songBoxes.style.display = 'none';
        } else {
            leftSide.style.display = 'none';
            songBoxes.style.display = 'block';
        }
    }

    
    return (
        <div className="entirePage">
            <div className="header">
                <div className="mobileBtns">
                    <button onClick={mobileFilter} className="mobileFilter">Filter</button>
                </div>
                <h1 className="title">LazyList</h1>
                <a className="logout" href="https://www.spotify.com/us/logout/">Log Out</a>
            </div>
            <div className="dashboard">
                <div className="leftSide">
                    <Songs setPlaylistSelected={setPlaylistSelected}/>
                    <Filter minValence={minValence} maxValence={maxValence} setMinValence={setMinValence} setMaxValence={setMaxValence}
                            minEnergy={minEnergy} maxEnergy={maxEnergy} setMinEnergy={setMinEnergy} setMaxEnergy={setMaxEnergy}
                            minDanceability={minDanceability} maxDanceability={maxDanceability} setMinDanceability={setMinDanceability} setMaxDanceability={setMaxDanceability}
                            handleValenceInput={handleValenceInput} handleDanceabilityInput={handleDanceabilityInput} handleEnergyInput={handleEnergyInput}
                            createPlaylist={createPlaylist} setPlaylistName={setPlaylistName} playlistName={playlistName}
                            filterPlaylist={filterPlaylist} minYear={minYear} maxYear={maxYear} handleYearInput={handleYearInput}/>
                </div>
                {songDisplayComponent}
            </div>
        </div>
    )
}

export default Dashboard;