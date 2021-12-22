# Transifex SDK

A node module which is used to perform transifex's operations such as
  1.  Add resources to transifex
  2.  Update resources on transifex
  3.  Download translated strings of the resources from transifex

## About

This node module connects with Transifex server using REST API to perform above operations for the translations. It adds new strings to transifex, download the translated strings from transifex and updates the existing strings on transifex.

## Installation

```console
npm install --save-dev transifex-sdk
```

## Import
```javascript
const { Translator, Transifex } = require('transifex-sdk');
```
# Translator
It provides user interface on terminal where user can choose given options on command line tool to do operations like add, update or download resource.
## Usage

```javascript
const { Translator } = require('transifex-sdk');

const translator = new Translator({
  authToken: '<AUTH_TOKEN>',
  organizationSlug: '<ORGANIZATION_SLUG>',
  projectSlug: '<PROJECT_SLUG>',
});

```

## Options

| Name             | Type   | Default Value | Description                                                                                 |
| ---------------- | ------ | ------------- | ------------------------------------------------------------------------------------------- |
| authToken        | String | required      | [Auth token](https://www.transifex.com/user/settings/api/) is used to authenticate the user |
| organizationSlug | String | required      | Organization's slug                                                                         |
| projectSlug      | String | required      | Project's slug                                                                              |
| rootPath         | String | "./"          | Directory path where all strings are generated                                              |
| localesMap       | Object | {}            | Mapping of json file's names                                                                |
| resourceName     | String | ""            | Useful for those projects where only one source file is being used                          |

### localesMap:
This parameter is used to change default name of the generated resource(json file). For example, if default name of the json file for the Korean locale is _`ko_KR.json`_ then It can be changed to _`ko.json`_ by adding key-value pair in the localesMap object.
```javascript
const localesMap = {
  ko_KR: 'ko',
};
```

### resourceName:
This parameter is used when there is only one json file in the same project. By using it, Selection of resource (which resource should be downloaded or uploaded) options will not be appeared on CLI.

## Methods

### init(): To start the SDK
```javascript
/**
 * This method is used to initialize the SDK.
 *
 * @method init
 * @returns {void}
 */
translator.init();
```

# Transifex
This is a core library which provides methods to perform transifex's operation. It doesn't show interactive command line tool like translator.

## Usage

```javascript
const transifex = new Transifex({
  authToken: '<AUTH_TOKEN>',
  organizationSlug: '<ORGANIZATION_SLUG>',
  projectSlug: '<PROJECT_SLUG>',
});
```

## Methods

### get(): To get resources

```javascript
/**
 * This method is used to get list of resources from transifex
 *
 * @method get
 * @returns {Promise}
 */
transifex.get();
```

### create(): To create a resource

```javascript
/**
 * This method is used to create a new resource on transifex.
 *
 * @method create
 * @param {string} resourceName [holds the name of the resource which is to be created on transifex]
 * @returns {Promise}
 */
transifex.create(resourceName);
```

### upload(): To upload strings of a resource

```javascript
/**
 * This method is used to upload strings on transifex which are to be translated by transifex
 *
 * @method upload
 * @param {JSON | Object} strings [holds source strings]
 * @param {string} resourceName [holds the name of the resource]
 * @returns {Promise}
 */
transifex.upload(strings, resourceName);
```


### download(): To download strings of a resource

```javascript
/**
 * This method is used to download resource's strings from transifex. (source strings | translated strings)
 *
 * @method download
 * @param {Boolean} translated [whether translated or source strings will be downloaded]
 * @param {string} resourceName [holds name of the resource]
 * @param {string} [locale] [holds locale name for which resource to be downloaded]
 * @returns {Promise}
 */
transifex.download(translated = true, resourceName, locale);
```
### getSupportedLanguages(): To get supported languges

```javascript
/**
 * This method is used to fetch all the supported languages
 * 
 * @method getSupportedLanguages
 * @returns {Promise}
 */
transifex.getSupportedLanguages();
```

### Author
[Sanjay Yadav](https://github.com/1sanjay1)
