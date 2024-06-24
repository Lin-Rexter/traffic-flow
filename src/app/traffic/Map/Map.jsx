//import { env } from 'node:process';
import React from "react";
import KeplerGl from "kepler.gl";
import { ReactReduxContext } from "react-redux";

const Map = () => {
  return (
    <ReactReduxContext.Consumer>
      {({ store }) => (
        <KeplerGl
          id="map"
          width={window.innerWidth}
          mapboxApiAccessToken={
            "pk.eyJ1IjoicmV0ZXgiLCJhIjoiY2x3czAyY2RiMDVmNzJqc2FpN2J6NDZ4ayJ9.zPxobQS9FFOIIBXtf6UPpA" //process.env.MAPBOX_TOKENS
          }
          height={window.innerHeight}
          store={store}
        />
      )}
    </ReactReduxContext.Consumer>
  );
};

export default Map;