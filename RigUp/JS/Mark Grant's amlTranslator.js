var AMLTranslator = {
	translate: (aml) => {
		// Check for string with no AML, return ***Should be done with REGEX, but going to use string methods for time.
		let HTMLTranslatedAMLString = '';
		const amlTags = {
			'%': {
				open: '<STRONG>',
				close: '</STRONG>'
			},
			'~': {
				open: '<EM>',
				close: '</EM>'
			}
		};
		// No AML Present, return the input string.
		if (!aml.includes('^')) {
			return aml;
		}
		// AML is present, capture the specific AML tag and hash it with corresponding HTML tags.
		let amlArray = aml.split(' ');
		let translatedAMLArray = [];
		let correctedAMLArray = fixSpacing(amlArray);
		translateTagsAndCreateAMLMap(correctedAMLArray, amlTags, translatedAMLArray);

		let tagArray = isolateTagsFromWords(translatedAMLArray);

		tagArray = fixHTML(tagArray);
		HTMLTranslatedAMLString = tagArray.join('');
		return HTMLTranslatedAMLString;
	}
};

if (module.exports) {
	module.exports = AMLTranslator;
}




// *** FUNCTIONS ***
// fixHTML Places closing tags & rearranges HTML tags to match HTML formatting, not AML.
const fixHTML = (tagArray) => {
	let tempArray = [];
	tagArray.forEach((string, index) => {
		if (tempArray.length > 1 && string.includes('<') && string.includes(`</`)) {
			tagArray.splice(index, 0, `</${tempArray[1]}>`);
			tagArray.splice(index + 2, 0, `<${tempArray[1]}>`);
			tempArray.pop();
		} else if (string.includes('<') && !string.includes('</')) {
			tempArray.push(string.substr(string.indexOf('<') + 1, string.indexOf('>') - 1));
		}
	});
	return tagArray;
};

// fixSpacing Corrects the spacing issues which arose from when the AML string was originally split.
const fixSpacing = (amlArray) =>
	amlArray.map((string, index) => {
		if (index != 0) return (string = ' ' + string);
		return string;
	});

// isolateTagsFromWords goes through the array of AML first generated from splitting the AML string and isolates all tags from text.
const isolateTagsFromWords = (translatedAMLArray) => {
	let tagArray = [];
	translatedAMLArray.forEach((string) => {
		let count = 0;
		count = (string.match(/</g) || []).length;
		if (count > 0) {
			for (let i = 0; i < count; i++) {
				if (string.startsWith('<')) {
					let temp = string.slice(0, string.indexOf('>') + 1);
					const re = new RegExp(temp, 'g');
					tagArray.push(temp);
					string = string.replace(re, '');
					count++;
				} else if (string.length > 0) {
					let startWord = string.slice(
						0,
						string.indexOf('<') != -1 ? string.indexOf('<') : string.length + 1
					);
					let reStart = new RegExp(startWord, 'g');
					if (startWord != '') {
						tagArray.push(startWord);
						string = string.replace(reStart, '');
						count++;
					}
				}
			}
		} else {
			tagArray.push(string);
		}
	});
	return tagArray;
};

// translateTagsAndCreateAMLMap Translates tags from AML to HTML and creates an object containing any unknown/undiscovered AML tags.
const translateTagsAndCreateAMLMap = (amlArray, amlTags, translatedAMLArray) => {
	amlArray.forEach((string, index) => {
		if (!string.includes('^')) {
			translatedAMLArray.push(string);
			return;
		}
		const openingTagIdx = string.indexOf('^') + 1;
		const openingTag = string.charAt(openingTagIdx);
		if (!amlTags[openingTag] && openingTag != '!') {
			amlTags[openingTag] = {};
			amlTags[openingTag].open = `<unknownAMLTag${index}>`;
			amlTags[openingTag].close = `</unknownAMLTag${index}>`;
		}
		// *** OPENING AND CLOSING TAGS PRESENT ***
		// Test for case when string has opening AND closing tags.
		if (string.includes('^') && string.includes('^!') && openingTag != '!') {
			let translatedString = string.replace(`^${openingTag}`, amlTags[openingTag].open);
			const closingTag = string.charAt(string.indexOf('^!') + 2);
			translatedString = translatedString.replace(`^!${closingTag}`, amlTags[closingTag].close);
			translatedAMLArray.push(translatedString);
			return;
		}
		// *** OPENING TAGS ONLY ***
		// Check that there is an AML Tag && check that it is NOT a closing tag, ie: not "!".
		if (string.includes('^') && openingTag != '!') {
			const translatedString = string.replace(`^${openingTag}`, amlTags[openingTag].open);
			translatedAMLArray.push(translatedString);
		}
		// *** CLOSING TAGS ONLY ***
		// Check that there is an AML Tag and it is a closing tag.
		if (string.includes('^!')) {
			const closingTagIdx = string.indexOf('^!') + 2;
			const closingTag = string.charAt(closingTagIdx);
			const translatedString = string.replace(`^!${closingTag}`, amlTags[closingTag].close);
			translatedAMLArray.push(translatedString);
		}
	});
};
