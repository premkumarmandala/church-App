/**
 * Mock Data for Bible React UI Demonstration
 * Contains canonical books list, Genesis Chapter 1 bilingual verses, Daily Verse, and Bookmarks.
 */

window.MOCK_DAILY_VERSE = {
  date: "27 OCT",
  kjvText: "In the beginning God created the heaven and the earth.",
  teluguText: "ఆదియందు దేవుడు భూమ్యాకాశములను సృజించెను.",
  referenceEn: "Genesis 1:1",
  referenceTe: "ఆదికాండము 1:1",
  bookSlug: "genesis",
  bookName: "Genesis",
  bookTeluguName: "ఆదికాండము",
  chapter: 1,
  verse: 1
};

window.MOCK_BOOKS = [
  // Old Testament (39 books)
  { id: 1, slug: "genesis", name: "Genesis", teluguName: "ఆదికాండము", testament: "OT", chaptersCount: 50 },
  { id: 2, slug: "exodus", name: "Exodus", teluguName: "నిర్గమకాండము", testament: "OT", chaptersCount: 40 },
  { id: 3, slug: "leviticus", name: "Leviticus", teluguName: "లేవీయకాండము", testament: "OT", chaptersCount: 27 },
  { id: 4, slug: "numbers", name: "Numbers", teluguName: "సంఖ్యాకాండము", testament: "OT", chaptersCount: 36 },
  { id: 5, slug: "deuteronomy", name: "Deuteronomy", teluguName: "ద్వితీయోపదేశకాండము", testament: "OT", chaptersCount: 34 },
  { id: 6, slug: "joshua", name: "Joshua", teluguName: "యెహోషువ", testament: "OT", chaptersCount: 24 },
  { id: 7, slug: "judges", name: "Judges", teluguName: "న్యాయాధిపతులు", testament: "OT", chaptersCount: 21 },
  { id: 8, slug: "ruth", name: "Ruth", teluguName: "రూతు", testament: "OT", chaptersCount: 4 },
  { id: 9, slug: "1-samuel", name: "1 Samuel", teluguName: "సమూయేలు మొదటి గ్రంథము", testament: "OT", chaptersCount: 31 },
  { id: 10, slug: "2-samuel", name: "2 Samuel", teluguName: "సమూయేలు రెండవ గ్రంథము", testament: "OT", chaptersCount: 24 },
  { id: 11, slug: "1-kings", name: "1 Kings", teluguName: "రాజులు మొదటి గ్రంథము", testament: "OT", chaptersCount: 22 },
  { id: 12, slug: "2-kings", name: "2 Kings", teluguName: "రాజులు రెండవ గ్రంథము", testament: "OT", chaptersCount: 25 },
  { id: 13, slug: "1-chronicles", name: "1 Chronicles", teluguName: "దినవృత్తాంతములు మొదటి గ్రంథము", testament: "OT", chaptersCount: 29 },
  { id: 14, slug: "2-chronicles", name: "2 Chronicles", teluguName: "దినవృత్తాంతములు రెండవ గ్రంథము", testament: "OT", chaptersCount: 36 },
  { id: 15, slug: "ezra", name: "Ezra", teluguName: "ఎజ్రా", testament: "OT", chaptersCount: 10 },
  { id: 16, slug: "nehemiah", name: "Nehemiah", teluguName: "నెహెమ్యా", testament: "OT", chaptersCount: 13 },
  { id: 17, slug: "esther", name: "Esther", teluguName: "ఎస్తేరు", testament: "OT", chaptersCount: 10 },
  { id: 18, slug: "job", name: "Job", teluguName: "యోబు గ్రంథము", testament: "OT", chaptersCount: 42 },
  { id: 19, slug: "psalms", name: "Psalms", teluguName: "కీర్తనల గ్రంథము", testament: "OT", chaptersCount: 150 },
  { id: 20, slug: "proverbs", name: "Proverbs", teluguName: "సామెతలు", testament: "OT", chaptersCount: 31 },
  { id: 21, slug: "ecclesiastes", name: "Ecclesiastes", teluguName: "ప్రసంగి", testament: "OT", chaptersCount: 12 },
  { id: 22, slug: "song-of-solomon", name: "Song of Solomon", teluguName: "పరమగీతము", testament: "OT", chaptersCount: 8 },
  { id: 23, slug: "isaiah", name: "Isaiah", teluguName: "యెషయా గ్రంథము", testament: "OT", chaptersCount: 66 },
  { id: 24, slug: "jeremiah", name: "Jeremiah", teluguName: "యిర్మీయా", testament: "OT", chaptersCount: 52 },
  { id: 25, slug: "lamentations", name: "Lamentations", teluguName: "విలాపవాక్యములు", testament: "OT", chaptersCount: 5 },
  { id: 26, slug: "ezekiel", name: "Ezekiel", teluguName: "యెహెజ్కేలు", testament: "OT", chaptersCount: 48 },
  { id: 27, slug: "daniel", name: "Daniel", teluguName: "దానియేలు", testament: "OT", chaptersCount: 12 },
  { id: 28, slug: "hosea", name: "Hosea", teluguName: "హొషేయ", testament: "OT", chaptersCount: 14 },
  { id: 29, slug: "joel", name: "Joel", teluguName: "యోవేలు", testament: "OT", chaptersCount: 3 },
  { id: 30, slug: "amos", name: "Amos", teluguName: "ఆమోసు", testament: "OT", chaptersCount: 9 },
  { id: 31, slug: "obadiah", name: "Obadiah", teluguName: "ఓబద్యా", testament: "OT", chaptersCount: 1 },
  { id: 32, slug: "jonah", name: "Jonah", teluguName: "యోనా", testament: "OT", chaptersCount: 4 },
  { id: 33, slug: "micah", name: "Micah", teluguName: "మీకా", testament: "OT", chaptersCount: 7 },
  { id: 34, slug: "nahum", name: "Nahum", teluguName: "నహూము", testament: "OT", chaptersCount: 3 },
  { id: 35, slug: "habakkuk", name: "Habakkuk", teluguName: "హబక్కూకు", testament: "OT", chaptersCount: 3 },
  { id: 36, slug: "zephaniah", name: "Zephaniah", teluguName: "జెఫన్యా", testament: "OT", chaptersCount: 3 },
  { id: 37, slug: "haggai", name: "Haggai", teluguName: "హగ్గయి", testament: "OT", chaptersCount: 2 },
  { id: 38, slug: "zechariah", name: "Zechariah", teluguName: "జెకర్యా", testament: "OT", chaptersCount: 14 },
  { id: 39, slug: "malachi", name: "Malachi", teluguName: "మలాకీ", testament: "OT", chaptersCount: 4 },

  // New Testament (27 books)
  { id: 40, slug: "matthew", name: "Matthew", teluguName: "మత్తయి సువార్త", testament: "NT", chaptersCount: 28 },
  { id: 41, slug: "mark", name: "Mark", teluguName: "మార్కు సువార్త", testament: "NT", chaptersCount: 16 },
  { id: 42, slug: "luke", name: "Luke", teluguName: "లూకా సువార్త", testament: "NT", chaptersCount: 24 },
  { id: 43, slug: "john", name: "John", teluguName: "యోహాను సువార్త", testament: "NT", chaptersCount: 21 },
  { id: 44, slug: "acts", name: "Acts", teluguName: "అపొస్తలుల కార్యములు", testament: "NT", chaptersCount: 28 },
  { id: 45, slug: "romans", name: "Romans", teluguName: "రోమీయులకు", testament: "NT", chaptersCount: 16 },
  { id: 46, slug: "1-corinthians", name: "1 Corinthians", teluguName: "1 కొరింథీయులకు", testament: "NT", chaptersCount: 16 },
  { id: 47, slug: "2-corinthians", name: "2 Corinthians", teluguName: "2 కొరింథీయులకు", testament: "NT", chaptersCount: 13 },
  { id: 48, slug: "galatians", name: "Galatians", teluguName: "గలతీయులకు", testament: "NT", chaptersCount: 6 },
  { id: 49, slug: "ephesians", name: "Ephesians", teluguName: "ఎఫెసీయులకు", testament: "NT", chaptersCount: 6 },
  { id: 50, slug: "philippians", name: "Philippians", teluguName: "ఫిలిప్పీయులకు", testament: "NT", chaptersCount: 4 },
  { id: 51, slug: "colossians", name: "Colossians", teluguName: "కొలొస్సయులకు", testament: "NT", chaptersCount: 4 },
  { id: 52, slug: "1-thessalonians", name: "1 Thessalonians", teluguName: "1 థెస్సలొనీకయులకు", testament: "NT", chaptersCount: 5 },
  { id: 53, slug: "2-thessalonians", name: "2 Thessalonians", teluguName: "2 థెస్సలొనీకయులకు", testament: "NT", chaptersCount: 3 },
  { id: 54, slug: "1-timothy", name: "1 Timothy", teluguName: "1 తిమోతికి", testament: "NT", chaptersCount: 6 },
  { id: 55, slug: "2-timothy", name: "2 Timothy", teluguName: "2 తిమోతికి", testament: "NT", chaptersCount: 4 },
  { id: 56, slug: "titus", name: "Titus", teluguName: "తీతుకు", testament: "NT", chaptersCount: 3 },
  { id: 57, slug: "philemon", name: "Philemon", teluguName: "ఫిలేమోనుకు", testament: "NT", chaptersCount: 1 },
  { id: 58, slug: "hebrews", name: "Hebrews", teluguName: "హెబ్రీయులకు", testament: "NT", chaptersCount: 13 },
  { id: 59, slug: "james", name: "James", teluguName: "యాకోబు", testament: "NT", chaptersCount: 5 },
  { id: 60, slug: "1-peter", name: "1 Peter", teluguName: "1 పేతురు", testament: "NT", chaptersCount: 5 },
  { id: 61, slug: "2-peter", name: "2 Peter", teluguName: "2 పేతురు", testament: "NT", chaptersCount: 3 },
  { id: 62, slug: "1-john", name: "1 John", teluguName: "1 యోహాను", testament: "NT", chaptersCount: 5 },
  { id: 63, slug: "2-john", name: "2 John", teluguName: "2 యోహాను", testament: "NT", chaptersCount: 1 },
  { id: 64, slug: "3-john", name: "3 John", teluguName: "3 యోహాను", testament: "NT", chaptersCount: 1 },
  { id: 65, slug: "jude", name: "Jude", teluguName: "యూదా", testament: "NT", chaptersCount: 1 },
  { id: 66, slug: "revelation", name: "Revelation", teluguName: "ప్రకటన గ్రంథము", testament: "NT", chaptersCount: 22 }
];

window.MOCK_GENESIS_CHAPTER_1 = {
  book: {
    slug: "genesis",
    name: "Genesis",
    teluguName: "ఆదికాండము",
    testament: "OT"
  },
  chapter: 1,
  totalVerses: 31,
  verses: [
    {
      verse: 1,
      kjv: "In the beginning God created the heaven and the earth.",
      telugu: "ఆదియందు దేవుడు భూమ్యాకాశములను సృజించెను."
    },
    {
      verse: 2,
      kjv: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.",
      telugu: "భూమి నిరాకారముగాను శూన్యముగాను ఉండెను; చీకటి అగాధ జలము పైన కమ్మియుండెను; దేవుని ఆత్మ జలములపైన అల్లాడుచుండెను."
    },
    {
      verse: 3,
      kjv: "And God said, Let there be light: and there was light.",
      telugu: "దేవుడు వెలుగు కమ్మని పలుకగా వెలుగు కలిగెను."
    },
    {
      verse: 4,
      kjv: "And God saw the light, that it was good: and God divided the light from the darkness.",
      telugu: "వెలుగు మంచిదైనట్టు దేవుడుచూచెను; దేవుడు వెలుగును చీకటిని వేరుపరచెను."
    },
    {
      verse: 5,
      kjv: "And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.",
      telugu: "దేవుడు వెలుగునకు పగలనియు, చీకటికి రాత్రి అనియు పేరు పెట్టెను. అస్తమయమును ఉదయమును కలుగగా ఒక దినమాయెను."
    },
    {
      verse: 6,
      kjv: "And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters.",
      telugu: "మరియు దేవుడుజలముల మధ్య నొక విశాలము కలిగి ఆ జలములను ఈ జలములను వేరుపరచును గాకని పలికెను."
    },
    {
      verse: 7,
      kjv: "And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so.",
      telugu: "దేవుడు ఆ విశాలము చేసి విశాలము క్రింది జలములను విశాలము మీది జలములను వేరుపరపగా ఆ ప్రకారమాయెను."
    },
    {
      verse: 8,
      kjv: "And God called the firmament Heaven. And the evening and the morning were the second day.",
      telugu: "దేవుడు ఆ విశాలమునకు ఆకాశమని పేరు పెట్టెను. అస్తమయమును ఉదయమును కలుగగా రెండవ దినమాయెను."
    },
    {
      verse: 9,
      kjv: "And God said, Let the waters under the heaven be gathered together unto one place, and let the dry land appear: and it was so.",
      telugu: "దేవుడుఆకాశము క్రిందనున్న జలము లొకచోటనే కూర్చబడి ఆరిన నేల కనబడును గాకని పలుకగా ఆ ప్రకారమాయెను."
    },
    {
      verse: 10,
      kjv: "And God called the dry land Earth; and the gathering together of the waters called he Seas: and God saw that it was good.",
      telugu: "దేవుడు ఆరిన నేలకు భూమి అని పేరు పెట్టెను, జలరాశికి ఆయన సముద్రములని పేరు పెట్టెను, అది మంచిదని దేవుడు చూచెను."
    },
    {
      verse: 11,
      kjv: "And God said, Let the earth bring forth grass, the herb yielding seed, and the fruit tree yielding fruit after his kind, whose seed is in itself, upon the earth: and it was so.",
      telugu: "దేవుడుగడ్డిని విత్తనములిచ్చు చెట్లను భూమిమీద తమ తమ జాతి ప్రకారము తమలో విత్తనములుగల ఫలమిచ్చు ఫలవృక్షములను భూమి మొలిపించుగాకని పలుకగా ఆ ప్రకార మాయెను."
    },
    {
      verse: 12,
      kjv: "And the earth brought forth grass, and herb yielding seed after his kind, and the tree yielding fruit, whose seed was in itself, after his kind: and God saw that it was good.",
      telugu: "భూమి గడ్డిని తమ తమ జాతి ప్రకారము విత్తనములిచ్చు చెట్లను, తమ తమ జాతి ప్రకారము తమలో విత్తనములుగల ఫలవృక్షములను మొలిపింపగా అది మంచిదని దేవుడు చూచెను."
    },
    {
      verse: 13,
      kjv: "And the evening and the morning were the third day.",
      telugu: "అస్తమయమును ఉదయమును కలుగగా మూడవ దినమాయెను."
    },
    {
      verse: 14,
      kjv: "And God said, Let there be lights in the firmament of the heaven to divide the day from the night; and let them be for signs, and for seasons, and for days, and years:",
      telugu: "దేవుడుపగటిని రాత్రిని వేరుపరచునట్లు ఆకాశ విశాలమందు జ్యోతులు కలుగును గాకనియు, అవి సూచనలను కాలములను దిన సంవత్సరములను తెలియజేయుటకై యుండుగాకనియు,"
    },
    {
      verse: 15,
      kjv: "And let them be for lights in the firmament of the heaven to give light upon the earth: and it was so.",
      telugu: "భూమిమీద వెలుగిచ్చుటకు అవి ఆకాశవిశాలమందు జ్యోతులై యుండుగాకనియు పలికెను; ఆ ప్రకారమాయెను."
    },
    {
      verse: 16,
      kjv: "And God made two great lights; the greater light to rule the day, and the lesser light to rule the night: he made the stars also.",
      telugu: "దేవుడు ఆ రెండు గొప్ప జ్యోతులను, అనగా పగటిని ఏలుటకు పెద్ద జ్యోతిని రాత్రిని ఏలుటకు చిన్న జ్యోతిని నక్షత్రములను చేసెను."
    },
    {
      verse: 17,
      kjv: "And God set them in the firmament of the heaven to give light upon the earth,",
      telugu: "భూమిమీద వెలుగిచ్చుటకును పగటిని రాత్రిని ఏలుటకును"
    },
    {
      verse: 18,
      kjv: "And to rule over the day and over the night, and to divide the light from the darkness: and God saw that it was good.",
      telugu: "వెలుగును చీకటిని వేరుపరచుటకును దేవుడు ఆకాశ విశాలమందు వాటినుంచెను; అది మంచిదని దేవుడు చూచెను."
    },
    {
      verse: 19,
      kjv: "And the evening and the morning were the fourth day.",
      telugu: "అస్తమయమును ఉదయమును కలుగగా నాలుగవ దినమాయెను."
    },
    {
      verse: 20,
      kjv: "And God said, Let the waters bring forth abundantly the moving creature that hath life, and fowl that may fly above the earth in the open firmament of heaven.",
      telugu: "దేవుడుజీవము కలిగి చలించువాటిని జలములు విస్తారముగా పుట్టించును గాకనియు, పక్షులు భూమిపైని ఆకాశ విశాలములో ఎగురును గాకనియు పలికెను."
    },
    {
      verse: 21,
      kjv: "And God created great whales, and every living creature that moveth, which the waters brought forth abundantly, after their kind, and every winged fowl after his kind: and God saw that it was good.",
      telugu: "దేవుడు జలములలో వాటి వాటి జాతి ప్రకారము విస్తారముగా ఈదుచున్న సమస్త జీవులను, పెద్ద తిమింగలములను, ప్రతి విధమైన రెక్కలుగల పక్షులను సృజించెను. అది మంచిదని దేవుడు చూచెను."
    },
    {
      verse: 22,
      kjv: "And God blessed them, saying, Be fruitful, and multiply, and fill the waters in the seas, and let fowl multiply in the earth.",
      telugu: "దేవుడు వాటిని ఆశీర్వదించిఫలించి విస్తరించి సముద్ర జలములలో నిండుడనియు, పక్షులు భూమిమీద విస్తరించును గాకనియు పలికెను."
    },
    {
      verse: 23,
      kjv: "And the evening and the morning were the fifth day.",
      telugu: "అస్తమయమును ఉదయమును కలుగగా అయిదవ దినమాయెను."
    },
    {
      verse: 24,
      kjv: "And God said, Let the earth bring forth the living creature after his kind, cattle, and creeping thing, and beast of the earth after his kind: and it was so.",
      telugu: "దేవుడుభూమి వాటి వాటి జాతి ప్రకారము జీవముగల వాటిని, అనగా వాటి వాటి జాతి ప్రకారము జంతువులను పురుగులను అడవి జంతువులను పుట్టించును గాకని పలికెను; ఆ ప్రకారమాయెను."
    },
    {
      verse: 25,
      kjv: "And God made the beast of the earth after his kind, and cattle after their kind, and every thing that creepeth upon the earth after his kind: and God saw that it was good.",
      telugu: "దేవుడు ఆయా జాతుల ప్రకారము అడవి జంతువులను, ఆయా జాతుల ప్రకారము పశువులను, ఆయా జాతుల ప్రకారము నేలను ప్రాకు ప్రతి పురుగును చేసెను; అది మంచిదని దేవుడు చూచెను."
    },
    {
      verse: 26,
      kjv: "And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth, and over every creeping thing that creepeth upon the earth.",
      telugu: "దేవుడుమన స్వరూపమందు మన పోలికెచొప్పున నరులను చేయుదము; వారు సముద్రపు చేపలను ఆకాశ పక్షులను పశువులను సమస్త భూమిని భూమిమీద ప్రాకు ప్రతి జంతువును ఏలుదురు గాకని పలికెను."
    },
    {
      verse: 27,
      kjv: "So God created man in his own image, in the image of God created he him; male and female created he them.",
      telugu: "దేవుడు తన స్వరూపమందు నరుని సృజించెను; దేవుని స్వరూపమందు వాని సృజించెను; స్త్రీనిగాను పురుషునిగాను వారిని సృజించెను."
    },
    {
      verse: 28,
      kjv: "And God blessed them, and God said unto them, Be fruitful, and multiply, and replenish the earth, and subdue it: and have dominion over the fish of the sea, and over the fowl of the air, and over every living thing that moveth upon the earth.",
      telugu: "దేవుడు వారిని ఆశీర్వదించెను. ఎట్లనగా మీరు ఫలించి అభివృద్ధిపొంది విస్తరించి భూమిని నిండించి దానిని లోపరచుకొనుడి."
    },
    {
      verse: 29,
      kjv: "And God said, Behold, I have given you every herb bearing seed, which is upon the face of all the earth, and every tree, in the which is the fruit of a tree yielding seed; to you it shall be for meat.",
      telugu: "దేవుడుఇదిగో భూమిమీదనున్న విత్తనములిచ్చు ప్రతి చెట్టును, విత్తనములిచ్చు వృక్షఫలముగల ప్రతి చెట్టును మీకాహారమగునట్లు మీకు ఇచ్చియున్నాను."
    },
    {
      verse: 30,
      kjv: "And to every beast of the earth, and to every fowl of the air, and to every thing that creepeth upon the earth, wherein there is life, I have given every green herb for meat: and it was so.",
      telugu: "భూమిమీదనున్న సమస్త జీవులకును ఆహారముగా సమస్త హరిత సస్యములను ఇచ్చియున్నానని పలికెను; ఆ ప్రకారమాయెను."
    },
    {
      verse: 31,
      kjv: "And God saw every thing that he had made, and, behold, it was very good. And the evening and the morning were the sixth day.",
      telugu: "దేవుడు తాను చేసినది అంతయు చూచినప్పుడు అది మిక్కిలి మంచిదిగా ఉండెను. అస్తమయమును ఉదయమును కలుగగా ఆరవ దినమాయెను."
    }
  ]
};

window.MOCK_BOOKMARKS = [
  {
    id: "genesis-1-1",
    bookSlug: "genesis",
    bookName: "Genesis",
    bookTeluguName: "ఆదికాండము",
    chapter: 1,
    verse: 1,
    translation: "KJV",
    text: "In the beginning God created the heaven and the earth.",
    savedAt: "Just now"
  }
];

window.MOCK_SEARCH_RESULTS = [
  {
    bookSlug: "genesis",
    chapter: 1,
    verse: 1,
    reference: "Genesis 1:1",
    referenceEn: "Genesis 1:1",
    teluguReference: "ఆదికాండము 1:1",
    referenceTe: "ఆదికాండము 1:1",
    translation: "KJV",
    text: "In the beginning God created the heaven and the earth."
  },
  {
    bookSlug: "genesis",
    chapter: 1,
    verse: 3,
    reference: "Genesis 1:3",
    referenceEn: "Genesis 1:3",
    teluguReference: "ఆదికాండము 1:3",
    referenceTe: "ఆదికాండము 1:3",
    translation: "KJV",
    text: "And God said, Let there be light: and there was light."
  },
  {
    bookSlug: "john",
    chapter: 1,
    verse: 1,
    reference: "John 1:1",
    referenceEn: "John 1:1",
    teluguReference: "యోహాను 1:1",
    referenceTe: "యోహాను 1:1",
    translation: "KJV",
    text: "In the beginning was the Word, and the Word was with God, and the Word was God."
  }
];
