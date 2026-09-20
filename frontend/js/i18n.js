/* Interface strings + per-language metadata.
   NOTE FOR THE PILOT: the Telugu and Hindi copy below must be read by a
   native speaker and an agriculture officer before this app is put in
   front of a farmer. Machine-shaped agricultural wording is exactly the
   kind of thing that reads fine and advises badly. */

export const LANGS = {
  en: { label: 'EN', name: 'English',  model: 'English', bcp: 'en-IN', voice: ['en-IN', 'en-GB', 'en-US'] },
  te: { label: 'తె', name: 'తెలుగు',   model: 'Telugu',  bcp: 'te-IN', voice: ['te-IN', 'te'] },
  hi: { label: 'हि', name: 'हिन्दी',    model: 'Hindi',   bcp: 'hi-IN', voice: ['hi-IN', 'hi'] }
};

export const CROPS = [
  { id: 'rice',      en: 'Rice',      te: 'వరి',        hi: 'धान' },
  { id: 'cotton',    en: 'Cotton',    te: 'పత్తి',      hi: 'कपास' },
  { id: 'chilli',    en: 'Chilli',    te: 'మిరప',       hi: 'मिर्च' },
  { id: 'tomato',    en: 'Tomato',    te: 'టమాటా',      hi: 'टमाटर' },
  { id: 'groundnut', en: 'Groundnut', te: 'వేరుశనగ',    hi: 'मूंगफली' },
  { id: 'maize',     en: 'Maize',     te: 'మొక్కజొన్న',  hi: 'मक्का' },
  { id: 'banana',    en: 'Banana',    te: 'అరటి',       hi: 'केला' },
  { id: 'sugarcane', en: 'Sugarcane', te: 'చెరకు',      hi: 'गन्ना' }
];

export const T = {
  en: {
    tagline: 'AI crop-health advisor',
    scanTitle: 'Scan a leaf',
    frameHint: 'Fill the frame with one leaf. Good light, no shadow.',
    takePhoto: 'Take photo', gallery: 'Gallery', removePhoto: 'Remove photo',
    cropLabel: 'Which crop? (optional)',
    noteLabel: 'Anything you noticed? (optional)',
    notePh: 'Started 3 days ago, lower leaves first…',
    speak: 'Speak instead of typing',
    listening: 'Listening — speak now.',
    micUnsupported: 'This phone cannot take voice notes. Type instead.',
    noLeaf: 'No leaf nearby?', sample1: 'Try a tomato sample', sample2: 'Try a rice sample',
    diagnose: 'Diagnose', needPhoto: 'Add a photo to start', readyNote: 'Takes about 20 seconds',
    busy1: 'Looking at the leaf…', busy2: 'Matching the symptoms…', busy3: 'Writing your plan…',
    cancel: 'Cancel', cancelled: 'Stopped. Nothing was saved.',
    tabScan: 'Scan', tabHistory: 'My scans', tabAbout: 'About',

    severity: 'Severity', confidence: 'How sure', spread: 'Spread risk',
    low: 'Low', moderate: 'Moderate', high: 'High', medium: 'Medium',
    lowConf: 'Patta is not confident about this one. Show the leaf to an agriculture officer before you spray anything.',
    whatISee: 'What I can see', whyHappens: 'Why this happens',
    planTitle: 'What to do', prevention: 'Stop it coming back', expertIf: 'See an expert if',
    neighbours: 'Tell your neighbours',
    kindField: 'field care', kindOrganic: 'natural', kindChemical: 'chemical',
    listen: 'Listen', stopListen: 'Stop', share: 'Share', again: 'Scan another leaf',
    callKCC: 'Call Kisan Call Centre', helpful: 'Was this helpful?', yes: 'Yes', no: 'No',
    thanks: 'Thank you. This helps us improve.',
    noDose: 'No dose is given on purpose. Follow the label on the pack and your local officer.',

    historyTitle: 'My scans', historyNote: 'Saved on this phone only. Nothing is uploaded.',
    emptyHistory: 'Your scans will appear here. Go to Scan and photograph a leaf.',
    delete: 'Delete', deleted: 'Scan deleted.',
    aboutTitle: 'About Patta',

    errNotPlant: 'That does not look like a plant. Photograph a leaf, filling the frame.',
    errBlurry: 'The photo is blurry. Hold still, tap the leaf to focus, and take it again.',
    errDark: 'Too dark to read. Move into daylight and try again.',
    errNet: 'Could not reach the AI. Check your connection, or try a sample case.',
    errBusy: 'Too many requests right now. Wait a minute and try again.',
    errGeneric: 'Something went wrong. Try again, or try a sample case.',
    offlineSample: 'Offline — showing a saved sample case.',
    copied: 'Copied. Paste it into WhatsApp.',
    noVoice: 'This phone has no voice for this language. Install it in Settings, or read the text.'
  },

  te: {
    tagline: 'AI పంట ఆరోగ్య సలహాదారు',
    scanTitle: 'ఆకును స్కాన్ చేయండి',
    frameHint: 'ఒక ఆకు ఫ్రేమ్ నిండా ఉండాలి. మంచి వెలుతురు, నీడ వద్దు.',
    takePhoto: 'ఫోటో తీయండి', gallery: 'గ్యాలరీ', removePhoto: 'ఫోటో తీసివేయండి',
    cropLabel: 'ఏ పంట? (ఐచ్ఛికం)',
    noteLabel: 'మీరు గమనించినది ఏమైనా? (ఐచ్ఛికం)',
    notePh: 'మూడు రోజుల క్రితం మొదలైంది, కింది ఆకుల నుండి…',
    speak: 'టైప్ చేయకుండా మాట్లాడండి',
    listening: 'వింటున్నాను — ఇప్పుడు మాట్లాడండి.',
    micUnsupported: 'ఈ ఫోన్‌లో వాయిస్ నోట్ పని చేయదు. టైప్ చేయండి.',
    noLeaf: 'దగ్గర ఆకు లేదా?', sample1: 'టమాటా నమూనా చూడండి', sample2: 'వరి నమూనా చూడండి',
    diagnose: 'పరీక్షించండి', needPhoto: 'మొదలుపెట్టడానికి ఫోటో జోడించండి', readyNote: 'సుమారు 20 సెకన్లు పడుతుంది',
    busy1: 'ఆకును చూస్తున్నాను…', busy2: 'లక్షణాలను పోలుస్తున్నాను…', busy3: 'మీ ప్రణాళిక రాస్తున్నాను…',
    cancel: 'రద్దు చేయండి', cancelled: 'ఆపివేయబడింది. ఏదీ సేవ్ కాలేదు.',
    tabScan: 'స్కాన్', tabHistory: 'నా స్కాన్‌లు', tabAbout: 'గురించి',

    severity: 'తీవ్రత', confidence: 'ఎంత ఖచ్చితం', spread: 'వ్యాప్తి ప్రమాదం',
    low: 'తక్కువ', moderate: 'మధ్యస్థం', high: 'ఎక్కువ', medium: 'మధ్యస్థం',
    lowConf: 'దీనిపై పట్టాకు స్పష్టత లేదు. ఏదైనా పిచికారీ చేసే ముందు వ్యవసాయ అధికారికి ఆకును చూపించండి.',
    whatISee: 'నాకు కనిపిస్తున్నది', whyHappens: 'ఇది ఎందుకు వస్తుంది',
    planTitle: 'ఏం చేయాలి', prevention: 'మళ్ళీ రాకుండా', expertIf: 'నిపుణుడిని కలవండి — ఎప్పుడంటే',
    neighbours: 'పక్క రైతులకు చెప్పండి',
    kindField: 'పొలం పని', kindOrganic: 'సహజం', kindChemical: 'రసాయనం',
    listen: 'వినండి', stopListen: 'ఆపండి', share: 'పంచుకోండి', again: 'మరో ఆకు స్కాన్ చేయండి',
    callKCC: 'కిసాన్ కాల్ సెంటర్‌కు ఫోన్', helpful: 'ఇది ఉపయోగపడిందా?', yes: 'అవును', no: 'లేదు',
    thanks: 'ధన్యవాదాలు. ఇది మెరుగుపరచడానికి సాయపడుతుంది.',
    noDose: 'మోతాదు ఉద్దేశపూర్వకంగా ఇవ్వలేదు. ప్యాకెట్‌పై ఉన్న లేబుల్‌ను, మీ అధికారి సలహాను పాటించండి.',

    historyTitle: 'నా స్కాన్‌లు', historyNote: 'ఈ ఫోన్‌లోనే సేవ్ అవుతాయి. ఎక్కడికీ పంపబడవు.',
    emptyHistory: 'మీ స్కాన్‌లు ఇక్కడ కనిపిస్తాయి. స్కాన్‌కు వెళ్లి ఆకు ఫోటో తీయండి.',
    delete: 'తొలగించండి', deleted: 'స్కాన్ తొలగించబడింది.',
    aboutTitle: 'పట్టా గురించి',

    errNotPlant: 'ఇది మొక్కలా అనిపించడం లేదు. ఫ్రేమ్ నిండా ఆకు ఉండేలా ఫోటో తీయండి.',
    errBlurry: 'ఫోటో మసకగా ఉంది. ఫోన్ కదలకుండా పట్టుకుని, ఆకుపై తాకి ఫోకస్ చేసి మళ్ళీ తీయండి.',
    errDark: 'చాలా చీకటిగా ఉంది. వెలుతురులోకి వచ్చి మళ్ళీ ప్రయత్నించండి.',
    errNet: 'AI అందుబాటులో లేదు. కనెక్షన్ చూసుకోండి, లేదా నమూనా కేసు చూడండి.',
    errBusy: 'ఇప్పుడు చాలా అభ్యర్థనలు ఉన్నాయి. ఒక నిమిషం ఆగి ప్రయత్నించండి.',
    errGeneric: 'ఏదో తప్పు జరిగింది. మళ్ళీ ప్రయత్నించండి, లేదా నమూనా కేసు చూడండి.',
    offlineSample: 'ఆఫ్‌లైన్ — సేవ్ చేసిన నమూనా కేసు చూపుతున్నాను.',
    copied: 'కాపీ అయ్యింది. వాట్సాప్‌లో పేస్ట్ చేయండి.',
    noVoice: 'ఈ భాషకు ఫోన్‌లో వాయిస్ లేదు. సెట్టింగ్స్‌లో ఇన్‌స్టాల్ చేయండి, లేదా చదువుకోండి.'
  },

  hi: {
    tagline: 'AI फसल-स्वास्थ्य सलाहकार',
    scanTitle: 'पत्ती स्कैन करें',
    frameHint: 'एक पत्ती फ्रेम में पूरी आए। अच्छी रोशनी, छाया नहीं।',
    takePhoto: 'फोटो लें', gallery: 'गैलरी', removePhoto: 'फोटो हटाएँ',
    cropLabel: 'कौन सी फसल? (वैकल्पिक)',
    noteLabel: 'आपने क्या देखा? (वैकल्पिक)',
    notePh: 'तीन दिन पहले शुरू हुआ, नीचे की पत्तियों से…',
    speak: 'लिखने के बजाय बोलें',
    listening: 'सुन रहा हूँ — अब बोलिए।',
    micUnsupported: 'इस फोन पर वॉइस नोट नहीं चलता। टाइप करें।',
    noLeaf: 'पास में पत्ती नहीं है?', sample1: 'टमाटर का नमूना देखें', sample2: 'धान का नमूना देखें',
    diagnose: 'जाँच करें', needPhoto: 'शुरू करने के लिए फोटो जोड़ें', readyNote: 'लगभग 20 सेकंड लगेंगे',
    busy1: 'पत्ती देख रहा हूँ…', busy2: 'लक्षण मिला रहा हूँ…', busy3: 'आपकी योजना लिख रहा हूँ…',
    cancel: 'रद्द करें', cancelled: 'रोक दिया गया। कुछ सेव नहीं हुआ।',
    tabScan: 'स्कैन', tabHistory: 'मेरे स्कैन', tabAbout: 'जानकारी',

    severity: 'गंभीरता', confidence: 'कितना पक्का', spread: 'फैलने का खतरा',
    low: 'कम', moderate: 'मध्यम', high: 'ज़्यादा', medium: 'मध्यम',
    lowConf: 'पत्ता इस पर पक्का नहीं है। छिड़काव से पहले कृषि अधिकारी को पत्ती दिखाएँ।',
    whatISee: 'मुझे क्या दिख रहा है', whyHappens: 'ऐसा क्यों होता है',
    planTitle: 'क्या करें', prevention: 'दोबारा न हो इसके लिए', expertIf: 'विशेषज्ञ से मिलें — जब',
    neighbours: 'पड़ोसी किसानों को बताएँ',
    kindField: 'खेत का काम', kindOrganic: 'प्राकृतिक', kindChemical: 'रासायनिक',
    listen: 'सुनें', stopListen: 'रोकें', share: 'साझा करें', again: 'दूसरी पत्ती स्कैन करें',
    callKCC: 'किसान कॉल सेंटर पर फोन', helpful: 'क्या यह काम आया?', yes: 'हाँ', no: 'नहीं',
    thanks: 'धन्यवाद। इससे हमें सुधार में मदद मिलती है।',
    noDose: 'मात्रा जानबूझकर नहीं दी गई है। पैक पर लिखा लेबल और अपने अधिकारी की सलाह मानें।',

    historyTitle: 'मेरे स्कैन', historyNote: 'सिर्फ इसी फोन में सेव हैं। कहीं नहीं भेजे जाते।',
    emptyHistory: 'आपके स्कैन यहाँ दिखेंगे। स्कैन पर जाकर पत्ती की फोटो लें।',
    delete: 'हटाएँ', deleted: 'स्कैन हटा दिया गया।',
    aboutTitle: 'पत्ता के बारे में',

    errNotPlant: 'यह पौधा नहीं लगता। फ्रेम भरकर पत्ती की फोटो लें।',
    errBlurry: 'फोटो धुंधली है। फोन स्थिर रखें, पत्ती पर टैप करके फोकस करें, फिर से लें।',
    errDark: 'बहुत अँधेरा है। दिन की रोशनी में आकर फिर लें।',
    errNet: 'AI तक नहीं पहुँच पाए। कनेक्शन देखें, या नमूना केस देखें।',
    errBusy: 'अभी बहुत अनुरोध हैं। एक मिनट रुककर फिर कोशिश करें।',
    errGeneric: 'कुछ गड़बड़ हुई। फिर कोशिश करें, या नमूना केस देखें।',
    offlineSample: 'ऑफलाइन — सेव किया हुआ नमूना केस दिखा रहे हैं।',
    copied: 'कॉपी हो गया। व्हाट्सएप में पेस्ट करें।',
    noVoice: 'इस भाषा के लिए फोन में आवाज़ नहीं है। सेटिंग्स में इंस्टॉल करें, या पढ़ लें।'
  }
};

export const ABOUT = {
  en: `<p>Patta turns one photo of a leaf into a plan a farmer can act on today, in the language they speak.</p>
<h3>How it works</h3><ul>
<li>You photograph a leaf. The photo is shrunk on your phone before it is sent.</li>
<li>A vision AI model reads the leaf and returns a diagnosis and an ordered plan.</li>
<li>The plan is written in your language and can be read aloud.</li>
<li>Scans stay in this phone's storage. No account, no upload of your history.</li></ul>
<h3>Rules Patta follows</h3><ul>
<li>Field care and natural options come first. Chemicals come last.</li>
<li>Active ingredients only — never a brand, never a dose.</li>
<li>When it is unsure, it says so and sends you to an agriculture officer.</li></ul>
<h3>Honest limits</h3>
<p>Patta is an early prototype and not a replacement for an agriculture officer. It has not yet been checked against a labelled photo set by an agronomist. Do not spray on its word alone.</p>
<p>Kisan Call Centre: 1800-180-1551, free, 6am to 10pm.</p>`,

  te: `<p>ఒక ఆకు ఫోటోను, రైతు ఈరోజే అమలు చేయగల ప్రణాళికగా పట్టా మారుస్తుంది — వారి భాషలోనే.</p>
<h3>ఇది ఎలా పనిచేస్తుంది</h3><ul>
<li>మీరు ఆకు ఫోటో తీస్తారు. పంపే ముందు ఫోటో మీ ఫోన్‌లోనే చిన్నదిగా మారుతుంది.</li>
<li>విజన్ AI మోడల్ ఆకును చదివి, రోగనిర్ధారణ మరియు వరుస క్రమంలో ప్రణాళిక ఇస్తుంది.</li>
<li>ప్రణాళిక మీ భాషలో ఉంటుంది, చదివి వినిపించవచ్చు.</li>
<li>స్కాన్‌లు ఈ ఫోన్‌లోనే ఉంటాయి. ఖాతా అవసరం లేదు.</li></ul>
<h3>పట్టా పాటించే నియమాలు</h3><ul>
<li>ముందు పొలం పని, సహజ పద్ధతులు. రసాయనాలు చివరన.</li>
<li>క్రియాశీల పదార్థం మాత్రమే — బ్రాండ్ లేదు, మోతాదు లేదు.</li>
<li>సందేహం ఉంటే అది చెబుతుంది, అధికారి దగ్గరకు పంపుతుంది.</li></ul>
<h3>నిజాయితీగా చెప్పాలంటే</h3>
<p>పట్టా ఇంకా ప్రారంభ నమూనా మాత్రమే. వ్యవసాయ అధికారికి ఇది ప్రత్యామ్నాయం కాదు. దీని మాట మీదే పిచికారీ చేయవద్దు.</p>
<p>కిసాన్ కాల్ సెంటర్: 1800-180-1551, ఉచితం, ఉదయం 6 నుండి రాత్రి 10 వరకు.</p>`,

  hi: `<p>पत्ता एक पत्ती की फोटो को ऐसी योजना में बदलता है जिस पर किसान आज ही काम कर सके — उसी की भाषा में।</p>
<h3>यह कैसे काम करता है</h3><ul>
<li>आप पत्ती की फोटो लेते हैं। भेजने से पहले फोटो फोन में ही छोटी हो जाती है।</li>
<li>विज़न AI मॉडल पत्ती पढ़कर पहचान और क्रम से योजना देता है।</li>
<li>योजना आपकी भाषा में होती है और सुनाई भी जा सकती है।</li>
<li>स्कैन इसी फोन में रहते हैं। कोई खाता नहीं चाहिए।</li></ul>
<h3>पत्ता के नियम</h3><ul>
<li>पहले खेत का काम और प्राकृतिक उपाय। रसायन सबसे आखिर में।</li>
<li>सिर्फ सक्रिय तत्व — कोई ब्रांड नहीं, कोई मात्रा नहीं।</li>
<li>पक्का न हो तो वह साफ कहता है और अधिकारी के पास भेजता है।</li></ul>
<h3>साफ बात</h3>
<p>पत्ता अभी शुरुआती प्रोटोटाइप है, कृषि अधिकारी का विकल्प नहीं। सिर्फ इसके कहने पर छिड़काव न करें।</p>
<p>किसान कॉल सेंटर: 1800-180-1551, निःशुल्क, सुबह 6 से रात 10 बजे तक।</p>`
};
