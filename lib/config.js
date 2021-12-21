// @ts-check
/**
 * @author Sanjay Yadav <sanjay_yadav@bluestacks.com>
 */

/**
 * @type {string} [holds base url for the transifex API]
 */
const BASE_URL = 'https://rest.api.transifex.com';

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
const urls = {
  resourceUrl: `${BASE_URL}/resources`,
  uploadUrl: `${BASE_URL}/resource_strings_async_uploads`,
  downloadUrl: `${BASE_URL}/resource_translations_async_downloads`,
  downloadSourceUrl: `${BASE_URL}/resource_strings_async_downloads`,
  projectsUrl: `${BASE_URL}/projects`,
};

/**
 * @type {Object} [keep all the headers]
 */
const headers = {
  'Content-Type': 'application/vnd.api+json',
};

module.exports = {
  urls,
  headers,
};
