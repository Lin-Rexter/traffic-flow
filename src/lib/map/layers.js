import { HexagonLayer, LineLayer, PathLayer, GeoJsonLayer } from 'deck.gl';

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

export const Layer_GeoJson = (data) => {
    if (!data) return null;

    return [
        new GeoJsonLayer({
            id: 'GeoJsonLayer',
            data: data, //'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart.geo.json',
            stroked: true,
            filled: true,
            pointType: 'circle+text+icon',
            pickable: true,
            getFillColor: [160, 160, 180, 200],
            //getElevation: (f) => f.properties.congestion_level * 30,
            getLineColor: (f) => {
                const hex = f.properties.color;
                // convert to RGB
                return hex ? hex.match(/[0-9a-f]{2}/g).map(x => parseInt(x, 16)) : [0, 0, 0];
            },
            getText: (f) => f.properties.name,
            getLineWidth: 8,
            lineWidthUnits: 'pixels',
            lineWidthScale: 1,
            lineCapRounded: true,
            lineJointRounded: false,
            //extruded: true,
            //wireframe: true,
            getPointRadius: 4,
            getTextSize: 20,
            textFontWeight: 'bold',
        })
    ]
} 