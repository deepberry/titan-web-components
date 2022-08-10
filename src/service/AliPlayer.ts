/* eslint-disable no-unused-vars */
// Aliplayer https://help.aliyun.com/document_detail/125572.html
// <link rel="stylesheet" href="https://g.alicdn.com/de/prismplayer/2.9.23/skins/default/aliplayer-min.css" />
// <script charset="utf-8" type="text/javascript" src="https://g.alicdn.com/de/prismplayer/2.9.23/aliplayer-min.js"></script>
declare class Aliplayer {
    public config: any;
    constructor(config);

    play(): void;
    pause: () => void;
    replay: () => void;
    seek: (time: number) => void;

    getCurrentTime: () => number;
    getDuration: () => number;
    getVolume: () => number;
    setVolume: (volume: number) => void;

    loadByUrl: (url: string) => void;
    replayByVidAndPlayAuth: (vid: string, playAuth: string) => void;
    replayByVidAndAuthInfo: (vid: string, authInfo: string) => void;

    setPlayerSize: (width: number, height: number) => void;
    setSpeed: (speed: number) => void;
    setSanpshotProperties: (properties: any) => void;

    getStatus: () => string;
    setRotate: (rotate: number) => void;
    getRotate: () => number;

    setImage: (image: string) => void;
    dispose: () => void;
    setCover: (cover: string) => void;

    setProgressMarkers: (markers: any) => void;
    setPreviewTime: (time: number) => void;
    getPreviewTime: () => number;
    isPreview: () => boolean;
    getCurrentPDT: () => number;
}

interface PlayerOptions {
    [propName: string]: number | string | boolean | object;
}
const createPlayer = function (config) {
    return new Aliplayer(config);
};

export { createPlayer, PlayerOptions };
