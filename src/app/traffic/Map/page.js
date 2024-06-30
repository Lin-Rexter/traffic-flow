'use client'
import React, { useState, useEffect } from "react";
import LocationAggregatorMap from '../../components/map';
/*
import dynamic from "next/dynamic";
import { Provider as ReduxProvider } from "react-redux";
import store from "../store/page";


const DynamicMap = dynamic(() => import("../../components/map"), {
  ssr: false,
});

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

const HomePage = () => {
  const [details, setDetails] = useState([]);
  const [coordinates, setCoordinates] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const response = await fetch(
        "https://api-shipx-pl.easypack24.net/v1/points?per_page=28000"
      );

      const data = await response.json();
      setDetails(data.items);

      // Create an array of geo coordinates pairs
      const coords = data.items.map((item) => [
        item.location.longitude,
        item.location.latitude,
      ]);
      setCoordinates(coords);
    };

    getData();
  }, []);

  return (
    <div className="relative min-h-screen">
      <LocationAggregatorMap data={coordinates} />
    </div>
  )
}

export default HomePage