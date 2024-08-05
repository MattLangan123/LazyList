const SongDisplay = ({songs, number}) => {

    function millisToMinutesAndSeconds(millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
      }
    
    
    return (
        <div className="songBoxes">
            {songs ? songs.map((song, index) => {
                return (
                    <div className="songBox" key={index}>
                        <div className='trackNumber'>{index + 1}</div>
                        <img className='albumPic' src={song.album.images[0].url} alt="Album Art"/>
                        <div className='songAndArtistBox'>
                            <div className='songName'>{song.name}</div>
                            <div className='artistsNames'>
                                {song.artists.slice(0, 3).map((artist, index) => {
                                    return (
                                        <span className='artistName' key={index}>
                                            {artist.name}{index < 2 && index < song.artists.length - 1 && ', '}
                                        </span>
                                    )
                                })}
                                {song.artists.length > 3 && <span className='artistName'>...</span>}
                            </div>
                        </div>
                        <div className='albumName'>{song.album.name}</div>
                        <div className='trackDuration'>{millisToMinutesAndSeconds(song.duration_ms)}</div>
                    </div>
                )
            }
            ) : <div>Fetching songs...</div>}
        </div>
    )
}

export default SongDisplay