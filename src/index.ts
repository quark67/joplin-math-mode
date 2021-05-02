import joplin from 'api';
import { ContentScriptType } from 'api/types';
import { MenuItemLocation } from 'api/types';
import { SettingItemType } from 'api/types';

const contentScriptId = 'literate-math-mode';

const defaultConfig = {
	global: false,
	simplify: false,
	bignumber: false,
	displaytotal: false,
	hide: false,
	verbose: true,
	inline: true,
	notation: 'auto',
	lowerExp: -3,
	upperExp: 9,
	precision: 8,
	align: 'left',
	inlinesyntax: true,
};


joplin.plugins.register({
	onStart: async function() {
		// // // // // // // // // // // // // // // 
		// Handle Settings
		// // // // // // // // // // // // // // //

		await joplin.settings.registerSection('settings.calebjohn.mathmode', {
			label: 'Math Mode',
			iconName: 'fas fa-calculator'
		});

		await joplin.settings.registerSetting('bignumber', {
			value: defaultConfig.bignumber,
			type: SettingItemType.Bool,
			section: 'settings.calebjohn.mathmode',
			public: true,
			advanced: true,
			label: 'Use 128 bit BigNumbers for calculations ',
			description: '**warning some mathjs features won\'t work**',
    });
		await joplin.settings.registerSetting('verbose', {
			value: defaultConfig.verbose,
			type: SettingItemType.Bool,
			section: 'settings.calebjohn.mathmode',
			public: true,
			label: 'When assigning a variable, show the name next to the result'
    });
		await joplin.settings.registerSetting('inline', {
			value: defaultConfig.inline,
			type: SettingItemType.Bool,
			section: 'settings.calebjohn.mathmode',
			public: true,
			label: 'Show result next to input (inline)'
    });
		await joplin.settings.registerSetting('notation', {
			value: defaultConfig.notation,
			type: SettingItemType.String,
			isEnum: true,
			options: {'engineering': 'Engineering', 'exponential': 'Exponential', 'auto': 'Auto', 'fixed': 'Fixed'},
			// mathjs rejects bin, oct and hex for some reason
			// options: {'engineering': 'Engineering', 'exponential': 'Exponential', 'auto': 'Auto', 'fixed': 'Fixed', 'bin': 'Binary', 'oct': 'Octal', 'hex': 'Hex'},
			section: 'settings.calebjohn.mathmode',
			public: true,
			label: 'Which notation should be used for results?'
    });
		await joplin.settings.registerSetting('lowerExp', {
			value: defaultConfig.lowerExp,
			type: SettingItemType.Int,
			section: 'settings.calebjohn.mathmode',
			step: 1,
			public: true,
			advanced: true,
			label: 'Lower boundary to format a number as an exponent (auto notation only)'
    });
		await joplin.settings.registerSetting('upperExp', {
			value: defaultConfig.upperExp,
			type: SettingItemType.Int,
			section: 'settings.calebjohn.mathmode',
			step: 1,
			public: true,
			advanced: true,
			label: 'Upper boundary to format a number as an exponent (auto notation only)'
    });
		await joplin.settings.registerSetting('precision', {
			value: defaultConfig.precision,
			type: SettingItemType.Int,
			section: 'settings.calebjohn.mathmode',
			minimum: 0,
			maximum: 16,
			step: 1,
			public: true,
			label: 'How many digits of display precision should math results have?'
    });
		await joplin.settings.registerSetting('align', {
			value: defaultConfig.align,
			type: SettingItemType.String,
			isEnum: true,
			options: { 'left': 'Left', 'right': 'Right' },
			section: 'settings.calebjohn.mathmode',
			public: true,
			label: 'Which side should math be aligned to?'
    });
		await joplin.settings.registerSetting('inlinesyntax', {
			value: defaultConfig.inlinesyntax,
			type: SettingItemType.Bool,
			section: 'settings.calebjohn.mathmode',
			public: true,
			label: 'Treat lines that start with `=` as math lines.'
    });

		await joplin.contentScripts.onMessage(contentScriptId, async (message:any) => {
			if (message.name === 'getConfig') {
				return {
					global: defaultConfig.global ? 'yes' : 'no',
					simplify: await joplin.settings.value('simplify') ? 'yes': 'no',
					bignumber: await joplin.settings.value('bignumber') ? 'yes': 'no',
					displaytotal: defaultConfig.displaytotal ? 'yes' : 'no',
					hide: defaultConfig.hide ? 'yes' : 'no',
					verbose: await joplin.settings.value('verbose') ? 'yes': 'no',
					inline: await joplin.settings.value('inline') ? 'yes': 'no',
					notation: await joplin.settings.value('notation'),
					lowerExp: await joplin.settings.value('lowerExp'),
					upperExp: await joplin.settings.value('upperExp'),
					precision: await joplin.settings.value('precision'),
					align: await joplin.settings.value('align'),
					inlinesyntax: await joplin.settings.value('inlinesyntax'),
				};
			}

			return "Error: " + message + " is not a valid message";
		});

		// // // // // // // // // // // // // // // 
		// Register Content Scripts
		// // // // // // // // // // // // // // //

		await joplin.contentScripts.register(
			ContentScriptType.CodeMirrorPlugin,
			contentScriptId,
			'./mathMode.js'
		);
	},
});
