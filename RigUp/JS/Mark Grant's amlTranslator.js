var AMLTranslator = {
	translate: (aml) => {
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

		if (!aml.includes('^')) {
			return aml;
		}

		let amlArray = aml.split(' ');

		amlArray = fixSpacing(amlArray);

		let amlTagArray = isolateTagsFromWords(amlArray);

		generateAMLTagMap(amlTagArray, amlTags);

		translateAMLTags(amlTagArray, amlTags);

		fixHTML(amlTagArray);
		
		HTMLTranslatedAMLString = amlTagArray.join('');

		console.log('AML Tag Legened: \n', amlTags);

		return HTMLTranslatedAMLString;
	}
};

if (module.exports) {
	module.exports = AMLTranslator;
}

// *** FUNCTIONS ***
// isolateTagsFromWords, separates all AML tag strings from other strings.
const isolateTagsFromWords = function(amlArray) {
	let tagArray = [];
	amlArray.forEach((string) => {
		if (!string.includes('^')) tagArray.push(string);
		let count = (string.match(/\^/g) || []).length;
		while (count > 0) {
			if (!string.startsWith('^')) {
				const temp = string.slice(0, string.indexOf('^'));
				tagArray.push(temp);
				const re = new RegExp(temp, 'g');
				string = string.replace(re, '');
			}
			if (string.charAt(1) != '!') {
				const tag = string.slice(0, 2);
				const amlTagIdentifier = string.slice(1, 2);
				tagArray.push(tag);
				const re = new RegExp(`\\^\\${amlTagIdentifier}`, 'g');
				string = string.replace(re, '');
				count--;
				if (count === 0 && string.length != 0) tagArray.push(string);
			} else {
				const tag = string.slice(0, 3);
				const amlTagIdentifier = string.slice(2, 3);
				tagArray.push(tag);
				const re = new RegExp(`\\^!\\${amlTagIdentifier}`, 'g');
				string = string.replace(re, '');
				count--;
				if (count === 0 && string.length != 0) tagArray.push(string);
			}
		}
	});
	return tagArray;
};

const generateAMLTagMap = (amlTagArray, amlTags) => {
	amlTagArray.forEach((string) => {
		let unknownTagCount = 0;
		if (!string.includes('^')) return;
		string.trim();
		if (string.length == 2) {
			let safeTag = string;
			safeTag = string[1];
			// Check for specific <u> case.
			if (safeTag === '*') {
				amlTags[safeTag] = {};
				amlTags[safeTag].open = '<u>';
				amlTags[safeTag].close = '</u>';
			}
			// Check for all potential cases.
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

// translateAMLTags converts all AML tags into valid HTML ones.
const translateAMLTags = (amlTagArray, amlTags) => {
	amlTagArray.forEach((string, index) => {
		if (!string.includes('^')) return;
		const tag = string[string.length - 1];
		if (string.includes('^!')) return (amlTagArray[index] = amlTags[tag].close);
		amlTagArray[index] = amlTags[tag].open;
	});
};

// fixHTML Places closing tags & rearranges HTML tags to match HTML formatting.
const fixHTML = (amlTagArray) => {
	let tempArray = [];
	amlTagArray.forEach((string, index) => {
		// This part needs to cover end of array cases better
		if (index < amlTagArray.length - 3) {
			if (tempArray.length > 1 && string.includes(`</`)) {
				amlTagArray[index] = amlTagArray[index].trim();
				amlTagArray.splice(index, 0, `</${tempArray[1]}>`);
				amlTagArray.splice(index + 2, 0, `<${tempArray[1]}>`);
				tempArray.pop();
			} else if (string.includes('<') && !string.includes('</')) {
				const tag = string.substr(string.indexOf('<') + 1, string.indexOf('>') - 1);
				tempArray.push(tag);
			}
		}
	});
	return amlTagArray;
};
