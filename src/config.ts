const baseUrl = 'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services';
const supplementalData = `${baseUrl}/Utah_Geological_Hazards_Supplemental_Data__test__view/FeatureServer`;
const groundshakingHazardCode = 'EGS';
const quaternaryFaultsHazardCode = 'QFF';

export interface Config {
    mapKeys: {
        overview: string,
        lidar: string,
        aerials: string,
        [key: string]: string; // This is the index signature
    },
    scaleMultiple: number,
    notProd: boolean,
    urls: {
        baseUrl: string,
        hazardGroupingsTable: string,
        hazardGroupTextTable: string,
        hazardIntroTextTable: string,
        hazardReferenceTextTable: string,
        hazardUnitTextTable: string,
        imageAgenciesTable: string,
        otherDataTable: string,
        reportTextTable: string,
        lidarExtents: string,
        aerialImageryCenterPoints: string
    },
    groundshakingHazardCode: string,
    quaternaryFaultsHazardCode: string,
    queries: Array<[string, string]>,
    webMaps: {
        hazard: string
    }
}

const config: Config = {
    mapKeys: {
        overview: 'overview-map',
        lidar: 'lidar-map',
        aerials: 'aerials-map'
    },
    scaleMultiple: 2500,
    notProd: import.meta.env.MODE !== 'production',
    urls: {
        baseUrl,
        hazardGroupingsTable: `${baseUrl}/Report_Tables_View/FeatureServer/0`,
        hazardGroupTextTable: `${baseUrl}/Report_Tables_View/FeatureServer/1`,
        hazardIntroTextTable: `${baseUrl}/Report_Tables_View/FeatureServer/2`,
        hazardReferenceTextTable: `${baseUrl}/Report_Tables_View/FeatureServer/3`,
        hazardUnitTextTable: `${baseUrl}/Report_Tables_View/FeatureServer/4`,
        imageAgenciesTable: `${baseUrl}/Report_Tables_View/FeatureServer/5`,
        otherDataTable: `${baseUrl}/Report_Tables_View/FeatureServer/7`,
        reportTextTable: `${baseUrl}/Report_Tables_View/FeatureServer/8`,
        lidarExtents: `${supplementalData}/2`,
        aerialImageryCenterPoints: `${supplementalData}/3`
    },
    groundshakingHazardCode,
    quaternaryFaultsHazardCode,
    queries: [
        ['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/0', 'FLH'], // Flood Hazard
        ['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/1', 'SGS'], // Shallow Groundwater Susceptibility
        ['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/2', 'LSS'], // Landslide Susceptibility
        ['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/3', 'LSF'], // Landslides
        ['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/4', 'LSC'], // Legacy Landslide Compilation
        ['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/5', 'CAS'], // Caliche Susceptibility
        ['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/6', 'CSS'], // Collapsible Soil Susceptibility
        ['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/7', 'CRS'], // Corrosive Soil and Rock Susceptibility
        ['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/8', 'EFH'], // Earth Fissure Hazard
        ['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/9', 'ERZ'], // Erosion Hazard Zones
        ['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/10', 'EXS'], // Expansive Soil and Rock Susceptibility
        //['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/11', 'GSP'], // Ground Subsidence Potential
        ['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/12', 'MKF'], // Karst Features
        ['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/13', 'PES'], // Piping and Erosion Susceptibility
        ['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/14', 'GRS'], // Radon Susceptibility
        ['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/15', 'RFH'], // Rockfall Hazardßß
        ['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/16', 'SDH'], // Salt Tectonics Related Ground Deformation
        ['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/17', 'SBP'], // Shallow Bedrock Potential
        ['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/18', 'SLS'], // Soluble Soil and Rock Susceptibility
        ['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/19', 'WSS'], // Wind-Blown Sand Susceptibility
        ['Utah_Geologic_Hazards_Working_Database___AGOLservice__test_view/FeatureServer/24', 'AAF'], // Alluvial Fan Inventory
        ['https://webmaps.geology.utah.gov/arcgis/rest/services/Hazards/quaternary_faults/MapServer/0', quaternaryFaultsHazardCode], // Quaternary Faults
        ['Utah_Earthquake_Hazards/FeatureServer/2', 'LQS'], // Liquefaction Susceptibility
        ['Utah_Earthquake_Hazards/FeatureServer/3', 'SFR'], // Surface Fault Rupture Hazard Special Study Zone
        ['Utah_Earthquake_Hazards/FeatureServer/5', groundshakingHazardCode] // Groundshaking Polygons
    ],
    webMaps: {
        hazard: (import.meta.env.MODE === 'development') ?
            'ed35212ca1e040bf9f6f134062056fd4' :
            'ed35212ca1e040bf9f6f134062056fd4'
    }
};

export default config;