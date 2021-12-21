/**
 * @class Translator
 */
export class Translator extends Transifex {
    /**
     * Object initialization
     *
     * @method constructor
     * @param {Object} param0 [to store configuration data]
     * @param {string} param0.authToken [This key stores the value of the Authentication token]
     * @param {string} param0.organizationSlug [oraganization slug for transifex]
     * @param {string} param0.projectSlug [project slug for transifex]
     * @param {string} param0.rootPath [where resources will be created]
     * @param {Object} param0.localesMap [locales mapping]
     * @param {string} param0.resourceName [name of the resource json file]
     * @returns
     */
    constructor({ authToken, organizationSlug, projectSlug, rootPath, localesMap, resourceName, }: {
        authToken: string;
        organizationSlug: string;
        projectSlug: string;
        rootPath: string;
        localesMap: any;
        resourceName: string;
    });
    /**
     * @private
     * @type {string} [directory path for the resources]
     */
    private rootPath;
    /**
     * @private
     * @type {Object} [to replace default locale name while creating json files]
     */
    private localesMap;
    /**
     * @private
     * @type {Array} [list of supported locales]
     */
    private supportedLocales;
    /**
     * This parameter is useful for those projects in which only one resource is being used.
     * Only for one resource, There is no need to show list of resources.
     *
     * @private
     * @type {String} [holds source name]
     */
    private sourceName;
    /**
     * this method is used to create a directory
     *
     * @private
     * @method createDirectory
     * @param {string} filePath [holds directory path]
     * @returns {void}
     */
    private createDirectory;
    /**
     * This method is used to create a json file
     *
     * @private
     * @method createJsonFile
     * @param {string} filePath [holds directory path]
     * @param {string} fileName [holds file name]
     * @param {JSON | object} json [hols strings which is to be written in the file]
     * @returns {Promise}
     */
    private createJsonFile;
    /**
     * This method is used to get the list of directories
     *
     * @private
     * @method getDirectories
     * @param {string} source [holds folder path]
     * @returns {Array}
     */
    private getDirectories;
    /**
     * This method is used to get json data from json file
     *
     * @private
     * @param {string} path [holds json file path]
     * @param {string} fileName [holds file name]
     * @returns {Object}
     */
    private getJsonFile;
    /**
     * This method is used to create a resource on transifex
     * and download json files for all the locales
     *
     * @private
     * @method createResource
     * @returns {void}
     */
    private createResource;
    /**
     * This method is used to download all the locales for the given resource name or page name
     *
     * @private
     * @method downloadResource
     * @param {string} resourceName [holds resource name which is to be downloaded]
     * @returns {Promise}
     */
    private downloadResource;
    /**
     * This method is used to list all the resources from transifex and to
     * give option to developer that which resource should be downloaded.
     *
     * @private
     * @method downloadResources
     * @returns {void}
     */
    private downloadResources;
    /**
     * This method is used to upload resource on transifex
     *
     * @private
     * @method uploadResource
     * @param {string} resourceName [holds resource name]
     * @returns {Promise}
     */
    private uploadResource;
    /**
     * This method is used to list all the resources from local directory and to
     * give option to developer that which resource should be uploaded.
     *
     * @private
     * @method uploadResources
     * @returns {void}
     */
    private uploadResources;
    /**
     * This method is used to choose available option from developer
     *
     * @private
     * @method getOptions
     * @param {Array} resources [holds list of resources]
     * @param {string} type [download or upload]
     * @returns {Array}
     */
    private getOptions;
    /**
     * This method is used to initialize the SDK.
     *
     * @public
     * @method init
     * @returns {void}
     */
    public init(): void;
}
import { Transifex } from "./core";
