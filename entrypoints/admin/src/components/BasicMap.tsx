import * as React from "react";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

export type BasicMapProps = {};

const BasicMap: React.FC<BasicMapProps> = (props) => {
  return (
    <>
      <Map
        initialViewState={{
          longitude: 116.3912757,
          latitude: 39.906217,
          zoom: 14,
        }}
        mapStyle={{
          version: 8,
          sources: {
            "raster-tiles": {
              type: "raster",
              tiles: [
                "http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
                "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
                "http://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
                "http://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
              ],
            },
          },
          layers: [
            {
              id: "autonavi",
              type: "raster",
              source: "raster-tiles",
              minzoom: 0,
              maxzoom: 22,
            },
          ],
        }}
      />
    </>
  );
};

export default BasicMap;
