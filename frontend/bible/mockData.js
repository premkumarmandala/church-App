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
  { slug: "genesis", name: "Genesis", teluguName: "ఆదికాండము", testament: "OT", chaptersCount: 50 },
  { slug: "exodus", name: "Exodus", teluguName: "నిర్గమకాండము", testament: "OT", chaptersCount: 40 },
  { slug: "leviticus", name: "Leviticus", teluguName: "లేవీయకాండము", testament: "OT", chaptersCount: 27 },
  { slug: "numbers", name: "Numbers", teluguName: "సంఖ్యాకాండము", testament: "OT", chaptersCount: 36 },
  { slug: "deuteronomy", name: "Deuteronomy", teluguName: "ద్వితీయోపదేశకాండము", testament: "OT", chaptersCount: 34 },
  { slug: "joshua", name: "Joshua", teluguName: "యెహోషువ", testament: "OT", chaptersCount: 24 },
  { slug: "judges", name: "Judges", teluguName: "న్యాయాధిపతులు", testament: "OT", chaptersCount: 21 },
  { slug: "ruth", name: "Ruth", teluguName: "రూతు", testament: "OT", chaptersCount: 4 },
  { slug: "psalms", name: "Psalms", teluguName: "కీర్తనలు", testament: "OT", chaptersCount: 150 },
  { slug: "proverbs", name: "Proverbs", teluguName: "సామెతలు", testament: "OT", chaptersCount: 31 },
  { slug: "isaiah", name: "Isaiah", teluguName: "యెషయా", testament: "OT", chaptersCount: 66 },
  { slug: "matthew", name: "Matthew", teluguName: "మత్తయి", testament: "NT", chaptersCount: 28 },
  { slug: "mark", name: "Mark", teluguName: "మార్కు", testament: "NT", chaptersCount: 16 },
  { slug: "luke", name: "Luke", teluguName: "లూకా", testament: "NT", chaptersCount: 24 },
  { slug: "john", name: "John", teluguName: "యోహాను", testament: "NT", chaptersCount: 21 },
  { slug: "acts", name: "Acts", teluguName: "అపొస్తలుల కార్యములు", testament: "NT", chaptersCount: 28 },
  { slug: "romans", name: "Romans", teluguName: "రోమీయులకు", testament: "NT", chaptersCount: 16 },
  { slug: "revelation", name: "Revelation", teluguName: "ప్రకటన గ్రంథము", testament: "NT", chaptersCount: 22 }
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
    reference: "Genesis 1:1",
    teluguReference: "ఆదికాండము 1:1",
    translation: "KJV",
    text: "In the beginning God created the heaven and the earth."
  },
  {
    reference: "Genesis 1:3",
    teluguReference: "ఆదికాండము 1:3",
    translation: "KJV",
    text: "And God said, Let there be light: and there was light."
  },
  {
    reference: "John 1:1",
    teluguReference: "యోహాను 1:1",
    translation: "KJV",
    text: "In the beginning was the Word, and the Word was with God, and the Word was God."
  }
];
