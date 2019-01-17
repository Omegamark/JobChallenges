var translateModule = process.argv[2],
	AMLTranslator = require('./amlTranslator');

var testStrings = [
	 ["Hello, World!",
	  "Hello, World!"],
	 ["Hello, ^%World!^!%",
	  "Hello, <STRONG>World!</STRONG>"],
	 ["Greetings ^%from ^~Glornix^!% Beta-Nine^!~.",
	  "Greetings <STRONG>from <EM>Glornix</EM></STRONG><EM> Beta-Nine</EM>."],
	// Other test strings here
	 ["Testing, ^#unknown tag^!#",
	"Testing, <unknownAMLTag1>unknown tag</unknownAMLTag1>"],
	// Closing tags properly. *** Currently an infinite loop.
	["Hello, ^%^~World^!~^!%.", "Hello, <STRONG><EM>World</EM></STRONG>."],
	// Opening and closing tags on a long string of AML.
	[
		'Testing ^* multiple ^@tags both opening ^!* and closing with additional  ^*spaces.^!*',

		'Testing <u> multiple <unknownAMLTag1>tags both opening </unknownAMLTag1></u><unknownAMLTag1> and closing with additional  <u>spaces.</u>'
	]
];

testStrings.forEach(function(testString, idx) {
	translated = AMLTranslator.translate(testString[0]);
	if (translated.toLowerCase() === testString[1].toLowerCase()) {
		console.log('Example ' + (idx + 1) + ' is correct.');
	} else {
		console.log('Example ' + (idx + 1) + ' is incorrect!');
		console.log('  Input:    ' + testString[0]);
		console.log('  Expected: ' + testString[1]);
		console.log('  Received: ' + translated);
	}
});
