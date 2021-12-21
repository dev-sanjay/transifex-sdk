export type urlsType = {
    /**
     * [holds url for the get API]
     */
    resourceUrl: string;
    /**
     * [holds url for the upload API]
     */
    uploadUrl: string;
    /**
     * [holds url for the download API to download translated strings]
     */
    downloadUrl: string;
    /**
     * [holds url for the download API to download source strings]
     */
    downloadSourceUrl: string;
    /**
     * [holds url of projects endpoint]
     */
    projectsUrl: string;
};
/**
 * @typedef {Object} urlsType
 * @property {string} resourceUrl [holds url for the get API]
 * @property {string} uploadUrl [holds url for the upload API]
 * @property {string} downloadUrl [holds url for the download API to download translated strings]
 * @property {string} downloadSourceUrl [holds url for the download API to download source strings]
 * @property {string} projectsUrl [holds url of projects endpoint]
 */
/**
 * @type {urlsType} [holds APIs endpoints]
 */
export const urls: urlsType;
/**
 * @type {Object} [keep all the headers]
 */
export const headers: any;
