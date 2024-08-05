
const Songs = ({setPlaylistSelected}) => {


    return (
        <div className="songSelector">
            <h1 className="selectHeader">Songs</h1>
            <div>
                <button onClick={(e) => setPlaylistSelected(1)} className="selectPlay">Liked Songs</button>
            </div>
            <div>
                <button onClick={(e) => setPlaylistSelected(2)} className="selectPlay">Top 100 Songs From Last Month</button>
            </div>
            <div>
                <button onClick={(e) => setPlaylistSelected(3)} className="selectPlay"> Top 250 Songs From Last 6 Months</button>
            </div>
            <div>
                <button onClick={(e) => setPlaylistSelected(4)} className="selectPlay">Top 500 Songs From Last Year</button>
            </div>
        </div>
    )
}

export default Songs