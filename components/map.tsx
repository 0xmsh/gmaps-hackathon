import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  DrawingManager,
  MarkerClusterer,
  OverlayView
} from "@react-google-maps/api";
import Places from "./places";
import Distance from "./distance";    
import axios from "axios";
import { Chart } from "react-google-charts";
import { Client } from '@googlemaps/google-maps-services-js';
import { json } from "stream/consumers";

const data = [
  ["Index", "Elevation"]
]

const chart_options = {
  title: 'Elevation Profile',
  colors: ['#20445e', '#60485e', '#39a89e', '#30489e', '#30788e'],
  backgroundColor: '#dbd4bf',
}


type LatLngLiteral = google.maps.LatLngLiteral;
type DirectionsResult = google.maps.DirectionsResult;
type MapOptions = google.maps.MapOptions;

export default function Map() {
  const [start, setStart] = useState<LatLngLiteral>();
  const [end, setEnd] = useState<LatLngLiteral>();
  const [directions, setDirections] = useState<DirectionsResult>();
  const [elevation, setElevation] = useState<any>();
  const [graphLoc, setGraphLoc] = useState<any>();
  const [graphData, setGraphData] = useState<any>();
  // show drawing manager
  const [showDrawingManager, setShowDrawingManager] = useState(false);
  const mapRef = useRef<GoogleMap>();
  const center = useMemo<LatLngLiteral>(
    () => ({ lat: 22, lng: 77 }),
    []
  );

  useEffect(() => {
    if (elevation) {
      console.log(elevation);
      setGraphLoc(elevation[elevation.length - 1]);
      const graph_data = [
        ["Index", "Elevation"],
      ]
      
      elevation.forEach((e: any, i: number) => {
        console.log(typeof e.elevation)
        graph_data.push([i, e.elevation])
      })
      setGraphData(graph_data);
    }
  }, [elevation])

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
  

  const viewPoints = () => {
    if (!directions) return;

    setRoutePoints(
      directions.routes[0].overview_path.map((p) => ({
        lat: p.lat(),
        lng: p.lng(),
      }))
    );
  }

  const onPolylineComplete = (polyline: any) => {
    console.log(polyline)
    polyline.getPath().getArray().forEach((latLng: any) => {
      console.log(latLng.lat(), latLng.lng())
      setRoutePoints((prev) => [...prev, { lat: latLng.lat(), lng: latLng.lng() }])
      }
    )
  }

  const getElevation = async (latLng: any) => {
    const { data } = await axios.get('/api/elevation',{
      params: {
        locations: JSON.stringify(latLng)
      }
    });
    setElevation(undefined)
    setElevation(data.results)
  };

  // drawing manager polyline options
  const polylineOptions = useMemo(() => ({
    strokeColor: "#000000",
    strokeOpacity: 1,
    strokeWeight: 3,
    editable: true,
    draggable: true,
    geodesic: true,
  }), []);


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
              onPolylineComplete={onPolylineComplete}
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
          {elevation && (
                        <OverlayView
                        position={end}
                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                      >
                        <div style={{ 
                          backgroundColor: `red`,
                          minWidth: `1000px`,
                          }}>
                        <Chart
                          chartType="AreaChart"
                          data={graphData}
                          width="100%"
                          height="600px"
                          options={chart_options}
                          legendToggle
                        />
                        </div>
                      </OverlayView>
            )
          }

        </GoogleMap>

      </div>
      <div className="controls">
        <h1>Elevation Maps</h1>
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

        <div className="flex">
          <button className="button" onClick={fetchDirections}>Get Directions</button>
          <button onClick={viewPoints}>View Points</button>
        </div>
        <div className="flex">
          <button onClick={() => {setShowDrawingManager(true)}}>Draw Route</button>
          <button onClick={() => {setShowDrawingManager(false)}}>Disable Draw</button>
        </div>
        <div className="flex">        
          <button onClick={() => {setRoutePoints([]); setDirections(undefined)}}>Clear</button> 
          <button>Upload CSV</button>
        </div>
        <div>    
          <button onClick={() => {getElevation(routePoints)}}>Get Elevation</button>
          <button onClick={() => {console.log(routePoints)}}>Show Elevation Profile</button>
        </div>
        <form>
          <input type={"file"} accept={".csv"} />
          <button>IMPORT CSV</button>
        </form>

        {directions && <Distance leg={directions.routes[0].legs[0]} />}
      </div>
    </div>
  );
}
