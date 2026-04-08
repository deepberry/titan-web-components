import { $titan } from "../utils/api";

export function getAMapPlace(params) {
    return $titan().get(`/plugins/amap/place`, { params });
}

export function decodeAMapGeo(params) {
    return $titan().get(`/plugins/amap/regeocode`, { params });
}
