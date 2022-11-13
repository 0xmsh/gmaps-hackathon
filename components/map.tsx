import { useState, useMemo, useCallback, useRef } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  DrawingManager,
  MarkerClusterer,
} from "@react-google-maps/api";
import Places from "./places";
import Distance from "./distance";

type LatLngLiteral = google.maps.LatLngLiteral;
type DirectionsResult = google.maps.DirectionsResult;
type MapOptions = google.maps.MapOptions;

export default function Map() {
  const [start, setStart] = useState<LatLngLiteral>();
  const [end, setEnd] = useState<LatLngLiteral>();
  const [directions, setDirections] = useState<DirectionsResult>();
  // show drawing manager
  const [showDrawingManager, setShowDrawingManager] = useState(false);
  const mapRef = useRef<GoogleMap>();
  const center = useMemo<LatLngLiteral>(
    () => ({ lat: 22, lng: 77 }),
    []
  );
  const options = useMemo<MapOptions>(
    () => ({
      mapId: "b181cac70f27f5e6",
      disableDefaultUI: true,
      clickableIcons: false,
    }),
    []
  );
  const [routePoints, setRoutePoints] = useState<LatLngLiteral[]>([]);

  const onLoad = useCallback((map) => (mapRef.current = map), []);
  // const houses = useMemo(() => editPoints(office), [office]);

  const fetchDirections = () => {
    if (!start && !end) return;

    // clear previous directions
    setDirections(undefined);
    // clear route points
    setRoutePoints([]);

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: start!,
        destination: end!,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);
        }
      }
    );
  };

  const editRoute = () => {
    if (!directions) return;

    setRoutePoints(
      directions.routes[0].overview_path.map((p) => ({
        lat: p.lat(),
        lng: p.lng(),
      }))
    );
  }

  return (
    <div className="container">
      <div className="map">
        <GoogleMap
          zoom={10}
          center={center}
          mapContainerClassName="map-container"
          options={options}
          onLoad={onLoad}
        >
          {showDrawingManager && (
            <DrawingManager
              options={{
                drawingControl: true,
                drawingControlOptions: {
                  position: google.maps.ControlPosition.TOP_CENTER,
                  drawingModes: [google.maps.drawing.OverlayType.POLYLINE],
                },
              }}/>)}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  zIndex: 50,
                  strokeColor: "#1976D2",
                  strokeWeight: 5,
                },
              }}
            />
          )}

          {start && (
            <>
              <Marker
                position={start}
              />
            </>
          )}
          {end && (
            <>
              <Marker
                position={end}
              />
            </>
          )}

          {routePoints && (
            <MarkerClusterer>
            {(clusterer) =>
              routePoints.map((routePoint) => (
                <Marker
                  key={routePoint.lat + routePoint.lng}
                  position={routePoint}
                  clusterer={clusterer}
                  clickable={true}
                  draggable={true}
                />
              ))
            }
          </MarkerClusterer>
            )}
        </GoogleMap>
      </div>
      <div className="controls">
        <h1>Elevation Maps</h1>
        <button className="btn" onClick={fetchDirections}>Get Directions</button>
        <button onClick={editRoute}>Edit route</button>
        <button onClick={() => {setRoutePoints([]); setDirections(undefined)}}>Clear Route</button>      
        <button onClick={() => {setShowDrawingManager(true)}}>Draw Route</button>
        <button>Get Elevation</button>
        <button>Show Elevation Profile</button>
        <Places
          setStart={(position: any) => {
            setStart(position);
            mapRef.current?.panTo(position);
          }}
          setEnd={(position: any) => {
            setEnd(position);
            mapRef.current?.panTo(position);
          }}
        />
        
        {!start && <p>Enter the address of your startpoint.</p>}
        {directions && <Distance leg={directions.routes[0].legs[0]} />}
      </div>
    </div>
  );
}
