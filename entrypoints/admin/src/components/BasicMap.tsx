import Map, {
  FullscreenControl,
  GeolocateControl,
  MapRef,
  NavigationControl,
  ScaleControl
} from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useState, useMemo } from "react";

import { JobData } from "../data/JobData";
import "./BasicMap.css";
import JobPin from "./map/JobPin";
import JobPopup from "./map/JobPopup";

export type BasicMapProps = {
  data: JobData[];
  longitude: number;
  latitude: number;
  zoom: number;
  locateItem?: JobData;
  initLocateItem?: JobData;
};

const BasicMap: React.FC<BasicMapProps> = ({
  data,
  longitude,
  latitude,
  zoom,
  locateItem,
  initLocateItem,
}) => {
  const [popupInfo, setPopupInfo] = useState(null);
  const mapRef = useRef<MapRef>();


  useEffect(() => {
    setPopupInfo(null);
  }, [data]);

  useEffect(() => {
    if (initLocateItem) {
      mapRef.current.flyTo({
        center: [initLocateItem.longitude, initLocateItem.latitude],
        zoom: zoom,
      });
      mapRef.current.setPixelRatio(2);
    }
  }, [initLocateItem])

  useEffect(() => {
    setPopupInfo(locateItem);
    if (
      locateItem &&
      locateItem.longitude != null &&
      locateItem.latitude != null
    ) {
      mapRef.current.flyTo({
        center: [locateItem.longitude, locateItem.latitude],
        zoom: 13,
      });
    }
  }, [locateItem]);

  const markers = useMemo(() => data.map((item, index) => (
    item.longitude != null && item.latitude != null ? (
      <JobPin
        key={`JobPin_${item.id}`}
        data={item}
        onClick={(data) => {
          setPopupInfo(data);
        }}
      />
    ) : null
  )), [data]);

  return (
    <>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: longitude,
          latitude: latitude,
          zoom: zoom,
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
              tileSize: 256
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
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />

        {markers}

        {popupInfo && (
          <JobPopup
            data={popupInfo}
            onClick={(data) => {
              setPopupInfo(null);
            }}
          ></JobPopup>
        )}
      </Map>
    </>
  );
};

export default BasicMap;
