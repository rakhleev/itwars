// JavaScript Document
var stopWords = [
	'a',
	'about',
	'above',
	'according',
	'across',
	'actually',
	'after',
	'afterwards',
	'again',
	'against',
	'almost',
	'alone',
	'along',
	'already',
	'also',
	'alt',
	'although',
	'always',
	'am',
	'among',
	'amongst',
	'an',
	'and',
	'another',
	'any',
	'anyhow',
	'anyone',
	'anything',
	'anywhere',
	'are',
	'aren',
	'aren\'t',
	'around',
	'be',
	'became',
	'because',
	'become',
	'becomes',
	'becoming',
	'been',
	'before',
	'beforehand',
	'behind',
	'being',
	'below',
	'beside',
	'besides',
	'between',
	'beyond',
	'both',
	'but',
	'buy',
	'can',
	'can\'t',
	'cannot',
	'com',
	'could',
	'couldn',
	'couldn\'t',
	'did',
	'didn',
	'didn\'t',
	'do',
	'does',
	'doesn',
	'doesn\'t',
	'don\'t',
	'during',
	'each',
	'either',
	'else',
	'elsewhere',
	'enough',
	'etc',
	'even',
	'ever',
	'every',
	'everyone',
	'everything',
	'everywhere',
	'except',
	'few',
	'for',
	'from',
	'get',
	'had',
	'has',
	'hasn',
	'hasn\'t',
	'have',
	'haven',
	'haven\'t',
	'he\'d',
	'he\'ll',
	'he\'s',
	'hence',
	'here',
	'here\'s',
	'hereafter',
	'hereby',
	'herein',
	'hereupon',
	'how',
	'however',
	'i\'d',
	'i\'ll',
	'i\'m',
	'i\'ve',
	'i.e.',
	'ie',
	'if',
	'in',
	'indeed',
	'instead',
	'into',
	'is',
	'isn',
	'isn\'t',
	'it',
	'it\'s',
	'its',
	'itself',
	'later',
	'latter',
	'least',
	'less',
	'let',
	'let\'s',
	'like',
	'likely',
	'ltd',
	'maybe',
	'meantime',
	'meanwhile',
	'mine',
	'miss',
	'more',
	'moreover',
	'most',
	'mostly',
	'mrs',
	'ms',
	'msfphover',
	'msie',
	'much',
	'must',
	'my',
	'myself',
	'namely',
	'neither',
	'net',
	'never',
	'nevertheless',
	'nobody',
	'none',
	'nonetheless',
	'noone',
	'nor',
	'not',
	'now',
	'nowhere',
	'nbsp',
	'null',
	'of',
	'off',
	'often',
	'on',
	'once',
	'one',
	'one\'s',
	'only',
	'onto',
	'or',
	'org',
	'other',
	'others',
	'otherwise',
	'our',
	'ours',
	'ourselves',
	'out',
	'over',
	'overall',
	'per',
	'perhaps',
	'rather',
	'same',
	'she',
	'she\'d',
	'she\'ll',
	'she\'s',
	'should',
	'shouldn',
	'shouldn\'t',
	'since',
	'some',
	'somehow',
	'someone',
	'something',
	'sometime',
	'sometimes',
	'somewhere',
	'src',
	'still',
	'such',
	'than',
	'that',
	'that\'ll',
	'that\'s',
	'their',
	'them',
	'the',
	'to',
	'themselves',
	'then',
	'thence',
	'there',
	'there\'ll',
	'there\'s',
	'thereafter',
	'thereby',
	'therefore',
	'therein',
	'thereupon',
	'these',
	'they',
	'they\'d',
	'they\'ll',
	'they\'re',
	'they\'ve',
	'this',
	'those',
	'though',
	'three',
	'through',
	'throughout',
	'thru',
	'thus',
	'together',
	'too',
	'toward',
	'towards',
	'under',
	'unless',
	'unlike',
	'unlikely',
	'until',
	'up',
	'upon',
	'was',
	'wasn',
	'wasn\'t',
	'we',
	'we\'d',
	'we\'ll',
	'we\'re',
	'we\'ve',
	'well',
	'were',
	'weren',
	'weren\'t',
	'what\'ll',
	'what\'s',
	'whatever',
	'when',
	'whence',
	'whenever',
	'where',
	'whereafter',
	'whereas',
	'whereby',
	'wherein',
	'whereupon',
	'wherever',
	'whether',
	'which',
	'while',
	'whither',
	'who',
	'who\'d',
	'who\'ll',
	'who\'s',
	'whoever',
	'whole',
	'whom',
	'whomever',
	'whose',
	'why',
	'will',
	'with',
	'within',
	'without',
	'won',
	'won\'t',
	'would',
	'wouldn',
	'wouldn\'t',
	'ye',
	'yes',
	'yet',
	'you',
	'you\'d',
	'you\'ll',
	'you\'re',
	'you\'ve',
	'your',
	'yours',
	'yourself',
	'yourselves',
	'and',
	'in',
	'to',
	'for',
	'in',
	'on',
	'is',
	'by',
	'all',
	'or',
	'from',
	'are',
	'as',
	'our',
	'this',
	'it',
	'can',
	'has',
	'be',
	'that',
	'at',
	'which',
	'also',
	'its',
	'but',
	'than',
	'i',
	're',
	'no',
	'so',
	'made',
	'what'
];