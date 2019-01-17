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
		console.log("I'm aml array", amlArray);
		let translatedAMLArray = [];
		amlArray = fixSpacing(amlArray);
		// translateTagsAndCreateAMLMap(correctedAMLArray, amlTags, translatedAMLArray)

		let amlTagArray = isolateTagsFromWords(amlArray);

		// generate aml tag map
		generateAMLTagMap(amlTagArray, amlTags);

		// Translate amlTagArray()
		translateAMLTags(amlTagArray, amlTags);
		console.log("I'm an amlTagArray", amlTagArray);

		// amlTagArray = fixSpacing(amlTagArray);
		console.log(amlTagArray);
		fixHTML(amlTagArray);

		// tagArray = fixHTML(tagArray);
		// console.log(amlArray);
		HTMLTranslatedAMLString = amlTagArray.join('');
		console.log('AML Tag Legened:', amlTags);
		return HTMLTranslatedAMLString;
	}
};

if (module.exports) {
	module.exports = AMLTranslator;
}

// *** FUNCTIONS ***
const isolateTagsFromWords = function(amlArray) {
	let tagArray = [];
	amlArray.forEach((string) => {
		// Check that there are tags in the string.
		if (!string.includes('^')) tagArray.push(string);
		// Count the number of tags in the string.
		let count = (string.match(/\^/g) || []).length;
		// Separate tags in a for loop.
		while (count > 0) {
			// Push any non-tag words into the array.
			if (!string.startsWith('^')) {
				const temp = string.slice(0, string.indexOf('^'));
				tagArray.push(temp);
				const re = new RegExp(temp, 'g');
				string = string.replace(re, '');
			}

			// Check if it is an opening or closing tag.
			if (string.charAt(1) != '!') {
				// Capture the opening tag.
				const tag = string.slice(0, 2);
				const amlTagIdentifier = string.slice(1, 2);
				// Add tag to array.
				tagArray.push(tag);
				// Delete tag from string for next iteration
				// *** "^" must be escaped for regex to work. Must be escaped 2x, 1 for New Regex, 1 for replace(regex, "").
				const re = new RegExp(`\\^\\${amlTagIdentifier}`, 'g');
				string = string.replace(re, '');
				// if there are additional words after a tag
				count--;
				// Push any remaining words to the array.
				if (count === 0 && string.length != 0) tagArray.push(string);
			} else {
				// Capture the closing tag.
				const tag = string.slice(0, 3);
				const amlTagIdentifier = string.slice(2, 3);
				// Add tag to array.
				tagArray.push(tag);
				// Delete tag from string for next iteration
				const re = new RegExp(`\\^!\\${amlTagIdentifier}`, 'g');
				string = string.replace(re, '');
				// Decrement counter
				count--;
				// Push any remaining words to the array.
				if (count === 0 && string.length != 0) tagArray.push(string);
			}
		}
	});
	console.log('Fix this tagArray!!!!!!!!!!!!!!!!!!!1111', tagArray);
	return tagArray;
};

const generateAMLTagMap = (amlTagArray, amlTags) => {
	amlTagArray.forEach((string) => {
		// Check if string is a word.
		let unknownTagCount = 0;
		if (!string.includes('^')) return;
		// Trim the string.
		string.trim();
		// Check opening tags only, no need for both open and close.
		if (string.length == 2) {
			// Capture the identifier
			let safeTag = string;
			safeTag = string[1];
			// Check for specific <u> case.
			if (safeTag === '*') {
				amlTags[safeTag] = {};
				amlTags[safeTag].open = '<u>';
				amlTags[safeTag].close = '</u>';
			}
			// Check if the tag exists, if not, then create.
			if (!amlTags[safeTag]) {
				unknownTagCount++;
				amlTags[safeTag] = {};
				amlTags[safeTag].open = `<unknownAMLTag${unknownTagCount}>`;
				amlTags[safeTag].close = `</unknownAMLTag${unknownTagCount}>`;
			}
		}
	});
};

// fixSpacing Corrects the spacing issues which arose from when the AML string was originally split.
const fixSpacing = (amlTagArray) =>
	amlTagArray.map((string, index) => {
		if (index != 0) return (string = ' ' + string);
		return string;
	});

const translateAMLTags = (amlTagArray, amlTags) => {
	amlTagArray.forEach((string, index) => {
		if (!string.includes('^')) return;
		// Capture the tag identifier:
		const tag = string[string.length - 1];
		// Check for closing tag
		if (string.includes('^!')) return (amlTagArray[index] = amlTags[tag].close);
		amlTagArray[index] = amlTags[tag].open;
	});
};

// fixHTML Places closing tags & rearranges HTML tags to match HTML formatting, not AML.
const fixHTML = (amlTagArray) => {
	// Check for space before word.
	let tempArray = [];
	// console.log("I'm amlTagArray ", amlTagArray);
	amlTagArray.forEach((string, index) => {
		// console.log("I'm tempArray in fixHTML", tempArray);

		// ***** Account for case when appending to the end of the array.
		if (index < amlTagArray.length - 3) {
			if (tempArray.length > 1 && string.includes(`</`)) {
				amlTagArray[index] = amlTagArray[index].trim();
				amlTagArray.splice(index, 0, `</${tempArray[1]}>`);
				amlTagArray.splice(index + 2, 0, `<${tempArray[1]}>`);
				tempArray.pop();
			} else if (string.includes('<') && !string.includes('</')) {
				const tag = string.substr(string.indexOf('<') + 1, string.indexOf('>') - 1);
				tempArray.push(tag);
				// console.log("I'm a tag in fixHTML", `"${tag}"`);
			}
		}
	});
	// console.log("I'm fix HTML", amlTagArray);
	return amlTagArray;
};

// isolateTagsFromWords goes through the array of AML first generated from splitting the AML string and isolates all tags from text.
// const isolateTagsFromWords = (translatedAMLArray) => {
// 	console.log("isolate")
// 	let tagArray = [];
// 	translatedAMLArray.forEach((string) => {
// 		let count = 0;
// 		console.log("isolate 2")
// 		count = (string.match(/</g) || []).length;
// 		if (count > 0) {
// 			console.log("isolate 3")
// 			for (let i = 0; i < count; i++) {
// 				console.log("isolate 4")
// 				console.log("string")
// 				if (string.startsWith('<')) {
// 					console.log("isolate 5")
// 					console.log(string)
// 					let temp = string.slice(0, string.indexOf('>') + 1);
// 					const re = new RegExp(temp, 'g');
// 					tagArray.push(temp);
// 					string = string.replace(re, '');
// 					count++;
// 				} else if (string.length > 0) {
// 					console.log("isolate 6")
// 					console.log(string)
// 					let startWord = string.slice(
// 						0,
// 						string.indexOf('<') != -1 ? string.indexOf('<') : string.length + 1
// 					);
// 					let reStart = new RegExp(startWord, 'g');
// 					if (startWord != '') {
// 						console.log("isolate 7")
// 						console.log(startWord)
// 						tagArray.push(startWord);
// 						string = string.replace(reStart, '');
// 						count++;
// 					}
// 				}
// 			}
// 		} else {
// 			console.log("isolate 8")
// 			tagArray.push(string);
// 		}
// 	});
// 	return tagArray;
// };

// translateTagsAndCreateAMLMap Translates tags from AML to HTML and creates an object containing any unknown/undiscovered AML tags.
// const translateTagsAndCreateAMLMap = (amlArray, amlTags, translatedAMLArray) => {
// 	console.log('translate');
// 	amlArray.forEach((string, index) => {
// 		if (!string.includes('^')) {
// 			translatedAMLArray.push(string);
// 			return;
// 		}

// 		const openingTagIdx = string.indexOf('^') + 1;
// 		const openingTag = string.charAt(openingTagIdx);
// 		if (!amlTags[openingTag] && openingTag != '!') {
// 			amlTags[openingTag] = {};
// 			amlTags[openingTag].open = `<unknownAMLTag${index}>`;
// 			amlTags[openingTag].close = `</unknownAMLTag${index}>`;
// 		}
// 		// *** OPENING AND CLOSING TAGS PRESENT ***
// 		// Test for case when string has opening AND closing tags.
// 		if (string.includes('^') && string.includes('^!') && openingTag != '!') {
// 			let translatedString = string.replace(`^${openingTag}`, amlTags[openingTag].open);
// 			const closingTag = string.charAt(string.indexOf('^!') + 2);
// 			translatedString = translatedString.replace(`^!${closingTag}`, amlTags[closingTag].close);
// 			translatedAMLArray.push(translatedString);
// 			return;
// 		}
// 		// *** OPENING TAGS ONLY ***
// 		// Check that there is an AML Tag && check that it is NOT a closing tag, ie: not "!".
// 		if (string.includes('^') && openingTag != '!') {
// 			const translatedString = string.replace(`^${openingTag}`, amlTags[openingTag].open);
// 			translatedAMLArray.push(translatedString);
// 		}
// 		// *** CLOSING TAGS ONLY ***
// 		// Check that there is an AML Tag and it is a closing tag.
// 		if (string.includes('^!')) {
// 			const closingTagIdx = string.indexOf('^!') + 2;
// 			const closingTag = string.charAt(closingTagIdx);
// 			const translatedString = string.replace(`^!${closingTag}`, amlTags[closingTag].close);
// 			translatedAMLArray.push(translatedString);
// 		}
// 	});
// };
