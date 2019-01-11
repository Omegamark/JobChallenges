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
		// Split the AML string.
		let amlArray = aml.split(' ');
		let translatedAMLArray = [];

		let correctedAMLArray = fixSpacing(amlArray);

		translateTagsAndCreateAMLMap(correctedAMLArray, amlTags, translatedAMLArray);

		// Validate translatedAMLArray for interior closing tags.
		let tagArray = isolateTagsFromWords(translatedAMLArray);

		// console.log('tagArray', tagArray);
		tagArray = fixHTML(tagArray);
		// Make a string from the validated array
		HTMLTranslatedAMLString = tagArray.join('');
		return HTMLTranslatedAMLString;
	}
};

if (module.exports) {
	module.exports = AMLTranslator;
}

// *** FUNCTIONS ***
// Flatten array function
// const flatten = (list) => list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
// Add closing tags
const fixHTML = (tagArray) => {
	// console.log('HTML FIXED', tagArray);
	let tempArray = [];
	
	tagArray.forEach((string, index) => {
		// take care of case of first tag
		if (tempArray.length > 1 && string.includes('<') && string.includes(`</`)) {
			console.log('Hitting conditional');
			// Place additional tag before
			tagArray.splice(index, 0, `</${tempArray[1]}>`);
			// Place additional tag after
			tagArray.splice(index + 2, 0, `<${tempArray[1]}>`);
			tempArray.pop()
		} else if (string.includes('<') && !string.includes('</')) {
			// 1. Grab first open tag
			// 2. Grab the tagName ONLY so can test for closing tag
			// *** Index 0 is always the unclosed, exterior tag. 1 is the unclosed interior tag.
			tempArray.push(string.substr(string.indexOf('<') + 1, string.indexOf('>') - 1));
			console.log("I'm temp!!!!!!!!!!!!!!!!!!!", tempArray);
		}
	});
	// 4. If open tag, grab the tag
	// 5. Test next tag to see if it closes the last tag
	// 6. If NOT, splice in the closing tag
	// 7. Remove opening tag from list
	// 8. Test if next tag closes original tag
	// 9. If NOT, repeat from 2.
	return tagArray;
};

const fixSpacing = (amlArray) =>
	amlArray.map((string, index) => {
		// Correct spacing on items for corrected solution.
		// When using HOFs, arrays must be initialized in this manner for JS to recognize them as such. The arrays are built without indexes if they aren't specified.
		// let correctedAMLArray = [...Array(amlArray.length)].map((_, i) => i);
		if (index != 0) return (string = ' ' + string);
		return string;
	});

const isolateTagsFromWords = (translatedAMLArray) => {
	let tagArray = [];
	translatedAMLArray.forEach((string) => {
		// console.log('STRING STRINGSTRING STRING STRING STRING', string);
		// Find the number of AML tags in the string
		let count = 0;
		count = (string.match(/</g) || []).length;

		if (count > 0) {
			for (let i = 0; i < count; i++) {
				// Is the first element a tag? If not, push word to array.
				if (string.startsWith('<')) {
					// Push tag to tagArray
					let temp = string.slice(0, string.indexOf('>') + 1);
					const re = new RegExp(temp, 'g');

					// console.log('TEMP TEMP TEMP TEMP', temp);
					tagArray.push(temp);
					//Delete tag from string
					string = string.replace(re, '');
					// // Ensure there is nothing left in the string, when word begins with a tag.
					// if (string != null) count++;
					count++;
				} else if (string.length > 0) {
					// console.log("FUCKFUCKFUCKFUCKFUCKFUCKFUCK", string.indexOf("<"))
					let startWord = string.slice(
						0,
						string.indexOf('<') != -1 ? string.indexOf('<') : string.length + 1
					);
					let reStart = new RegExp(startWord, 'g');
					// console.log('STARTWORD STARTWORD STARTWORD STARTWORD', startWord);
					if (startWord != '') {
						tagArray.push(startWord);
						string = string.replace(reStart, '');
						count++;
					}
					// increment count so all tags are captured in the loop
				}
			}
		} else {
			// console.log("I'm being pushed", string);
			tagArray.push(string);
		}
	});
	return tagArray;
};

// Translates tags from AML to HTML
const translateTagsAndCreateAMLMap = (amlArray, amlTags, translatedAMLArray) => {
	amlArray.forEach((string, index) => {
		// Test that string has AML tag(s)
		if (!string.includes('^')) {
			translatedAMLArray.push(string);
			return;
		}

		// Testing opening tag case
		const openingTagIdx = string.indexOf('^') + 1;
		const openingTag = string.charAt(openingTagIdx);
		// Create entry in object for unknown AML tags.
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
			// Replace opening tags
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
