export const getHazardCodeFromUnitCode = (unitCode: string): string => {
  return unitCode.slice(-3).toUpperCase();
}

export const getLidarFeatureName = (projectName: string, areaName?: string): string => {
  if (areaName) {
    return `${projectName} - ${areaName}`;
  }

  return projectName;
}