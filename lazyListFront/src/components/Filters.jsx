import { useState } from "react";
import MultiRangeSlider from 'multi-range-slider-react'

const Filter = (props) => {

    const onChange = (e) => {
        props.setPlaylistName(e.target.value)
    }

    return (
        <div className="filterComp">
            <h1>LAZY PLAYLIST FILTER</h1>
            <h3>Playlist Name</h3>
            <input value={props.playlistName} onChange={onChange}/>
            <h3>Years</h3>
            <MultiRangeSlider
                min={1900}
                max={2024}
                step={1}
                minValue={props.minYear}
                maxValue={props.maxYear}
                onInput={(e) => props.handleYearInput(e)}
                ruler={false}
                canMinMaxValueSame = {true}
            />
            <h3>Valence</h3>
            <MultiRangeSlider
                min={0}
                max={10}
                step={1}
                minValue={props.minValence}
                maxValue={props.maxValence}
                ruler={false}
                onInput={(e) => props.handleValenceInput(e)}
                canMinMaxValueSame = {true}
            />
            <h3>Danceability</h3>
            <MultiRangeSlider
                min={0}
                max={10}
                step={1}
                width={300}
                minValue={props.minDanceability}
                maxValue={props.maxDanceability}
                onInput={(e) => props.handleDanceabilityInput(e)}
                ruler={false}
                canMinMaxValueSame = {true}
            />
            <h3>Energy</h3>
            <MultiRangeSlider
                min={0}
                max={10}
                step={1}
                width={300}
                minValue={props.minEnergy}
                maxValue={props.maxEnergy}
                onInput={(e) => props.handleEnergyInput(e)}
                ruler={false}
                canMinMaxValueSame = {true}
            />
            <div className="filterBtns">
                <button className="createPlaylistBtn" onClick={props.filterPlaylist}>Filter Songs</button>
                <button className="createPlaylistBtn" onClick={props.createPlaylist}>Create Playlist</button>
            </div>
            
        </div>
    );
}

export default Filter