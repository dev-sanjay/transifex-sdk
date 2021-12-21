// @ts-check
/**
 * @author Sanjay Yadav <sanjay_yadav@bluestacks.com>
 */

/**
 * Native module imports
 */
const axios = require('axios');

/**
 * Custom module imports
 */
const { urls, headers } = require('./config');

/**
 * @class Transifex
 */
class Transifex {
  /**
   * @protected
   * @type {string} [holds user authentication token for transifex]
   */
  authToken;

  /**
   * @protected
   * @type {string} [holds slug of the organization]
   */
  organizationSlug;

  /**
   * @protected
   * @type {string} [holds project slug]
   */
  projectSlug;

  /**
   * @private
   * @type {string} [holds the priority of the resource ]
   */
  priority;

  /**
   * @private
   * @type {Object} [holds all the headers]
   */
  headers;

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
  constructor({ authToken, organizationSlug, projectSlug, priority = '' }) {
    if (!authToken || !organizationSlug || !projectSlug) {
      console.log('Error: Insufficeint params\n', {
        authToken,
        organizationSlug,
        projectSlug,
      });
      return;
    }

    this.authToken = authToken;
    this.organizationSlug = organizationSlug;
    this.projectSlug = projectSlug;
    this.priority = priority || 'normal';
    this.headers = {
      ...headers,
      Authorization: `Bearer ${this.authToken}`,
    };
  }

  /**
   * This method is used to get list of resources from transifex
   *
   * @method get
   * @returns {Promise}
   */
  get() {
    return new Promise((resolve, reject) => {
      axios // @ts-ignore
        .get(
          `${urls.resourceUrl}?filter[project]=o:${this.organizationSlug}:p:${this.projectSlug}`,
          {
            headers: { ...this.headers },
          },
        )
        .then(({ data }) => resolve(data.data))
        .catch((err) => reject(err));
    });
  }

  /**
   * This method is used to create new resource on transifex.
   * Resource must not be already there on transifex.
   *
   * @method create
   * @param {string} resourceName [holds the name of the resource which is to be created on transifex]
   * @returns {Promise}
   */
  create(resourceName) {
    if (!resourceName) {
      return Promise.reject(`Error: resource name is not available`);
    }
    resourceName = resourceName.toLowerCase();

    return new Promise((resolve, reject) => {
      axios // @ts-ignore
        .post(
          urls.resourceUrl,
          {
            data: {
              attributes: {
                accept_translations: true,
                name: resourceName,
                priority: this.priority,
                slug: `${resourceName.toLowerCase()}`,
              },
              relationships: {
                i18n_format: {
                  data: {
                    id: 'KEYVALUEJSON',
                    type: 'i18n_formats',
                  },
                },
                project: {
                  data: {
                    id: `o:${this.organizationSlug}:p:${this.projectSlug}`,
                    type: 'projects',
                  },
                },
              },
              type: 'resources',
            },
          },
          {
            headers: { ...this.headers },
          },
        )
        .then((res) => resolve(res))
        .catch((err) => reject(err.response));
    });
  }

  /**
   * This method is used to upload strings on transifex which are to be translated by transifex
   *
   * @method upload
   * @param {JSON | object} strings [holds source strings]
   * @param {string} resourceName [holds the name of the resource]
   * @returns {Promise}
   */
  upload(strings, resourceName) {
    return new Promise((resolve, reject) => {
      axios // @ts-ignore
        .post(
          urls.uploadUrl,
          {
            data: {
              attributes: {
                content: JSON.stringify(strings),
                content_encoding: 'text',
              },
              relationships: {
                resource: {
                  data: {
                    id: `o:${this.organizationSlug}:p:${this.projectSlug}:r:${resourceName}`,
                    type: 'resources',
                  },
                },
              },
              type: 'resource_strings_async_uploads',
            },
          },
          {
            headers: { ...this.headers },
          },
        )
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    });
  }

  /**
   * This method is used to download resource from transifex. (source strings | translated strings)
   *
   * @method download
   * @param {Boolean} translated [whether translated or source strings will be downloaded]
   * @param {string} resourceName [holds name of the resource]
   * @param {string} [locale] [holds locale name for which resource to be downloaded]
   * @returns {Promise}
   */
  download(translated = true, resourceName, locale) {
    const url = translated ? urls.downloadUrl : urls.downloadSourceUrl;

    let attributes = {
      content_encoding: 'text',
      file_type: 'default',
      pseudo: false,
    };

    let relationships = {};

    if (translated) {
      attributes = {
        ...attributes,
        mode: 'default',
      };

      relationships = {
        language: {
          data: {
            id: `l:${locale}`,
            type: 'languages',
          },
        },
      };
    }

    return new Promise((resolve, reject) => {
      axios // @ts-ignore
        .post(
          url,
          {
            data: {
              attributes,
              relationships: {
                ...relationships,
                resource: {
                  data: {
                    id: `o:${this.organizationSlug}:p:${this.projectSlug}:r:${resourceName}`,
                    type: 'resources',
                  },
                },
              },
              type: translated
                ? 'resource_translations_async_downloads'
                : 'resource_strings_async_downloads',
            },
          },
          {
            headers: { ...this.headers },
          },
        )
        .then((res) => {
          const id = res.data.data.id;

          const getJson = () => {
            axios // @ts-ignore
              .get(`${url}/${id}`, {
                headers: { ...this.headers },
              })
              .then(({ data }) => {
                const attributes = (data.data && data.data.attributes) || {};
                if (
                  attributes.status === 'pending' ||
                  attributes.status === 'processing'
                ) {
                  getJson();
                } else {
                  resolve(data);
                }
              })
              .catch((err) => reject(err));
          };

          getJson();
        })
        .catch((err) => reject(err));
    });
  }

  /**
   * This method is used to fetch all the supported languages
   *
   * @method getSupportedLanguages
   * @returns {Promise}
   */
  getSupportedLanguages() {
    const url = `${urls.projectsUrl}/o:${this.organizationSlug}:p:${this.projectSlug}/languages`;

    return new Promise((resolve, reject) => {
      axios // @ts-ignore
        .get(url, {
          headers: { ...this.headers },
        })
        .then(({ data }) => resolve(data.data))
        .catch((err) => reject(err));
    });
  }
}

module.exports = { Transifex };
