interface SpatialReference {
    wkid: number;
}

export interface Polygon {
    rings: number[][][];
    spatialReference: SpatialReference;
}

export interface Aoi {
    description: string;
    polygon: Polygon;
}