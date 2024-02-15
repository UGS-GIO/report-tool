import { useRef, useContext, useEffect, FC } from 'react';
import { HazardMapContext } from './HazardMap';
import './MapSurround.scss';
import Loader from './Loader';

interface MapSurroundProps {
  mapKey: string;
}

const MapSurround: FC<MapSurroundProps> = ({ mapKey }) => {
  const scaleBarRef = useRef<HTMLDivElement>(null);
  const { visualAssets } = useContext(HazardMapContext);
  const mapImage = visualAssets && visualAssets[mapKey] && visualAssets[mapKey].mapImage;
  const scale = (mapImage) ? visualAssets[mapKey].scale : 0;
  const scaleBarDom = (mapImage) ? visualAssets[mapKey].scaleBarDom : null;

  useEffect(() => {
    if (scaleBarDom && scaleBarRef.current) {
      scaleBarRef.current.appendChild(scaleBarDom);
    }
  }, [scaleBarDom]);

  if (mapImage) {
    return (
      <>
        <img src={mapImage} alt="map" className="map-surround__image" />
        <div className="map-surround__parts">
          <div ref={scaleBarRef}></div>
          <div className="map-surround__scale-text">Scale 1:{Math.round(scale).toLocaleString()}</div>
        </div>
      </>
    );
  }

  return (<Loader />);
};

export default MapSurround;