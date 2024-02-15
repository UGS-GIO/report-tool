import React, { createContext, useCallback, useState, useEffect } from 'react';
// import './App.css'
import './index.scss';
import config from './config';
import HazardMap from './reportParts/HazardMap';
import Group from './reportParts/Group';
import Hazard from './reportParts/Hazard';
import HazardUnit, { HazardUnitProps } from './reportParts/HazardUnit';
import References from './reportParts/References';
import {
  queryUnitsAsync,
  queryHazardUnitTableAsync,
  queryReferenceTableAsync,
  queryIntroTextAsync,
  queryGroupingAsync,
  queryGroupTextAsync,
  queryReportTextTableAsync,
  queryOtherDataTableAsync,
} from './services/QueryService';
import { getHazardCodeFromUnitCode } from './helpers';
import CoverPage from './reportParts/CoverPage';
import SummaryPage from './reportParts/SummaryPage';
import ProgressBar from './reportParts/ProgressBar';
import ErrorPage from './reportParts/ErrorPage';
import { Aoi } from './types/types';

export const ProgressContext = createContext({
  registerProgressItem: (itemId) => { },
  setProgressItemAsComplete: (itemId: string) => { },
});

interface Task {
  [key: string]: boolean;
}

interface HazardInfo {
  url: string;
  hazard: string;
  units: string[];
}

interface HazardUnit {
  HazardName: string;
  HowToUse: string;
  Description: string;
  HazardUnit: string;
  UnitName: string;
}

interface HazardIntro {
  Hazard: string;
  Text: string;
}

interface HazardReference {
  Hazard: string;
  Text: string;
}

interface HazardToUnitMapType {
  [key: string]: HazardUnit[];
}

function App(props: Aoi) {
  const [groupToHazardMap, setGroupToHazardMap] = useState<Record<string, string[]>>({});
  const [hazardToUnitMap, setHazardToUnitMap] = useState<HazardToUnitMapType>({});
  const [hazardIntroText, setHazardIntroText] = useState<HazardIntro[] | undefined>();
  const [hazardReferences, setHazardReferences] = useState<HazardReference[] | undefined>();
  const [queriesWithResults, setQueriesWithResults] = useState<HazardInfo[]>([]);
  const [groupToTextMap, setGroupToTextMap] = useState<Record<string, string>>({});
  const [reportTextMap, setReportTextMap] = useState<Record<string, string>>({});
  const [tasks, setTasks] = useState<Task>({});
  const [pageError, setError] = useState<Error | false>(false);


  const registerProgressItem = useCallback((itemId: string) => {
    console.log('ITEM ID', itemId);

    setTasks(previousTasks => {
      if (previousTasks[itemId]) {
        throw Error(`${itemId} is already registered as a progress task!`);
      }

      return {
        ...previousTasks,
        [itemId]: false
      };
    });
  }, []);

  const setProgressItemAsComplete = useCallback((itemId: string) => {
    setTasks(previousTasks => {
      return {
        ...previousTasks,
        [itemId]: true
      };
    });
  }, []);


  useEffect(() => {
    const getData = async () => {
      console.log('App.getData');

      const relatedTablesProgressId = 'related tables'
      registerProgressItem(relatedTablesProgressId);

      const allHazardInfos = await Promise.all(config.queries.map(async featureClassMap => {
        console.log('FEATURE CLASS MAP', featureClassMap);

        registerProgressItem(featureClassMap);

        const data_1 = await queryUnitsAsync(featureClassMap, props.polygon);
        setProgressItemAsComplete(featureClassMap);
        return data_1;
      }));

      console.log('queried all units');

      const hazardInfos = allHazardInfos.filter(({ units }) => units.length > 0);
      const flatUnitCodes = Array.from(new Set(hazardInfos.reduce((previous, { units }) => previous.concat(units), [])));
      setQueriesWithResults(hazardInfos.map(info => [info.url, info.hazard]));

      // these queries can be done simultaneously
      const [
        groupings,
        hazardIntroText,
        hazardUnitText,
        hazardReferences,
        reportTextRows,
        otherDataRows,
        // lidarFeatures,
        // aerialFeatures
      ] = await Promise.all([
        queryGroupingAsync(flatUnitCodes),
        queryIntroTextAsync(flatUnitCodes),
        queryHazardUnitTableAsync(flatUnitCodes),
        queryReferenceTableAsync(flatUnitCodes),
        queryReportTextTableAsync(),
        queryOtherDataTableAsync(),
        // queryLidarAsync(props.polygon),
        // queryAerialAsync(props.polygon)
      ]);
      setProgressItemAsComplete(relatedTablesProgressId);

      const otherDataMapBuilder = {};
      otherDataRows.forEach(row => {
        otherDataMapBuilder[row.Data] = row;
      });
      // setOtherDataMap(otherDataMapBuilder);

      const reportTextMapBuilder = {};
      reportTextRows.forEach(({ Section, Text }) => {
        reportTextMapBuilder[Section] = Text;
      });
      setReportTextMap(reportTextMapBuilder);

      const flatGroups = Array.from(new Set(groupings.map(({ HazardGroup }) => HazardGroup)));
      const groupText = await queryGroupTextAsync(flatGroups);

      const groupToTextMapBuilder = {};
      const groupToHazardMapBuilder = {};
      groupText.forEach(({ HazardGroup, Text }) => {
        groupToTextMapBuilder[HazardGroup] = Text;

        // build this object here so that the order is correct for when we use it in the jsx below
        groupToHazardMapBuilder[HazardGroup] = [];
      });

      const hazardToUnitMapBuilder = {};
      console.log('hazardUnitText', hazardUnitText);

      hazardUnitText.forEach(({ HazardUnit, HazardName, HowToUse, Description, UnitName }) => {
        const hazardCode = getHazardCodeFromUnitCode(HazardUnit);

        if (!hazardToUnitMapBuilder[hazardCode]) {
          hazardToUnitMapBuilder[hazardCode] = [];
        }

        hazardToUnitMapBuilder[hazardCode].push({ HazardName, HowToUse, Description, HazardUnit, UnitName });
      });

      groupings.forEach(({ HazardCode, HazardGroup }) => groupToHazardMapBuilder[HazardGroup].push(HazardCode));

      console.log('HAZARD TO UNIT MAP', hazardToUnitMapBuilder);
      setHazardToUnitMap(hazardToUnitMapBuilder);
      setGroupToHazardMap(groupToHazardMapBuilder);
      setHazardIntroText(hazardIntroText);
      setHazardReferences(hazardReferences);
      setGroupToTextMap(groupToTextMapBuilder);
      // setLidarFeatures(lidarFeatures);
      // setAerialFeatures(aerialFeatures);
    };

    if (props.polygon) {
      getData().then(() => { }, (error) => {
        console.warn(error);
        setError(error);
      });
    }
  }, [props.polygon, registerProgressItem, setProgressItemAsComplete]);

  return (!pageError ? <>
    <ProgressContext.Provider value={{ registerProgressItem, setProgressItemAsComplete }}>
      <ProgressBar className="print--hide" tasks={tasks}>
        <div className="print-button">
          <button onClick={window.print}>Print Report</button>
        </div>
      </ProgressBar>
      <div className="app__container">
        <HazardMap aoi={props.polygon} queriesWithResults={queriesWithResults}>
          <CoverPage aoiDescription={props.description} {...reportTextMap} />
          <SummaryPage {...reportTextMap}
            hazardToUnitMap={hazardToUnitMap}
            // aerialFeatures={aerialFeatures}
            // lidarFeatures={lidarFeatures}
            groupToHazardMap={groupToHazardMap} />
          {Object.keys(groupToHazardMap).map(groupName => (
            <Group key={groupName} name={groupName} text={groupToTextMap[groupName]}>
              {hazardIntroText && hazardReferences && hazardToUnitMap && groupToHazardMap[groupName].map(hazardCode => {
                const intro = hazardIntroText.filter(x => x.Hazard === hazardCode)[0];
                const introText = (intro) ? intro.Text : '';
                const references = hazardReferences.filter(x => x.Hazard === hazardCode);
                const units = hazardToUnitMap[hazardCode];
                return (
                  <Hazard name={units[0].HazardName} group={groupName} introText={introText} key={hazardCode} code={hazardCode}>
                    {units.map((unit: HazardUnitProps, index: number) => <HazardUnit key={index} {...unit} />)}
                    <References references={references.map(({ Text }) => Text)}></References>
                  </Hazard>
                )
              })}
            </Group>
          ))}
          {/* <OtherDataPage {...otherDataMap['Lidar Elevation Data']} mapKey={config.mapKeys.lidar} id="lidar">
            {lidarFeatures.map((feature, index) => <LidarFeature key={index} {...feature} />)}
          </OtherDataPage>
          <OtherDataPage {...otherDataMap['Aerial Photography and Imagery']} mapKey={config.mapKeys.aerials} id="aerial-photography">
            {aerialFeatures.map((feature, index) => <AerialFeature key={index} {...feature} />)}
          </OtherDataPage> */}
        </HazardMap>
        <div className="header page-break">
          <h1>OTHER GEOLOGIC HAZARD RESOURCES</h1>
          <p dangerouslySetInnerHTML={{ __html: reportTextMap.OtherGeologicHazardResources }}
            title={config.notProd ? 'ReportTextTable.Text(OtherGeologicHazardResources)' : undefined}></p>
        </div>
      </div>
    </ProgressContext.Provider>
  </> : <ErrorPage error={pageError} />);
}

export default App
