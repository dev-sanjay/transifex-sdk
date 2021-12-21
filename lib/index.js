// @ts-check
/**
 * @author Sanjay Yadav <sanjay_yadav@bluestacks.com>
 */

/**
 * Native module imports
 */
const path = require('path');
const fs = require('fs');
const Buffer = require('safe-buffer').Buffer;
const readlineSync = require('readline-sync');
const chalk = require('chalk');
const { diff } = require('json-diff');

/**
 * Custom module imports
 */
const { Transifex } = require('./core');

/**
 * @class Translator
 */
class Translator extends Transifex {
  /**
   * @private
   * @type {string} [directory path for the resources]
   */
  rootPath;

  /**
   * @private
   * @type {Object} [to replace default locale name while creating json files]
   */
  localesMap;

  /**
   * @private
   * @type {Array} [list of supported locales]
   */
  supportedLocales;

  /**
   * This parameter is useful for those projects in which only one resource is being used.
   * Only for one resource, There is no need to show list of resources.
   *
   * @private
   * @type {String} [holds source name]
   */
  sourceName;

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
  constructor({
    authToken,
    organizationSlug,
    projectSlug,
    rootPath = './',
    localesMap = {},
    resourceName = '',
  }) {
    super({ authToken, organizationSlug, projectSlug });

    if (!authToken || !organizationSlug || !projectSlug) {
      console.log('Error: Insufficeint params\n', {
        authToken,
        organizationSlug,
        projectSlug,
      });
      return;
    }

    this.localesMap = localesMap;
    this.supportedLocales = [];
    this.sourceName = resourceName;

    // @ts-ignore
    const callerPath = module.parent.parent.path;
    this.rootPath = path.isAbsolute(rootPath)
      ? rootPath
      : path.join(callerPath, rootPath);
  }

  /**
   * this method is used to create a directory
   *
   * @private
   * @method createDirectory
   * @param {string} filePath [holds directory path]
   * @returns {void}
   */
  createDirectory(filePath) {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, {
        recursive: true,
      });
    }
  }

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
  createJsonFile(filePath, fileName, json) {
    return new Promise((resolve, reject) => {
      fs.open(`${filePath}/${fileName}`, 'w', (err, fd) => {
        if (err) {
          return reject('Error: while opening the file');
        }

        // @ts-ignore
        const buffer = new Buffer.from(JSON.stringify(json, null, 2));
        fs.write(fd, buffer, 0, buffer.length, null, (err) => {
          if (err) {
            return reject('Error: while writing into file');
          }
          resolve();
        });
      });
    });
  }

  /**
   * This method is used to get the list of directories
   *
   * @private
   * @method getDirectories
   * @param {string} source [holds folder path]
   * @returns {Array}
   */
  getDirectories(source) {
    let dirs;
    try {
      dirs = fs
        .readdirSync(source, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);
    } catch (e) {
      dirs = [];
    }

    return dirs;
  }

  /**
   * This method is used to get json data from json file
   *
   * @private
   * @param {string} path [holds json file path]
   * @param {string} fileName [holds file name]
   * @returns {Object}
   */
  getJsonFile(path, fileName) {
    try {
      // @ts-ignore
      return JSON.parse(fs.readFileSync(`${path}/${fileName}`));
    } catch (e) {
      console.log(
        chalk.bold.red(
          'Error: No such file exist at ' + chalk.yellow(`${path}/${fileName}`),
        ),
      );

      throw new Error(e);
    }
  }

  /**
   * This method is used to create a resource on transifex
   * and download json files for all the locales
   *
   * @private
   * @method createResource
   * @returns {void}
   */
  createResource() {
    console.log(chalk.bold.white(`Enter resource name (page name)`));
    const resourceName = readlineSync.question('').replace(/\s/g, '');

    if (!resourceName) {
      console.log(chalk.bold.red(`Error: Not a valid resource name`));
      return;
    }

    const localResourcePath = `${this.rootPath}resources/${resourceName}`;
    const remoteResourcePath = `https://www.transifex.com/${this.organizationSlug}/${this.projectSlug}/${resourceName}`;

    console.log(chalk.bold(`\nAdding...${chalk.yellow(resourceName)}`));

    this.create(resourceName)
      .then(() => {
        if (fs.existsSync(localResourcePath)) {
          fs.rmdirSync(localResourcePath, { recursive: true });
        }

        this.createDirectory(`${localResourcePath}/i18n`);
        this.createJsonFile(localResourcePath, 'local.source.json', {});

        // Upload an empty json file
        this.upload({}, resourceName).then(() => {
          this.downloadResource(resourceName);
        });

        console.log(
          chalk.bold.green(
            `New resource has been added at \nremote: ` +
              chalk.bold.yellow(
                `${remoteResourcePath} \n${chalk.green(
                  'local:',
                )} ${localResourcePath}/local.source.json`,
              ),
          ),
        );
      })
      .catch((err) => {
        const errors = (err.data && err.data.errors) || [];

        if (errors[0].status === '409') {
          console.log(
            chalk.bold.green(
              `Resource has already been available at ` +
                chalk.bold.yellow(`${remoteResourcePath}`),
            ),
          );

          this.downloadResource(resourceName);
        } else {
          console.log(
            chalk.bold.red(
              'Error: Something went wrong while creating the resource.\n',
            ),
            errors[0],
          );
        }
      });
  }

  /**
   * This method is used to download all the locales for the given resource name or page name
   *
   * @private
   * @method downloadResource
   * @param {string} resourceName [holds resource name which is to be downloaded]
   * @returns {Promise}
   */
  downloadResource(resourceName) {
    return new Promise((resolve, reject) => {
      const locales = this.supportedLocales;
      const filePath = `${this.rootPath}resources/${resourceName}/i18n`;

      this.createDirectory(filePath);

      console.log(chalk.bold(`\nDownloading...${chalk.yellow(resourceName)}`));

      // sync remote and local source file with transifex's source file
      this.download(false, resourceName).then((data) => {
        this.createJsonFile(
          `${this.rootPath}resources/${resourceName}`,
          `remote.source.json`,
          data,
        );
        this.createJsonFile(
          `${this.rootPath}resources/${resourceName}`,
          `local.source.json`,
          data,
        );
      });

      console.log(chalk.bold.blue(`Status\t\tLocale\t\tResource Path`));

      const promises = locales.map(({ attributes }) =>
        this.download(true, resourceName, attributes.code),
      );

      Promise.all(promises)
        .then((values) => {
          const createJsonPromises = values.map((data, idx) => {
            const locale = locales[idx].attributes.code;
            const fileName = `${this.localesMap[locale] || locale}.json`;

            return this.createJsonFile(filePath, fileName, data);
          });

          Promise.all(createJsonPromises)
            .then((values) => {
              values.forEach((r, idx) => {
                const locale = locales[idx].attributes.code;
                const fileName = `${this.localesMap[locale] || locale}.json`;

                console.log(
                  `${chalk.green('success')}\t\t${locale}\t\t${chalk.yellow(
                    `${filePath}/${fileName}`,
                  )}`,
                );
              });

              resolve(values);
            })
            .catch((err) => {
              console.log(
                'Error: while creating json files ' + resourceName,
                err,
              );
              reject(err);
            });
        })
        .catch((err) => {
          console.log('Error: while downloading ' + resourceName, err);
          reject(err);
        });
    });
  }

  /**
   * This method is used to list all the resources from transifex and to
   * give option to developer that which resource should be downloaded.
   *
   * @private
   * @method downloadResources
   * @returns {void}
   */
  downloadResources = () => {
    console.log(chalk.bold(`\nListing the resources...`));
    this.get()
      .then((res) => {
        const resourceSlugs = res.map(({ attributes }) => attributes.slug);

        if (!resourceSlugs.length) {
          console.log(
            chalk.bold.green(
              `You have no resource to download at ${chalk.yellow(
                `https://www.transifex.com/${this.organizationSlug}/${this.projectSlug}/content/`,
              )}\nCreate resource using create command`,
            ),
          );
          return;
        }

        let selectedResources = [];

        const isValidSourceName =
          this.sourceName && resourceSlugs.includes(this.sourceName);

        if (isValidSourceName) {
          selectedResources.push(this.sourceName);
        } else {
          if (this.sourceName) {
            console.log(
              chalk.bold(
                `${chalk.red(
                  this.sourceName,
                )}, This resource is not available on transifex. Select from given list.\n`,
              ),
            );
          }
          selectedResources = this.getOptions(resourceSlugs, 'd');
        }

        /**
         * this code is used to download resources in sequence(one after another) to make
         * minimum number of API requests to the server at a time.
         */
        const sequence = async () => {
          for (const r of selectedResources) {
            await this.downloadResource(r);
          }
        };
        sequence();
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  };

  /**
   * This method is used to upload resource on transifex
   *
   * @private
   * @method uploadResource
   * @param {string} resourceName [holds resource name]
   * @returns {Promise}
   */
  uploadResource(resourceName) {
    return new Promise((resolve, reject) => {
      const localResourcePath = `${this.rootPath}resources/${resourceName}`;
      const remoteResourcePath = `https://www.transifex.com/${this.organizationSlug}/${this.projectSlug}/${resourceName}`;

      console.log(chalk.bold(`\nUpdating...${chalk.yellow(resourceName)}`));

      let localResource;
      let remoteResource;
      try {
        localResource = this.getJsonFile(
          `${localResourcePath}`,
          'local.source.json',
        );
        remoteResource = this.getJsonFile(
          `${localResourcePath}`,
          'remote.source.json',
        );
      } catch (e) {
        return reject(e);
      }

      this.download(false, resourceName)
        .then((res) => {
          if (diff(res, remoteResource)) {
            console.log(
              chalk.bold.red(
                `Error: Local resource is not upto date at ${chalk.yellow(
                  `${localResourcePath}/remote.source.json`,
                )}`,
              ),
              `\nDownload the resource first`,
            );
            resolve();
          } else if (!diff(res, localResource)) {
            console.log(
              chalk.bold.green(
                `Resource is upto date. Nothing to update from ${chalk.bold.yellow(
                  resourceName,
                )} resource`,
              ),
            );
            resolve();
          } else {
            this.upload(localResource, resourceName)
              .then(() => {
                console.log(
                  chalk.bold.green(
                    `Resource has been updated at ` +
                      chalk.bold.yellow(`${remoteResourcePath}`),
                  ),
                );

                this.downloadResource(resourceName)
                  .then(() => resolve())
                  .catch(() => reject());
              })
              .catch((err) => {
                const errors =
                  (err.response &&
                    err.response.data &&
                    err.response.data.errors) ||
                  [];

                const msg =
                  (errors[0] && errors[0].detail) ||
                  'Error: Something went wrong while creating the resource.';

                console.log(chalk.bold.red(`${msg}\n`));
                reject();
              });
          }
        })
        .catch((err) => {
          console.log(err, err.response.data.errors);
          reject();
        });
    });
  }

  /**
   * This method is used to list all the resources from local directory and to
   * give option to developer that which resource should be uploaded.
   *
   * @private
   * @method uploadResources
   * @returns {void}
   */
  uploadResources() {
    console.log(chalk.bold(`\nResources`));
    const resources = this.getDirectories(`${this.rootPath}resources`);

    if (!resources.length) {
      console.log(
        chalk.bold.red(
          `You have no resource to update at ${chalk.yellow(
            `${this.rootPath}resources/`,
          )}\n${chalk.green('Download existing resource or add new one.')}`,
        ),
      );
      return;
    }

    let selectedResources = [];

    const isValidSourceName =
      this.sourceName && resources.includes(this.sourceName);

    if (isValidSourceName) {
      selectedResources.push(this.sourceName);
    } else {
      if (this.sourceName) {
        console.log(
          chalk.bold(
            `${chalk.red(
              this.sourceName,
            )}, This resource is not available locally to upload strings. Select from given list.\n`,
          ),
        );
      }
      selectedResources = this.getOptions(resources);
    }

    /**
     * this code is used to download resources in sequence(one after another) to make
     * minimum number of API requests to the server at a time.
     */
    const sequence = async () => {
      for (const r of selectedResources) {
        await this.uploadResource(r);
      }
    };
    sequence();
  }

  /**
   * This method is used to choose available option from developer
   *
   * @private
   * @method getOptions
   * @param {Array} resources [holds list of resources]
   * @param {string} type [download or upload]
   * @returns {Array}
   */
  getOptions(resources, type = 'u') {
    resources.forEach((r) => {
      console.log(chalk.bold.yellow(r));
    });

    console.log(
      chalk.bold(
        `\nWould you like to ${
          type === 'u' ? 'update' : 'download'
        } all these resources: ${chalk.blue('yes(y) | no(n)')}`,
      ),
    );

    let answer = '';
    while (1) {
      answer = readlineSync.question('').toLowerCase();
      answer =
        answer === 'y' || answer === 'yes'
          ? 'yes'
          : answer === 'n' || answer === 'no'
          ? 'no'
          : '';

      if (answer === 'yes' || answer === 'no') break;

      console.log(
        chalk.bold.red(
          `Select a correct option: ${chalk.blue('yes(y) | no(n)')}`,
        ),
      );
    }

    let selectedResources = [...resources];
    if (answer === 'no') {
      console.log(
        chalk.bold.white(
          `Enter comma separated resources name from above list which are to be ${
            type === 'u' ? 'uploaded' : 'downloaded'
          }`,
        ),
      );

      while (1) {
        const resourceNames = readlineSync.question('');

        selectedResources = resourceNames
          .split(',')
          .map((r) => r.trim())
          .filter((r) => resources.includes(r));

        if (selectedResources.length) break;

        console.log(
          chalk.bold.red(`Select correct resource name from above list`),
        );
      }
    }

    return selectedResources;
  }

  /**
   * This method is used to initialize the SDK.
   *
   * @public
   * @method init
   * @returns {void}
   */
  init() {
    console.log(chalk.bold.white(`\nInitializing transifex SDK...\n`));
    /**
     * Get list of all the supported languages for this project along with their ids
     */
    this.getSupportedLanguages()
      .then((res) => {
        this.supportedLocales = res;

        console.log(
          chalk.bold.white(`Select option: `) +
            chalk.bold.blue('add(a) | update(u) | download(d)'),
        );

        let action = '';

        while (1) {
          action = readlineSync.question('').toLowerCase();
          action =
            action === 'a' || action === 'add'
              ? 'add'
              : action === 'u' || action === 'update'
              ? 'update'
              : action === 'd' || action === 'download'
              ? 'download'
              : '';

          if (['add', 'update', 'download'].includes(action)) break;

          console.log(
            chalk.bold.red('Please choose correct option: ') +
              chalk.bold.blue('add(a) | update(u) | download(d)'),
          );
        }

        if (action === 'add') {
          this.createResource();
        } else if (action === 'download') {
          this.downloadResources();
        } else {
          this.uploadResources();
        }
      })
      .catch((err) => {
        console.log(chalk.bold.red(`Error: Process initialization`), err);
      });
  }
}

module.exports = { Translator };
