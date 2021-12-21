/**
 * @class Transifex
 */
export class Transifex {
    /**
     * Object initialization
     *
     * @method constructor
     * @param {Object} param0 [to store configuration data]
     * @param {string} param0.authToken [This key stores the value of the Authentication token]
     * @param {string} param0.organizationSlug [oraganization slug for transifex]
     * @param {string} param0.projectSlug [project slug for transifex]
     * @param {string} [param0.priority] [priority of project for translation]
     * @returns
     */
    constructor({ authToken, organizationSlug, projectSlug, priority }: {
        authToken: string;
        organizationSlug: string;
        projectSlug: string;
        priority?: string;
    });
    /**
     * @protected
     * @type {string} [holds user authentication token for transifex]
     */
    protected authToken: string;
    /**
     * @protected
     * @type {string} [holds slug of the organization]
     */
    protected organizationSlug: string;
    /**
     * @protected
     * @type {string} [holds project slug]
     */
    protected projectSlug: string;
    /**
     * @private
     * @type {string} [holds the priority of the resource ]
     */
    private priority;
    /**
     * @private
     * @type {Object} [holds all the headers]
     */
    private headers;
    /**
     * This method is used to get list of resources from transifex
     *
     * @method get
     * @returns {Promise}
     */
    get(): Promise<any>;
    /**
     * This method is used to create new resource on transifex.
     * Resource must not be already there on transifex.
     *
     * @method create
     * @param {string} resourceName [holds the name of the resource which is to be created on transifex]
     * @returns {Promise}
     */
    create(resourceName: string): Promise<any>;
    /**
     * This method is used to upload strings on transifex which are to be translated by transifex
     *
     * @method upload
     * @param {JSON | object} strings [holds source strings]
     * @param {string} resourceName [holds the name of the resource]
     * @returns {Promise}
     */
    upload(strings: JSON | object, resourceName: string): Promise<any>;
    /**
     * This method is used to download resource from transifex. (source strings | translated strings)
     *
     * @method download
     * @param {Boolean} translated [whether translated or source strings will be downloaded]
     * @param {string} resourceName [holds name of the resource]
     * @param {string} [locale] [holds locale name for which resource to be downloaded]
     * @returns {Promise}
     */
    download(translated: boolean, resourceName: string, locale?: string): Promise<any>;
    /**
     * This method is used to fetch all the supported languages
     *
     * @method getSupportedLanguages
     * @returns {Promise}
     */
    getSupportedLanguages(): Promise<any>;
}
