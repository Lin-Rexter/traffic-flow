import { AmbientLight, PointLight, LightingEffect } from "deck.gl";

export const ambientLight = new AmbientLight({
    color: [255, 255, 255],
    intensity: 1.0,
});

export const pointLight1 = new PointLight({
    color: [255, 255, 255],
    intensity: 0.8,
    position: [121, 23.5, 80000],
});

export const pointLight2 = new PointLight({
    color: [255, 255, 255],
    intensity: 0.8,
    position: [125, 28, 8000],
});

export const lightingEffect = new LightingEffect({
    ambientLight,
    pointLight1,
    pointLight2,
});

export const material = {
    ambient: 0.64,
    diffuse: 0.6,
    shininess: 32,
    specularColor: [51, 51, 51],
};

// SF: 初始座標, NYC: 目標座標
export const INITIAL_VIEW_STATE = {
    SF: {
        longitude: 121.5418953,
        latitude:  25.0383062,
        zoom: 8,
    },
    NYC: {
        longitude: 121.5418953,
        latitude: 25.0383062,
        zoom: 14,
    },
    minZoom: 1,
    maxZoom: 20,
    pitch: 25,
    bearing: 0,
};

export const colorRange = [
    [1, 152, 189],
    [73, 227, 206],
    [216, 254, 181],
    [254, 237, 177],
    [254, 173, 84],
    [209, 55, 78],
];
