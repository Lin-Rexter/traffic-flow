'use client'
//import { env } from 'node:process';
import React, { useState } from 'react';
import { Source, Layer, Map } from "react-map-gl";
import DeckGL from 'deck.gl';
import { HexagonLayer, LineLayer, PathLayer, GeoJsonLayer } from 'deck.gl';
//import "mapbox-gl/dist/mapbox-gl.css";
//import KeplerGl from "kepler.gl";
//import { ReactReduxContext } from "react-redux";
import {
  lightingEffect,
  material,
  INITIAL_VIEW_STATE,
  colorRange,
} from "../lib/mapconfig.js";

/*
const Map = () => {
  return (
    <ReactReduxContext.Consumer>
      {({ store }) => (
        <KeplerGl
          id="map"
          width={window.innerWidth}
          height={window.innerHeight}
          mapboxApiAccessToken={
            process.env.MAPBOX_TOKENS
          }
          store={store}
        />
      )}
    </ReactReduxContext.Consumer>
  );
};
export default Map;
*/

const mapbox_api_key = process.env.NEXT_PUBLIC_MAPBOX_TOKENS;

const LocationAggregatorMap = ({
  upperPercentile = 100,
  coverage = 1,
  data,
}) => {
  const [radius, setRadius] = useState(1000);

  const handleRadiusChange = (e) => {
    console.log(e.target.value);
    setRadius(e.target.value);
  };

  // creating tooltip
  function getTooltip({ object }) {
    /*
    if (!object) {
      return null;
    }
    const lat = object.position[1];
    const lng = object.position[0];
    const count = object.points.length;

    return `\
        latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ""}
        longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ""}
        ${count} locations here`;
    */
    return object && `路段名稱: ${object.properties.name}
    路段代碼: ${object.properties.id}
    壅塞程度: ${object.properties.describe}
    平均旅行速度: ${object.properties.travel_speed}KM/Hr (Ex: 數值250表示為道路封閉)
    平均旅行時間: ${object.properties.travel_time}秒
    更新時間: ${object.properties.update_time}
    更新週期: ${object.properties.update_interval}秒
    `;
  }

  /*
  const layers_Hex = [
    new HexagonLayer({
      id: "heatmap",
      colorRange,
      coverage,
      data,
      elevationRange: [0, 1000],
      elevationScale: data && data.length ? 50 : 0,
      extruded: true,
      getPosition: (d) => d,
      pickable: true,
      radius: 1000,
      upperPercentile,
      material,

      transitions: {
        elevationScale: 1000,
      },
    }),
  ];
  */
  /*
  const layer_Line = [
    new LineLayer({
      id: 'LineLayer',
      data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-segments.json',
      getColor: (d) => [Math.sqrt(d.inbound + d.outbound), 140, 0],
      getSourcePosition: (d) => d.from.coordinates,
      getTargetPosition: (d) => d.to.coordinates,
      getWidth: 12,
      pickable: true
    })
  ]
  */

  /*
  const Layer_Path = [
    new PathLayer({
      id: 'PathLayer',
      data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-lines.json',

      getColor: (d) => {
        const hex = d.color;
        // convert to RGB
        return hex.match(/[0-9a-f]{2}/g).map(x => parseInt(x, 16));
      },
      getPath: (d) => d.path,
      getWidth: 100,
      pickable: true
    })
  ]
  */

  const Layer_GeoJson = [
    new GeoJsonLayer({
      id: 'GeoJsonLayer',
      data: data, //'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart.geo.json',
      stroked: false,
      filled: true,
      pointType: 'circle+text+icon',
      pickable: true,
      getFillColor: [160, 160, 180, 200],
      getLineColor: (f) => {
        const hex = f.properties.color;
        // convert to RGB
        return hex ? hex.match(/[0-9a-f]{2}/g).map(x => parseInt(x, 16)) : [0, 0, 0];
      },
      getText: (f) => f.properties.name,
      getLineWidth: 25,
      getPointRadius: 4,
      getTextSize: 20,
      textFontWeight: 'bold',
    })
  ]

  return (
    <div>
      <DeckGL
        layers={Layer_GeoJson}
        effects={[lightingEffect]}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        getTooltip={getTooltip}
      >
        <Map
          className=""
          controller={true}
          mapboxAccessToken={mapbox_api_key}
          mapStyle="mapbox://styles/retex/clybowush00n301pr4vuz4fbf"
        >
        </Map>

        {/* FLOATING CONTROLLER */}

        {/*
        <div className="absolute bg-slate-900 text-white min-h-[200px] h-auto w-[250px] top-10 left-5 rounded-lg p-4 text-sm">
          <div className="flex flex-col">
            <h2 className="font-bold text-xl uppercase mb-1">Map controller</h2>
            <h2 className="font-bold text-md uppercase mb-4">INPOST LOCS</h2>
            <input
              name="radius"
              className="w-fit py-2"
              type="range"
              value={radius}
              min={500}
              step={50}
              max={10000}
              onChange={handleRadiusChange}
            />
            <label htmlFor="radius">
              Radius -{" "}
              <span className="bg-indigo-500 font-bold text-white px-2 py-1 rounded-lg">
                {radius}
              </span>{" "}
              meters
            </label>
            <p>
              {" "}
              <span className="font-bold">{data.length}</span> Locations
            </p>
          </div>
        </div>
        */}
      </DeckGL>
    </div>
  )
}

export default LocationAggregatorMap;