'use client'
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
//import LocationAggregatorMap from '../../components/map';

/*
  import { Provider as ReduxProvider } from "react-redux";
  import store from "../store/page";

  

  export default function Home() {
    return (
      <div>
        <ReduxProvider store={store}>
          <DynamicMap />
        </ReduxProvider>
      </div>
    );
  }
*/

const Dynamic_LocationAggregatorMap = dynamic(() => import("../../components/map"), {
  ssr: true,
});

const HomePage = () => {
  const [details, setDetails] = useState([]);
  //const [coordinates, setCoordinates] = useState([]);

  /*
  useEffect(() => {
    const getData = async () => {
      const response = await fetch(
        "http://localhost:3000/api/tdx"
      );

      const data = await response.json();
      //setDetails(data.items);

      // Create an array of geo coordinates pairs
      
      const coords = data.items.map((item) => [
        item.location.longitude,
        item.location.latitude,
      ]);
      setCoordinates(coords);
  
    };

    //getData();
  }, []);
  */

  const geojson_url = "http://localhost:3000/api/tdx"

  useEffect(() => {
    const geojson_result = async () => {
      var response = await fetch(geojson_url, {
        method: "GET",
      }).then((res) => {
        const data = res.json();
        return data
      }).then((data) => {
        //console.log(data)
        setDetails(data.section_geojson);
        return data.section_geojson
      }).catch((err) => {
        console.log('錯誤:', err);
      })
    }

    geojson_result()
  }, []);

  return (
    <div className="relative min-h-screen">
      <Dynamic_LocationAggregatorMap data={details} />
    </div>
  )
}

export default HomePage