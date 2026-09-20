/* Two built-in cases so the demo works with no leaf, no network and no
   API key. The illustrations are drawn, not photographed — a fake photo
   would be a lie about what the model was given. */

const svg = (s) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s.replace(/\s+/g, ' ').trim());

export const SAMPLE_IMAGES = {
  tomato_early_blight: svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#6E7F4B"/>
  <g stroke="#3D5227" stroke-width="2" opacity=".5">
    <path d="M-20 260 L200 60 M60 300 L320 30 M-20 140 L160 -20"/>
  </g>
  <path d="M200 30c70 0 120 55 120 120s-55 125-120 125S80 215 80 150 130 30 200 30Z" fill="#7FA03F"/>
  <path d="M200 32c-26 22-42 60-42 118s16 96 42 118" fill="none" stroke="#5F7C2B" stroke-width="3"/>
  <path d="M200 32c26 22 42 60 42 118s-16 96-42 118" fill="none" stroke="#5F7C2B" stroke-width="3"/>
  <path d="M200 30v245" stroke="#4E6822" stroke-width="5" fill="none"/>
  <g>
    <circle cx="150" cy="118" r="26" fill="#C9A24A" opacity=".85"/>
    <circle cx="150" cy="118" r="18" fill="#8A6321"/><circle cx="150" cy="118" r="11" fill="#5C3F12"/>
    <circle cx="245" cy="180" r="21" fill="#C9A24A" opacity=".85"/>
    <circle cx="245" cy="180" r="14" fill="#8A6321"/><circle cx="245" cy="180" r="8" fill="#5C3F12"/>
    <circle cx="178" cy="215" r="15" fill="#B4913F" opacity=".8"/><circle cx="178" cy="215" r="8" fill="#6E4C17"/>
    <circle cx="232" cy="92" r="11" fill="#B4913F" opacity=".8"/><circle cx="232" cy="92" r="5" fill="#6E4C17"/>
  </g>
  <ellipse cx="150" cy="118" rx="40" ry="34" fill="#D6C15F" opacity=".3"/>
  <ellipse cx="245" cy="180" rx="34" ry="30" fill="#D6C15F" opacity=".3"/>
</svg>`),

  rice_blast: svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#5E6F42"/>
  <g stroke="#47572F" stroke-width="3" opacity=".6">
    <path d="M30 300C60 200 40 120 20 40M370 300c-30-110-10-180 10-250"/>
  </g>
  <path d="M120 290C150 200 170 110 195 20c28 92 44 182 70 270Z" fill="#8FAE4B"/>
  <path d="M195 20c-6 90-14 180-20 270" stroke="#63813A" stroke-width="4" fill="none"/>
  <g fill="#D9CE9B" stroke="#7A5C25" stroke-width="2">
    <ellipse cx="176" cy="120" rx="10" ry="26" transform="rotate(-8 176 120)"/>
    <ellipse cx="206" cy="175" rx="12" ry="31" transform="rotate(6 206 175)"/>
    <ellipse cx="168" cy="205" rx="8" ry="20" transform="rotate(-10 168 205)"/>
    <ellipse cx="216" cy="102" rx="7" ry="17" transform="rotate(5 216 102)"/>
  </g>
  <g fill="#6B4F1E">
    <ellipse cx="176" cy="120" rx="3" ry="14" transform="rotate(-8 176 120)"/>
    <ellipse cx="206" cy="175" rx="4" ry="17" transform="rotate(6 206 175)"/>
  </g>
</svg>`)
};

/* Shape of every diagnosis, sample or live. Keep the two in sync. */
export const SAMPLES = {
  tomato_early_blight: {
    en: {
      ok: true, is_plant: true, image_quality: 'good', crop: 'Tomato',
      problem: 'Early blight', problem_local: 'Early blight (Alternaria)',
      confidence: 0.82, severity: 'moderate', spread_risk: 'medium',
      what_i_see: 'Brown spots on the older, lower leaves. Each spot has rings inside it, like a target, with a yellow edge around it. The top of the plant still looks healthy.',
      why_it_happens: 'A fungus that lives in old crop waste and soil. Rain or overhead water splashes it onto the lowest leaves first, and warm humid days let it grow.',
      steps: [
        { kind: 'field', title: 'Remove the worst leaves today', detail: 'Pick off the spotted lower leaves and carry them out of the field. Do not leave them between the rows, and do not put them in the compost.', when: 'Today' },
        { kind: 'field', title: 'Water at the base, not from above', detail: 'Wet leaves let the fungus spread. Water the soil early in the day so leaves dry before evening.', when: 'From today' },
        { kind: 'organic', title: 'Spray neem oil in the evening', detail: 'Cover both sides of the leaves. Repeat after a week. Spray after sunset so the leaves do not burn.', when: 'This week' },
        { kind: 'chemical', title: 'If it keeps spreading, ask about a copper-based fungicide', detail: 'Copper oxychloride or mancozeb are the usual active ingredients for this. Ask your agriculture officer first and follow the label on the pack. Do not mix your own strength.', when: 'Only if it spreads' }
      ],
      prevention: ['Space plants so air moves between them', 'Mulch the soil so rain does not splash it up', 'Rotate away from tomato, chilli and potato next season', 'Clear old crop waste after harvest'],
      see_expert_if: ['Spots reach the fruit or the stem', 'More than half the plant is affected', 'It spreads to a new row within three days'],
      neighbour_alert: 'Tell the neighbouring field to check their lower leaves this week.'
    },
    te: {
      ok: true, is_plant: true, image_quality: 'good', crop: 'టమాటా',
      problem: 'ఎర్లీ బ్లైట్ (ఆకుమచ్చ తెగులు)', problem_local: 'Early blight (Alternaria)',
      confidence: 0.82, severity: 'moderate', spread_risk: 'medium',
      what_i_see: 'కింది పాత ఆకులపై గోధుమ రంగు మచ్చలు. ప్రతి మచ్చ లోపల గురిలా వలయాలు, చుట్టూ పసుపు అంచు. మొక్క పై భాగం ఇంకా ఆరోగ్యంగా ఉంది.',
      why_it_happens: 'పాత పంట వ్యర్థాలలో, నేలలో బతికే శిలీంధ్రం. వర్షం లేదా పైనుండి నీరు పడినప్పుడు అది కింది ఆకులపైకి చిమ్ముతుంది. వెచ్చని తేమ వాతావరణంలో వేగంగా పెరుగుతుంది.',
      steps: [
        { kind: 'field', title: 'చెడిపోయిన ఆకులను ఈరోజే తీసివేయండి', detail: 'మచ్చలున్న కింది ఆకులను తుంచి పొలం బయటకు తీసుకెళ్లండి. వరుసల మధ్య వదలవద్దు, కంపోస్ట్‌లో వేయవద్దు.', when: 'ఈరోజు' },
        { kind: 'field', title: 'పైనుండి కాకుండా మొదట్లో నీరు పెట్టండి', detail: 'ఆకులు తడిస్తే తెగులు వ్యాపిస్తుంది. ఉదయాన్నే నేలకు నీరు పెట్టండి, సాయంత్రానికి ఆకులు ఆరిపోవాలి.', when: 'ఈరోజు నుండి' },
        { kind: 'organic', title: 'సాయంత్రం వేపనూనె పిచికారీ', detail: 'ఆకు రెండు వైపులా తడిచేలా పిచికారీ చేయండి. వారం తర్వాత మళ్ళీ చేయండి. ఎండ తగ్గాక చేయండి, లేకపోతే ఆకులు కాలుతాయి.', when: 'ఈ వారం' },
        { kind: 'chemical', title: 'ఇంకా వ్యాపిస్తే రాగి ఆధారిత శిలీంధ్రనాశినిని అడగండి', detail: 'దీనికి సాధారణంగా కాపర్ ఆక్సీక్లోరైడ్ లేదా మాంకోజెబ్ వాడతారు. ముందు వ్యవసాయ అధికారిని అడగండి, ప్యాకెట్ లేబుల్ పాటించండి. మీ ఇష్టం వచ్చిన మోతాదు కలపవద్దు.', when: 'వ్యాపిస్తే మాత్రమే' }
      ],
      prevention: ['మొక్కల మధ్య గాలి ఆడేలా దూరం ఉంచండి', 'నేలపై మల్చింగ్ వేయండి, వర్షం మట్టిని చిమ్మకుండా', 'వచ్చే సీజన్‌లో టమాటా, మిరప, బంగాళాదుంప కాకుండా వేరే పంట', 'కోత తర్వాత పాత పంట వ్యర్థాలు తీసివేయండి'],
      see_expert_if: ['మచ్చలు కాయలకు లేదా కాండానికి చేరితే', 'సగానికి పైగా మొక్క దెబ్బతింటే', 'మూడు రోజుల్లో కొత్త వరుసకు వ్యాపిస్తే'],
      neighbour_alert: 'పక్క పొలం వారికి చెప్పండి — ఈ వారం వారి కింది ఆకులు చూసుకోమని.'
    },
    hi: {
      ok: true, is_plant: true, image_quality: 'good', crop: 'टमाटर',
      problem: 'अगेती झुलसा (अर्ली ब्लाइट)', problem_local: 'Early blight (Alternaria)',
      confidence: 0.82, severity: 'moderate', spread_risk: 'medium',
      what_i_see: 'नीचे की पुरानी पत्तियों पर भूरे धब्बे। हर धब्बे के अंदर निशाने जैसे छल्ले और किनारे पर पीलापन। पौधे का ऊपरी हिस्सा अभी ठीक दिख रहा है।',
      why_it_happens: 'एक फफूंद जो पुराने फसल अवशेष और मिट्टी में रहती है। बारिश या ऊपर से पानी पड़ने पर छींटों के साथ नीचे की पत्तियों पर चढ़ती है, और गर्म-नम मौसम में तेज़ी से बढ़ती है।',
      steps: [
        { kind: 'field', title: 'खराब पत्तियाँ आज ही हटाएँ', detail: 'धब्बे वाली निचली पत्तियाँ तोड़कर खेत से बाहर ले जाएँ। कतारों के बीच न छोड़ें और खाद में न डालें।', when: 'आज' },
        { kind: 'field', title: 'ऊपर से नहीं, जड़ में पानी दें', detail: 'गीली पत्तियाँ रोग फैलाती हैं। सुबह जल्दी मिट्टी में पानी दें ताकि शाम तक पत्तियाँ सूख जाएँ।', when: 'आज से' },
        { kind: 'organic', title: 'शाम को नीम तेल का छिड़काव', detail: 'पत्तियों के दोनों ओर छिड़कें। एक हफ्ते बाद दोहराएँ। धूप ढलने के बाद करें, वरना पत्तियाँ झुलस सकती हैं।', when: 'इस हफ्ते' },
        { kind: 'chemical', title: 'फिर भी फैले तो तांबा-आधारित फफूंदनाशी के बारे में पूछें', detail: 'इसके लिए आम तौर पर कॉपर ऑक्सीक्लोराइड या मैंकोज़ेब सक्रिय तत्व होते हैं। पहले कृषि अधिकारी से पूछें और पैक का लेबल मानें। अपने हिसाब से मात्रा न बनाएँ।', when: 'सिर्फ फैलने पर' }
      ],
      prevention: ['पौधों के बीच हवा चलने लायक दूरी रखें', 'मिट्टी पर मल्च डालें ताकि बारिश के छींटे न उठें', 'अगले मौसम में टमाटर, मिर्च, आलू के बजाय दूसरी फसल लें', 'कटाई के बाद पुराने अवशेष हटा दें'],
      see_expert_if: ['धब्बे फल या तने तक पहुँच जाएँ', 'आधे से ज़्यादा पौधा प्रभावित हो', 'तीन दिन में नई कतार तक फैल जाए'],
      neighbour_alert: 'पड़ोसी खेत वालों को बताएँ कि इस हफ्ते अपनी निचली पत्तियाँ देख लें।'
    }
  },

  rice_blast: {
    en: {
      ok: true, is_plant: true, image_quality: 'good', crop: 'Rice',
      problem: 'Rice blast', problem_local: 'Leaf blast (Pyricularia)',
      confidence: 0.58, severity: 'high', spread_risk: 'high',
      what_i_see: 'Spindle-shaped spots on the leaf blade, pale grey in the middle with a darker brown border. Several spots are joining into larger dead patches.',
      why_it_happens: 'A fast fungus. Cool nights with dew, thick stands and heavy nitrogen give it everything it needs. Spores travel on wind between fields.',
      steps: [
        { kind: 'field', title: 'Show this leaf to an agriculture officer first', detail: 'Patta is not confident here, and blast moves quickly. Take this leaf, or this photo, to your officer today before you buy anything.', when: 'Today' },
        { kind: 'field', title: 'Stop extra nitrogen now', detail: 'Do not top-dress urea while the spots are spreading. Soft, heavily fed leaves are the easiest for blast to enter.', when: 'Today' },
        { kind: 'field', title: 'Drain and re-water instead of holding deep water', detail: 'Let the field dry briefly, then re-flood. Constant deep water with a thick canopy keeps the leaves wet all night.', when: 'This week' },
        { kind: 'chemical', title: 'A systemic fungicide may be needed — through your officer', detail: 'Tricyclazole and isoprothiolane are the active ingredients usually recommended for blast. Confirm the diagnosis first, and follow the label on the pack. No dose is given here on purpose.', when: 'After confirmation' }
      ],
      prevention: ['Use a blast-tolerant variety next season', 'Split nitrogen into smaller doses instead of one heavy one', 'Keep the seed from a clean field, treat it before sowing', 'Do not sow too thickly'],
      see_expert_if: ['Spots appear at the node or on the neck of the panicle', 'New patches appear each morning', 'More than a tenth of the field is affected'],
      neighbour_alert: 'Blast travels on wind. Tell the fields around you to check this week — neck blast at flowering can take the whole crop.'
    },
    te: {
      ok: true, is_plant: true, image_quality: 'good', crop: 'వరి',
      problem: 'అగ్గి తెగులు (బ్లాస్ట్)', problem_local: 'Leaf blast (Pyricularia)',
      confidence: 0.58, severity: 'high', spread_risk: 'high',
      what_i_see: 'ఆకుపై కదురు ఆకారపు మచ్చలు. మధ్యలో లేత బూడిద రంగు, చుట్టూ ముదురు గోధుమ అంచు. కొన్ని మచ్చలు కలిసి పెద్ద ఎండిన మచ్చలుగా మారుతున్నాయి.',
      why_it_happens: 'చాలా వేగంగా వ్యాపించే శిలీంధ్రం. చల్లని రాత్రులు, మంచు, దట్టమైన నాట్లు, ఎక్కువ నత్రజని — ఇవన్నీ దీనికి అనుకూలం. గాలి ద్వారా పొలం నుండి పొలానికి వ్యాపిస్తుంది.',
      steps: [
        { kind: 'field', title: 'ముందుగా ఈ ఆకును వ్యవసాయ అధికారికి చూపించండి', detail: 'పట్టాకు ఇక్కడ పూర్తి స్పష్టత లేదు, అగ్గి తెగులు చాలా వేగంగా వ్యాపిస్తుంది. ఏదైనా కొనే ముందు ఈరోజే ఈ ఆకును లేదా ఈ ఫోటోను అధికారికి చూపండి.', when: 'ఈరోజు' },
        { kind: 'field', title: 'ఇప్పుడు అదనపు నత్రజని ఆపండి', detail: 'మచ్చలు వ్యాపిస్తున్నంత వరకు యూరియా వేయవద్దు. ఎక్కువ నత్రజని ఉన్న మెత్తని ఆకుల్లోకి తెగులు సులభంగా చొరబడుతుంది.', when: 'ఈరోజు' },
        { kind: 'field', title: 'లోతు నీరు నిలపకుండా, తీసి మళ్ళీ పెట్టండి', detail: 'పొలం కొద్దిగా ఆరనివ్వండి, తర్వాత మళ్ళీ నీరు పెట్టండి. దట్టమైన పైరుతో ఎప్పుడూ లోతు నీరు ఉంటే ఆకులు రాత్రంతా తడిగా ఉంటాయి.', when: 'ఈ వారం' },
        { kind: 'chemical', title: 'సిస్టమిక్ శిలీంధ్రనాశిని అవసరం కావచ్చు — అధికారి ద్వారా', detail: 'అగ్గి తెగులుకు సాధారణంగా ట్రైసైక్లాజోల్, ఐసోప్రొథయోలేన్ సూచిస్తారు. ముందు నిర్ధారణ చేయించుకోండి, ప్యాకెట్ లేబుల్ పాటించండి. మోతాదు ఇక్కడ ఉద్దేశపూర్వకంగా ఇవ్వలేదు.', when: 'నిర్ధారణ తర్వాత' }
      ],
      prevention: ['వచ్చే సీజన్‌లో తట్టుకునే రకం వాడండి', 'నత్రజనిని ఒకేసారి కాక కొద్దికొద్దిగా వేయండి', 'శుభ్రమైన పొలం విత్తనం వాడండి, విత్తే ముందు విత్తన శుద్ధి చేయండి', 'చాలా దట్టంగా నాటవద్దు'],
      see_expert_if: ['కణుపు వద్ద లేదా కంకి మెడ వద్ద మచ్చలు కనిపిస్తే', 'ప్రతి ఉదయం కొత్త మచ్చలు వస్తుంటే', 'పొలంలో పదో వంతు కంటే ఎక్కువ దెబ్బతింటే'],
      neighbour_alert: 'ఈ తెగులు గాలిలో ప్రయాణిస్తుంది. చుట్టుపక్కల పొలాలవారికి ఈ వారం చూసుకోమని చెప్పండి — పూత సమయంలో మెడ విరుపు వస్తే పంట మొత్తం పోతుంది.'
    },
    hi: {
      ok: true, is_plant: true, image_quality: 'good', crop: 'धान',
      problem: 'झोंका रोग (ब्लास्ट)', problem_local: 'Leaf blast (Pyricularia)',
      confidence: 0.58, severity: 'high', spread_risk: 'high',
      what_i_see: 'पत्ती पर तकली जैसे धब्बे — बीच में हल्का धूसर, किनारा गहरा भूरा। कुछ धब्बे मिलकर बड़े सूखे हिस्से बना रहे हैं।',
      why_it_happens: 'बहुत तेज़ फैलने वाली फफूंद। ठंडी ओस वाली रातें, घनी रोपाई और ज़्यादा नाइट्रोजन इसे पूरा मौका देते हैं। बीजाणु हवा से एक खेत से दूसरे तक जाते हैं।',
      steps: [
        { kind: 'field', title: 'पहले यह पत्ती कृषि अधिकारी को दिखाएँ', detail: 'पत्ता यहाँ पूरी तरह पक्का नहीं है, और झोंका बहुत तेज़ी से फैलता है। कुछ भी खरीदने से पहले आज ही यह पत्ती या फोटो अधिकारी को दिखाएँ।', when: 'आज' },
        { kind: 'field', title: 'अभी अतिरिक्त नाइट्रोजन रोक दें', detail: 'जब तक धब्बे फैल रहे हैं, यूरिया का छिड़काव न करें। ज़्यादा खाद वाली मुलायम पत्तियों में रोग सबसे आसानी से घुसता है।', when: 'आज' },
        { kind: 'field', title: 'गहरा पानी रोकने के बजाय निकालकर दोबारा भरें', detail: 'खेत को थोड़ा सूखने दें, फिर पानी भरें। घनी फसल के साथ लगातार गहरा पानी पत्तियों को रात भर गीला रखता है।', when: 'इस हफ्ते' },
        { kind: 'chemical', title: 'सिस्टमिक फफूंदनाशी की ज़रूरत हो सकती है — अधिकारी के ज़रिए', detail: 'झोंका के लिए आम तौर पर ट्राइसाइक्लाज़ोल और आइसोप्रोथायोलेन बताए जाते हैं। पहले पहचान पक्की कराएँ और पैक का लेबल मानें। मात्रा यहाँ जानबूझकर नहीं दी गई।', when: 'पुष्टि के बाद' }
      ],
      prevention: ['अगले मौसम में रोग-सहनशील किस्म लें', 'नाइट्रोजन एक बार में नहीं, थोड़ा-थोड़ा दें', 'साफ खेत का बीज लें और बुवाई से पहले बीजोपचार करें', 'बहुत घनी रोपाई न करें'],
      see_expert_if: ['गाँठ पर या बाली की गर्दन पर धब्बे दिखें', 'हर सुबह नए धब्बे बनें', 'खेत का दसवाँ हिस्सा से ज़्यादा प्रभावित हो'],
      neighbour_alert: 'यह रोग हवा से फैलता है। आसपास के खेतों को इस हफ्ते जाँच करने को कहें — फूल आते समय गर्दन का झोंका पूरी फसल ले जा सकता है।'
    }
  }
};
