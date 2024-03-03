/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useContext, FC } from 'react';
// import getModules from '../esriModules';
import * as symbolUtils from "@arcgis/core/symbols/support/symbolUtils.js";
import config from '../config';
import { HazardMapContext } from './HazardMap';
import { getHazardCodeFromUnitCode } from '../helpers';
import './HazardUnit.scss';

export interface HazardUnitProps {
  HazardUnit: string;
  Description: string;
  HowToUse?: string;
}

const HazardUnit: FC<HazardUnitProps> = ({ HazardUnit, Description }) => {
  // console.log('HazardUnit', { HazardUnit, Description, HowToUse });
  const [hasLegend, setHasLegend] = useState(false);
  const legend = useRef<HTMLDivElement>();
  const mapContext = useContext(HazardMapContext);

  useEffect(() => {
    const buildLegend = async (renderer: any) => {
      // console.log('buildLegend', renderer);

      setHasLegend(true);

      // const { symbolUtils } = await getModules();
      let renderers = [];

      if (renderer.type === 'unique-value') {
        renderers = renderer.uniqueValueInfos.filter((info: any) => info.value === HazardUnit);
      }

      if (renderers.length !== 1) {
        return;
      }

      const symbol = renderers[0].symbol.clone();
      await symbolUtils.renderPreviewHTML(symbol, {
        node: legend.current
      });
    };

    const assets = mapContext.visualAssets[getHazardCodeFromUnitCode(HazardUnit)];

    if (!hasLegend && assets && assets.renderer) {
      buildLegend(assets.renderer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapContext]);

  return (
    <div className="unit">
      <div className="legend-container">
        <div ref={legend} className="legend"></div>
        <div>
          <p dangerouslySetInnerHTML={{ __html: Description }}
            title={config.notProd ? 'HazardUnitTextTable.Description' : undefined}></p>
          {/* <h4>How to Use This Map</h4>
          <p dangerouslySetInnerHTML={{ __html: HowToUse }}
            title={config.notProd && 'HazardUnitTextTable.HowToUse'}></p> */}
        </div>
      </div>
    </div>
  );
};

export default HazardUnit;