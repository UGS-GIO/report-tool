import config from '../config';
import queryString from 'query-string';
import { getHazardCodeFromUnitCode } from '../helpers';
import { Aoi, HazardInfo } from '../types/types';
// import { useQuery } from '@tanstack/react-query';
// import use from '../hooks/use';

interface FeatureType {
  attributes: { [key: string]: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericObject = { [key: string]: any };

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, outputFormatter: (response: GenericObject) => unknown) => {

  // fetch 3 times with 1 second delay
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw {
          ...response,
          requestURL: url
        };
      }

      const responseJson: GenericObject = await response.json();

      if (responseJson.error) {
        throw {
          ...responseJson,
          requestURL: url
        };
      }

      return outputFormatter(responseJson);
    } catch (error) {
      if (i === 2) {
        throw error;
      }

      await delay(1000);
    }
  }
}

const retryPolicy = (url: string, outputFormatter: (response: GenericObject) => unknown = response => response) => {
  return new Promise((resolve, reject) => {
    fetchWithRetry(url, outputFormatter)
      .then(resolve)
      .catch(reject);
  });
}

export const queryUnitsAsync = async (meta: [string, string], aoi: Aoi): Promise<HazardInfo> => {

  // console.log('meta1', meta);

  // console.log('QueryService.queryUnitsAsync');

  const [url, hazard] = meta

  let finalUrl = url;

  if (!url.startsWith('https')) {
    finalUrl = `${config.urls.baseUrl}/${finalUrl}`;
  }

  const hazardField = `${hazard}HazardUnit`;

  const parameters = {
    geometryType: 'esriGeometryPolygon',
    geometry: JSON.stringify(aoi.polygon),
    returnGeometry: false,
    outFields: hazardField,
    f: 'json'
  };

  return await retryPolicy(`${finalUrl}/query?${queryString.stringify(parameters)}`, (responseJson) => {
    return {
      units: responseJson.features.map((feature: FeatureType) => {
        return feature.attributes[hazardField];
      }),
      hazard,
      url
    };
  }) as HazardInfo;
};

// export const queryUnitsAsync = (meta: [string, string], aoi: any) => {
//   const [url, hazard] = meta;

//   let finalUrl = url;

//   if (!url.startsWith('https')) {
//     finalUrl = `${config.urls.baseUrl}/${finalUrl}`;
//   }

//   const hazardField = `${hazard}HazardUnit`;

//   const parameters = {
//     geometryType: 'esriGeometryPolygon',
//     geometry: JSON.stringify(aoi),
//     returnGeometry: false,
//     outFields: hazardField,
//     f: 'json'
//   };

//   const { data } = useRetryPolicy(`${finalUrl}/query?${queryString.stringify(parameters)}`, (responseJson: IResponseJson) => {
//     return {
//       units: responseJson.features.map(feature => feature.attributes[hazardField]),
//       hazard,
//       url
//     };
//   });

//   // You can now use `data`, `error`, and `isLoading` in your component or hook
//   return data;
// };

const getDistinctHazardCodesFromUnits = (units: string[]) => {
  return units.map(unit => getHazardCodeFromUnitCode(unit));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = async (url: string, where: string, outFields: string, orderByFields?: string[] | string): Promise<any> => {
  const parameters = {
    where,
    outFields,
    f: 'json',
    orderByFields
  };
  return await retryPolicy(`${url}/query?${queryString.stringify(parameters)}`, (responseJson) => responseJson.features.map((feature: FeatureType) => feature.attributes));
};

export const queryHazardUnitTableAsync = (units: string[]) => {
  // console.log('QueryService.queryHazardUnitTableAsync');

  const where = `HazardUnit IN ('${units.join('\',\'')}')`;
  const outFields = 'HazardName,HazardUnit,HowToUse,Description,UnitName';

  return queryTable(config.urls.hazardUnitTextTable, where, outFields);
};

export const queryReferenceTableAsync = (units: string[]) => {
  // console.log('QueryService.queryReferenceTableAsync');

  units = getDistinctHazardCodesFromUnits(units);
  const where = `Hazard IN ('${units.join('\',\'')}')`;
  const outFields = 'Hazard,Text';

  return queryTable(config.urls.hazardReferenceTextTable, where, outFields);
};

export const queryIntroTextAsync = (units: string[]) => {
  // console.log('QueryService.queryIntroTextAsync');

  units = getDistinctHazardCodesFromUnits(units);
  const where = `Hazard IN ('${units.join('\',\'')}')`;
  const outFields = 'Hazard,Text';
  return queryTable(config.urls.hazardIntroTextTable, where, outFields);
};

export const queryGroupingAsync = (units: string[]) => {
  // console.log('QueryService.queryGroupingAsync');
  // console.log('units', units);


  units = getDistinctHazardCodesFromUnits(units);
  const where = `HazardCode IN ('${units.join('\',\'')}')`;
  const outFields = 'HazardCode,HazardGroup';
  console.log('queryGroupingAsync', queryTable(config.urls.hazardGroupingsTable, where, outFields));


  return queryTable(config.urls.hazardGroupingsTable, where, outFields);
};

export const queryGroupTextAsync = (groups: string[]) => {
  // console.log('QueryService.queryGroupTextAsync');

  const where = `HazardGroup IN ('${groups.join('\',\'')}')`;
  const outFields = 'HazardGroup,Text';

  // Sort this data according to how you want it to show up in the report.
  // This does not affect the "OtherResources" group which is always at the bottom.
  return queryTable(config.urls.hazardGroupTextTable, where, outFields, 'Order_ ASC');
};

export const queryReportTextTableAsync = () => {
  // console.log('QueryService.queryReportTextTableAsync');

  const where = '1=1';
  const outFields = 'Section,Text';

  return queryTable(config.urls.reportTextTable, where, outFields);
};

export const queryOtherDataTableAsync = () => {
  // console.log('QueryService.queryOtherDataTable');

  const where = '1=1';
  const outFields = 'Data,Introduction,HowToUse,References_';

  return queryTable(config.urls.otherDataTable, where, outFields);
};

// export const queryLidarAsync = async (aoi: any): Promise<IFeatureAttributes[]> => {
//   const parameters = {
//     geometryType: 'esriGeometryPolygon',
//     geometry: JSON.stringify(aoi),
//     returnGeometry: false,
//     outFields: ['ProjectName', 'AreaName', 'DataAccessURL'],
//     f: 'json'
//   };

//   return await (`${config.urls.lidarExtents}/query?${queryString.stringify(parameters)}`,
//     (responseJson: IResponseJson) => responseJson.features.map(feature => feature.attributes));
// };

// export const queryAerialAsync = async (aoi: any): Promise<IFeatureAttributes[]> => {
//   const parameters = {
//     geometryType: 'esriGeometryPolygon',
//     geometry: JSON.stringify(aoi),
//     returnGeometry: false,
//     outFields: ['Agency', 'ProjectYear', 'ProjectCode', 'ProjectName', 'Roll', 'Frame'],
//     f: 'json',
//     orderByFields: 'Agency ASC, ProjectYear DESC, ProjectCode ASC'
//   };

//   const features = await (`${config.urls.aerialImageryCenterPoints}/query?${queryString.stringify(parameters)}`,
//     (responseJson: IResponseJson) => responseJson.features.map(feature => feature.attributes));
//   features.forEach((feature: any) => {
//     // feature.Description = '';
//     console.log('feature', feature);

//   });
//   const agencies = Array.from(new Set(features.map((feature: { Agency: any }) => feature.Agency)));

//   // mix in agency descriptions from related table
//   const agenciesWhere = `Agency IN ('${agencies.join(',')}')`;
//   const tableResults = await queryTable(config.urls.imageAgenciesTable, agenciesWhere, 'Agency, Description');
//   const descriptionsLookup: { [key: string]: string } = {};
//   tableResults.forEach((result: any) => {
//     descriptionsLookup[result.attributes.Agency] = result.attributes.Description;
//   });

//   return features.map((feature: any) => {
//     return {
//       ...feature,
//       Description: descriptionsLookup[feature.Agency]
//     }
//   });
// };