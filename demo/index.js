const path = require('path');
const { Translator, Transifex } = require('..');

const rootPath = path.join(__dirname, './');

const localesMap = {
	ko_KR: 'ko',
};

const translator = new Translator({
	authToken: '<AUTH_TOKEN>',
	organizationSlug: 'bluestacks-1',
	projectSlug: 'automation_test',
	rootPath,
	localesMap
});

translator.init();
