/// <reference path="../types/aliplayer.d.ts" />

interface PlayerOptions {
    [propName: string]: number | string | boolean | object;
}

const createPlayer = function (config) {
    return new Aliplayer(config);
};

export { createPlayer, PlayerOptions };
