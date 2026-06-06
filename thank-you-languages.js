'use strict';

(function exposeThankYouLanguages(root) {
  const languages = [
    {
      name: { en: 'English', ro: 'Engleză' },
      flag: '🇬🇧',
      thankYou: 'Thank you',
      thankYouPhonetic: '/thangk yoo/',
      welcome: "You're welcome",
      welcomePhonetic: '/yoor wel-kuhm/'
    },
    {
      name: { en: 'Spanish', ro: 'Spaniolă' },
      flag: '🇪🇸',
      thankYou: 'Gracias',
      thankYouPhonetic: '/gra-see-as/',
      welcome: 'De nada',
      welcomePhonetic: '/deh nah-dah/'
    },
    {
      name: { en: 'French', ro: 'Franceză' },
      flag: '🇫🇷',
      thankYou: 'Merci',
      thankYouPhonetic: '/mer-see/',
      welcome: 'De rien',
      welcomePhonetic: '/duh ree-en/'
    },
    {
      name: { en: 'German', ro: 'Germană' },
      flag: '🇩🇪',
      thankYou: 'Danke',
      thankYouPhonetic: '/dahn-kuh/',
      welcome: 'Bitte',
      welcomePhonetic: '/bih-tuh/'
    },
    {
      name: { en: 'Italian', ro: 'Italiană' },
      flag: '🇮🇹',
      thankYou: 'Grazie',
      thankYouPhonetic: '/graht-see-eh/',
      welcome: 'Prego',
      welcomePhonetic: '/preh-goh/'
    },
    {
      name: { en: 'Portuguese', ro: 'Portugheză' },
      flag: '🇵🇹',
      thankYou: 'Obrigado',
      thankYouPhonetic: '/oh-bree-gah-doo/',
      welcome: 'De nada',
      welcomePhonetic: '/deh nah-dah/'
    },
    {
      name: { en: 'Dutch', ro: 'Olandeză' },
      flag: '🇳🇱',
      thankYou: 'Dank je',
      thankYouPhonetic: '/dahnk yuh/',
      welcome: 'Graag gedaan',
      welcomePhonetic: '/hrahkh huh-dahn/'
    },
    {
      name: { en: 'Romanian', ro: 'Română' },
      flag: '🇷🇴',
      thankYou: 'Mulțumesc',
      thankYouPhonetic: '/mool-tsoo-mesk/',
      welcome: 'Cu plăcere',
      welcomePhonetic: '/koo pluh-cheh-reh/'
    },
    {
      name: { en: 'Greek', ro: 'Greacă' },
      flag: '🇬🇷',
      thankYou: 'Ευχαριστώ',
      thankYouPhonetic: '/ef-ha-ri-sto/',
      welcome: 'Παρακαλώ',
      welcomePhonetic: '/pa-ra-ka-lo/'
    },
    {
      name: { en: 'Polish', ro: 'Poloneză' },
      flag: '🇵🇱',
      thankYou: 'Dziękuję',
      thankYouPhonetic: '/jen-koo-yeh/',
      welcome: 'Proszę',
      welcomePhonetic: '/pro-sheh/'
    },
    {
      name: { en: 'Russian', ro: 'Rusă' },
      flag: '🇷🇺',
      thankYou: 'Спасибо',
      thankYouPhonetic: '/spa-see-ba/',
      welcome: 'Пожалуйста',
      welcomePhonetic: '/pa-zhal-sta/'
    },
    {
      name: { en: 'Czech', ro: 'Cehă' },
      flag: '🇨🇿',
      thankYou: 'Děkuji',
      thankYouPhonetic: '/dyeh-koo-yi/',
      welcome: 'Prosím',
      welcomePhonetic: '/pro-seem/'
    },
    {
      name: { en: 'Hungarian', ro: 'Maghiară' },
      flag: '🇭🇺',
      thankYou: 'Köszönöm',
      thankYouPhonetic: '/ko-so-nom/',
      welcome: 'Szívesen',
      welcomePhonetic: '/see-veh-shen/'
    },
    {
      name: { en: 'Swedish', ro: 'Suedeză' },
      flag: '🇸🇪',
      thankYou: 'Tack',
      thankYouPhonetic: '/tahk/',
      welcome: 'Varsågod',
      welcomePhonetic: '/vahr-so-good/'
    },
    {
      name: { en: 'Danish', ro: 'Daneză' },
      flag: '🇩🇰',
      thankYou: 'Tak',
      thankYouPhonetic: '/tahg/',
      welcome: 'Selv tak',
      welcomePhonetic: '/sel tahg/'
    },
    {
      name: { en: 'Finnish', ro: 'Finlandeză' },
      flag: '🇫🇮',
      thankYou: 'Kiitos',
      thankYouPhonetic: '/kee-tos/',
      welcome: 'Ole hyvä',
      welcomePhonetic: '/oh-leh hoo-va/'
    },
    {
      name: { en: 'Slovak', ro: 'Slovacă' },
      flag: '🇸🇰',
      thankYou: 'Ďakujem',
      thankYouPhonetic: '/dya-koo-yem/',
      welcome: 'Prosím',
      welcomePhonetic: '/pro-seem/'
    },
    {
      name: { en: 'Bulgarian', ro: 'Bulgară' },
      flag: '🇧🇬',
      thankYou: 'Благодаря',
      thankYouPhonetic: '/bla-go-da-rya/',
      welcome: 'Моля',
      welcomePhonetic: '/mo-lya/'
    },
    {
      name: { en: 'Croatian', ro: 'Croată' },
      flag: '🇭🇷',
      thankYou: 'Hvala',
      thankYouPhonetic: '/hva-la/',
      welcome: 'Molim',
      welcomePhonetic: '/mo-leem/'
    },
    {
      name: { en: 'Ukrainian', ro: 'Ucraineană' },
      flag: '🇺🇦',
      thankYou: 'Дякую',
      thankYouPhonetic: '/dya-koo-yu/',
      welcome: 'Будь ласка',
      welcomePhonetic: '/bood las-ka/'
    },
    {
      name: { en: 'Belarusian', ro: 'Bielorusă' },
      flag: '🇧🇾',
      thankYou: 'Дзякуй',
      thankYouPhonetic: '/dzya-kooy/',
      welcome: 'Калі ласка',
      welcomePhonetic: '/ka-lee las-ka/'
    },
    {
      name: { en: 'Lithuanian', ro: 'Lituaniană' },
      flag: '🇱🇹',
      thankYou: 'Ačiū',
      thankYouPhonetic: '/ah-choo/',
      welcome: 'Prašom',
      welcomePhonetic: '/pra-shom/'
    },
    {
      name: { en: 'Latvian', ro: 'Letonă' },
      flag: '🇱🇻',
      thankYou: 'Paldies',
      thankYouPhonetic: '/pal-dyes/',
      welcome: 'Lūdzu',
      welcomePhonetic: '/loo-dzoo/'
    },
    {
      name: { en: 'Estonian', ro: 'Estonă' },
      flag: '🇪🇪',
      thankYou: 'Aitäh',
      thankYouPhonetic: '/eye-tah/',
      welcome: 'Palun',
      welcomePhonetic: '/pa-loon/'
    },
    {
      name: { en: 'Irish', ro: 'Irlandeză' },
      flag: '🇮🇪',
      thankYou: 'Go raibh maith agat',
      thankYouPhonetic: '/guh rev mah a-gut/',
      welcome: 'Fáilte',
      welcomePhonetic: '/fawl-cha/'
    },
    {
      name: { en: 'Maltese', ro: 'Malteză' },
      flag: '🇲🇹',
      thankYou: 'Grazzi',
      thankYouPhonetic: '/grats-ee/',
      welcome: 'Mhux problem',
      welcomePhonetic: '/mush prob-lem/'
    },
    {
      name: { en: 'Albanian', ro: 'Albaneză' },
      flag: '🇦🇱',
      thankYou: 'Faleminderit',
      thankYouPhonetic: '/fa-le-min-de-rit/',
      welcome: 'Të lutem',
      welcomePhonetic: '/tuh loo-tem/'
    },
    {
      name: { en: 'Macedonian', ro: 'Macedoneană' },
      flag: '🇲🇰',
      thankYou: 'Благодарам',
      thankYouPhonetic: '/bla-go-da-ram/',
      welcome: 'Молам',
      welcomePhonetic: '/mo-lam/'
    },
    {
      name: { en: 'Catalan', ro: 'Catalană' },
      flag: '🇦🇩',
      thankYou: 'Gràcies',
      thankYouPhonetic: '/gra-see-uhs/',
      welcome: 'De res',
      welcomePhonetic: '/duh res/'
    },
    {
      name: { en: 'Basque', ro: 'Bască' },
      flag: '🇪🇸',
      thankYou: 'Eskerrik asko',
      thankYouPhonetic: '/es-ker-rik as-ko/',
      welcome: 'Ez horregatik',
      welcomePhonetic: '/ez or-re-ga-tik/'
    },
    {
      name: { en: 'Galician', ro: 'Galiciană' },
      flag: '🇪🇸',
      thankYou: 'Grazas',
      thankYouPhonetic: '/gra-thas/',
      welcome: 'De nada',
      welcomePhonetic: '/deh na-da/'
    },
    {
      name: { en: 'Welsh', ro: 'Galeză' },
      flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
      thankYou: 'Diolch',
      thankYouPhonetic: '/dee-olch/',
      welcome: 'Croeso',
      welcomePhonetic: '/kroy-so/'
    },
    {
      name: { en: 'Mandarin', ro: 'Mandarină' },
      flag: '🇨🇳',
      thankYou: '谢谢 (Xièxiè)',
      thankYouPhonetic: '/shyeh-shyeh/',
      welcome: '不客气 (Bù kèqì)',
      welcomePhonetic: '/boo kuh-chee/'
    },
    {
      name: { en: 'Hindi', ro: 'Hindi' },
      flag: '🇮🇳',
      thankYou: 'धन्यवाद (Dhanyavaad)',
      thankYouPhonetic: '/dhun-yuh-vahd/',
      welcome: 'स्वागत है (Swagat hai)',
      welcomePhonetic: '/swah-gut hay/'
    },
    {
      name: { en: 'Arabic', ro: 'Arabă' },
      flag: '🇸🇦',
      thankYou: 'شكراً (Shukran)',
      thankYouPhonetic: '/shook-ran/',
      welcome: 'عفواً (Afwan)',
      welcomePhonetic: '/af-wan/'
    },
    {
      name: { en: 'Bengali', ro: 'Bengaleză' },
      flag: '🇧🇩',
      thankYou: 'ধন্যবাদ (Dhonnobad)',
      thankYouPhonetic: '/dhon-no-bad/',
      welcome: 'স্বাগতম (Shagotom)',
      welcomePhonetic: '/sha-go-tom/'
    },
    {
      name: { en: 'Urdu', ro: 'Urdu' },
      flag: '🇵🇰',
      thankYou: 'شکریہ (Shukriya)',
      thankYouPhonetic: '/shook-ree-ya/',
      welcome: 'خوش آمدید (Khush amdeed)',
      welcomePhonetic: '/khoosh am-deed/'
    },
    {
      name: { en: 'Indonesian', ro: 'Indoneziană' },
      flag: '🇮🇩',
      thankYou: 'Terima kasih',
      thankYouPhonetic: '/tuh-ree-mah kah-see/',
      welcome: 'Sama-sama',
      welcomePhonetic: '/sah-mah sah-mah/'
    },
    {
      name: { en: 'Japanese', ro: 'Japoneză' },
      flag: '🇯🇵',
      thankYou: 'ありがとう (Arigatou)',
      thankYouPhonetic: '/ah-ree-gah-toh/',
      welcome: 'どういたしまして (Douitashimashite)',
      welcomePhonetic: '/doh-ee-tah-shee-mah-sheh-teh/'
    },
    {
      name: { en: 'Swahili', ro: 'Swahili' },
      flag: '🇰🇪',
      thankYou: 'Asante',
      thankYouPhonetic: '/ah-sahn-teh/',
      welcome: 'Karibu',
      welcomePhonetic: '/kah-ree-boo/'
    },
    {
      name: { en: 'Turkish', ro: 'Turcă' },
      flag: '🇹🇷',
      thankYou: 'Teşekkür ederim',
      thankYouPhonetic: '/teh-sheh-koor eh-deh-reem/',
      welcome: 'Rica ederim',
      welcomePhonetic: '/ree-jah eh-deh-reem/'
    },
    {
      name: { en: 'Korean', ro: 'Coreeană' },
      flag: '🇰🇷',
      thankYou: '감사합니다 (Gamsahamnida)',
      thankYouPhonetic: '/gahm-sah-hahm-nee-dah/',
      welcome: '천만에요 (Cheonmaneyo)',
      welcomePhonetic: '/chun-mahn-eh-yo/'
    },
    {
      name: { en: 'Vietnamese', ro: 'Vietnameză' },
      flag: '🇻🇳',
      thankYou: 'Cảm ơn',
      thankYouPhonetic: '/kahm uhn/',
      welcome: 'Không có chi',
      welcomePhonetic: '/khong koh chee/'
    },
    {
      name: { en: 'Thai', ro: 'Thailandeză' },
      flag: '🇹🇭',
      thankYou: 'ขอบคุณ (Khop khun)',
      thankYouPhonetic: '/kop koon/',
      welcome: 'ยินดี (Yin dee)',
      welcomePhonetic: '/yin dee/'
    },
    {
      name: { en: 'Filipino/Tagalog', ro: 'Filipineză/Tagalog' },
      flag: '🇵🇭',
      thankYou: 'Salamat',
      thankYouPhonetic: '/sah-lah-maht/',
      welcome: 'Walang anuman',
      welcomePhonetic: '/wah-lang ah-noo-mahn/'
    },
    {
      name: { en: 'Persian/Farsi', ro: 'Persană/Farsi' },
      flag: '🇮🇷',
      thankYou: 'ممنون (Mamnoon)',
      thankYouPhonetic: '/mam-noon/',
      welcome: 'خواهش می‌کنم (Khahesh mikonam)',
      welcomePhonetic: '/khah-hesh mee-ko-nam/'
    },
    {
      name: { en: 'Hausa', ro: 'Hausa' },
      flag: '🇳🇬',
      thankYou: 'Na gode',
      thankYouPhonetic: '/nah goh-deh/',
      welcome: 'Ba komai',
      welcomePhonetic: '/bah koh-my/'
    },
    {
      name: { en: 'Yoruba', ro: 'Yoruba' },
      flag: '🇳🇬',
      thankYou: 'Ẹ ṣé',
      thankYouPhonetic: '/eh sheh/',
      welcome: 'Kò tọ́pẹ́',
      welcomePhonetic: '/koh toh-peh/'
    },
    {
      name: { en: 'Tamil', ro: 'Tamilă' },
      flag: '🇮🇳',
      thankYou: 'நன்றி (Nandri)',
      thankYouPhonetic: '/nun-dree/',
      welcome: 'பரவாயில்லை (Parava illai)',
      welcomePhonetic: '/pah-rah-vah il-lai/'
    },
    {
      name: { en: 'Javanese', ro: 'Javaneză' },
      flag: '🇮🇩',
      thankYou: 'Matur nuwun',
      thankYouPhonetic: '/mah-toor noo-woon/',
      welcome: 'Sami-sami',
      welcomePhonetic: '/sah-mee sah-mee/'
    },
    {
      name: { en: 'Telugu', ro: 'Telugu' },
      flag: '🇮🇳',
      thankYou: 'ధన్యవాదాలు (Dhanyavaadalu)',
      thankYouPhonetic: '/dhun-yuh-vah-dah-loo/',
      welcome: 'పర్వాలేదు (Parvaledu)',
      welcomePhonetic: '/par-vah-lay-doo/'
    },
    {
      name: { en: 'Marathi', ro: 'Marathi' },
      flag: '🇮🇳',
      thankYou: 'धन्यवाद (Dhanyavaad)',
      thankYouPhonetic: '/dhun-yuh-vaad/',
      welcome: 'काही हरकत नाही (Kahi harakat nahi)',
      welcomePhonetic: '/kah-hee hah-rah-kat nah-hee/'
    },
    {
      name: { en: 'Punjabi', ro: 'Punjabi' },
      flag: '🇮🇳',
      thankYou: 'ਧੰਨਵਾਦ (Dhanvaad)',
      thankYouPhonetic: '/dhan-vaad/',
      welcome: 'ਕੋਈ ਗੱਲ ਨਹੀਂ (Koi gal nahi)',
      welcomePhonetic: '/koy gal nah-hee/'
    },
    {
      name: { en: 'Gujarati', ro: 'Gujarati' },
      flag: '🇮🇳',
      thankYou: 'આભાર (Aabhar)',
      thankYouPhonetic: '/aa-bhaar/',
      welcome: 'કોઈ વાત નથી (Koi vaat nathi)',
      welcomePhonetic: '/koy vaat nah-thee/'
    },
    {
      name: { en: 'Kannada', ro: 'Kannada' },
      flag: '🇮🇳',
      thankYou: 'ಧನ್ಯವಾದಗಳು (Dhanyavaadagalu)',
      thankYouPhonetic: '/dhun-yuh-vah-dah-gah-loo/',
      welcome: 'ಪರವಾಗಿಲ್ಲ (Paravagilla)',
      welcomePhonetic: '/pah-rah-vah-gil-lah/'
    },
    {
      name: { en: 'Malayalam', ro: 'Malayalam' },
      flag: '🇮🇳',
      thankYou: 'നന്ദി (Nanni)',
      thankYouPhonetic: '/nun-nee/',
      welcome: 'സാരമില്ല (Saramilla)',
      welcomePhonetic: '/sah-rah-mil-lah/'
    },
    {
      name: { en: 'Odia', ro: 'Odia' },
      flag: '🇮🇳',
      thankYou: 'ଧନ୍ୟବାଦ (Dhanyabad)',
      thankYouPhonetic: '/dhon-yo-baad/',
      welcome: 'କିଛି ନୁହେଁ (Kichhi nuhen)',
      welcomePhonetic: '/kee-chhee noo-hen/'
    },
    {
      name: { en: 'Sinhala', ro: 'Sinhaleză' },
      flag: '🇱🇰',
      thankYou: 'ස්තූතියි (Sthuthi)',
      thankYouPhonetic: '/sthoo-thee/',
      welcome: 'ප්‍රශ්නයක් නැහැ (Prashnayak nehe)',
      welcomePhonetic: '/prash-nah-yak neh-heh/'
    },
    {
      name: { en: 'Nepali', ro: 'Nepaleză' },
      flag: '🇳🇵',
      thankYou: 'धन्यवाद (Dhanyabad)',
      thankYouPhonetic: '/dhun-yuh-baad/',
      welcome: 'केही छैन (Kehi chaina)',
      welcomePhonetic: '/keh-hee chai-nah/'
    },
    {
      name: { en: 'Burmese', ro: 'Birmană' },
      flag: '🇲🇲',
      thankYou: 'ကျေးဇူးတင်ပါတယ် (Kyay zu tin ba de)',
      thankYouPhonetic: '/chay-zoo-tin-bah-deh/',
      welcome: 'ရပါတယ် (Ya ba de)',
      welcomePhonetic: '/yah bah deh/'
    },
    {
      name: { en: 'Khmer', ro: 'Khmeră' },
      flag: '🇰🇭',
      thankYou: 'អរគុណ (Arkun)',
      thankYouPhonetic: '/aw-koon/',
      welcome: 'មិនអីទេ (Min ey te)',
      welcomePhonetic: '/min ay teh/'
    },
    {
      name: { en: 'Lao', ro: 'Laoțiană' },
      flag: '🇱🇦',
      thankYou: 'ຂອບໃຈ (Khob chai)',
      thankYouPhonetic: '/khop chai/',
      welcome: 'ບໍ່ເປັນຫຍັງ (Bo pen nyang)',
      welcomePhonetic: '/boh pen nyang/'
    },
    {
      name: { en: 'Sundanese', ro: 'Sundaneză' },
      flag: '🇮🇩',
      thankYou: 'Hatur nuhun',
      thankYouPhonetic: '/hah-toor noo-hoon/',
      welcome: 'Sawangsulna',
      welcomePhonetic: '/sah-wang-sool-nah/'
    },
    {
      name: { en: 'Cebuano', ro: 'Cebuano' },
      flag: '🇵🇭',
      thankYou: 'Daghang salamat',
      thankYouPhonetic: '/dag-hang sah-lah-mat/',
      welcome: 'Walay sapayan',
      welcomePhonetic: '/wah-lay sah-pah-yan/'
    },
    {
      name: { en: 'Ilocano', ro: 'Ilocano' },
      flag: '🇵🇭',
      thankYou: 'Agyamanak',
      thankYouPhonetic: '/ag-yah-mah-nak/',
      welcome: 'Awan ania man',
      welcomePhonetic: '/ah-wan ah-nee-ah man/'
    },
    {
      name: { en: 'Min Nan/Hokkien', ro: 'Min Nan/Hokkien' },
      flag: '🇹🇼',
      thankYou: '多謝 (To sia)',
      thankYouPhonetic: '/doh siah/',
      welcome: '免客氣 (Bian khe khi)',
      welcomePhonetic: '/byen kheh khee/'
    },
    {
      name: { en: 'Cantonese', ro: 'Cantoneză' },
      flag: '🇭🇰',
      thankYou: '唔該 (M goi)',
      thankYouPhonetic: '/m goy/',
      welcome: '唔使客氣 (M sai haak hei)',
      welcomePhonetic: '/m sai hahk hay/'
    },
    {
      name: { en: 'Wu/Shanghainese', ro: 'Wu/Shanghaineză' },
      flag: '🇨🇳',
      thankYou: '谢谢侬 (Xia xia nong)',
      thankYouPhonetic: '/zya zya nong/',
      welcome: '勿要客气 (Veu iao khak chi)',
      welcomePhonetic: '/vuh yao khak chee/'
    },
    {
      name: { en: 'Hakka', ro: 'Hakka' },
      flag: '🇨🇳',
      thankYou: '承蒙你 (Sang mung ngi)',
      thankYouPhonetic: '/sang moong ngee/',
      welcome: '毋使客氣 (M sai hak hi)',
      welcomePhonetic: '/m sai hak hee/'
    },
    {
      name: { en: 'Jin Chinese', ro: 'Chineză Jin' },
      flag: '🇨🇳',
      thankYou: '谢咧 (Xie lie)',
      thankYouPhonetic: '/shyeh lyeh/',
      welcome: '不客气 (Bu ke qi)',
      welcomePhonetic: '/boo kuh chee/'
    },
    {
      name: { en: 'Gan Chinese', ro: 'Chineză Gan' },
      flag: '🇨🇳',
      thankYou: '多谢 (Do xia)',
      thankYouPhonetic: '/doh shya/',
      welcome: '莫客气 (Mo hak chi)',
      welcomePhonetic: '/moh hak chee/'
    },
    {
      name: { en: 'Xiang Chinese', ro: 'Chineză Xiang' },
      flag: '🇨🇳',
      thankYou: '多谢哒 (Do xia da)',
      thankYouPhonetic: '/doh shya dah/',
      welcome: '莫客气 (Mo ke qi)',
      welcomePhonetic: '/moh kuh chee/'
    },
    {
      name: { en: 'Teochew', ro: 'Teochew' },
      flag: '🇨🇳',
      thankYou: '多谢 (Doh zia)',
      thankYouPhonetic: '/doh zia/',
      welcome: '免客气 (Mian khe khi)',
      welcomePhonetic: '/myen kheh khee/'
    },
    {
      name: { en: 'Amharic', ro: 'Amharică' },
      flag: '🇪🇹',
      thankYou: 'አመሰግናለሁ (Ameseginalehu)',
      thankYouPhonetic: '/ah-meh-seh-gih-nah-leh-hoo/',
      welcome: 'ምንም አይደለም (Minim aydelem)',
      welcomePhonetic: '/mih-nim eye-deh-lem/'
    },
    {
      name: { en: 'Oromo', ro: 'Oromo' },
      flag: '🇪🇹',
      thankYou: 'Galatoomi',
      thankYouPhonetic: '/gah-lah-toh-mee/',
      welcome: 'Homaa miti',
      welcomePhonetic: '/hoh-mah mee-tee/'
    },
    {
      name: { en: 'Somali', ro: 'Somaleză' },
      flag: '🇸🇴',
      thankYou: 'Mahadsanid',
      thankYouPhonetic: '/mah-had-sah-nid/',
      welcome: 'Adaa mudan',
      welcomePhonetic: '/ah-dah moo-dan/'
    },
    {
      name: { en: 'Igbo', ro: 'Igbo' },
      flag: '🇳🇬',
      thankYou: 'Daalụ',
      thankYouPhonetic: '/dah-loo/',
      welcome: 'Ọ dịghị ihe ọ bụla',
      welcomePhonetic: '/oh dee-ghee ee-heh oh bu-la/'
    },
    {
      name: { en: 'Zulu', ro: 'Zulu' },
      flag: '🇿🇦',
      thankYou: 'Ngiyabonga',
      thankYouPhonetic: '/ngee-yah-bong-gah/',
      welcome: 'Wamukelekile',
      welcomePhonetic: '/wah-moo-keh-leh-kee-leh/'
    },
    {
      name: { en: 'Xhosa', ro: 'Xhosa' },
      flag: '🇿🇦',
      thankYou: 'Enkosi',
      thankYouPhonetic: '/en-koh-see/',
      welcome: 'Wamkelekile',
      welcomePhonetic: '/wahm-keh-leh-kee-leh/'
    },
    {
      name: { en: 'Afrikaans', ro: 'Afrikaans' },
      flag: '🇿🇦',
      thankYou: 'Dankie',
      thankYouPhonetic: '/dahn-kee/',
      welcome: 'Dis ’n plesier',
      welcomePhonetic: '/dis un pleh-seer/'
    },
    {
      name: { en: 'Kinyarwanda', ro: 'Kinyarwanda' },
      flag: '🇷🇼',
      thankYou: 'Murakoze',
      thankYouPhonetic: '/moo-rah-koh-zeh/',
      welcome: 'Ntacyo',
      welcomePhonetic: '/ncha-cho/'
    },
    {
      name: { en: 'Kirundi', ro: 'Kirundi' },
      flag: '🇧🇮',
      thankYou: 'Urakoze',
      thankYouPhonetic: '/oo-rah-koh-zeh/',
      welcome: 'Nta co bitwaye',
      welcomePhonetic: '/nta cho bee-twah-yeh/'
    },
    {
      name: { en: 'Shona', ro: 'Shona' },
      flag: '🇿🇼',
      thankYou: 'Ndatenda',
      thankYouPhonetic: '/ndah-ten-dah/',
      welcome: 'Zvakanaka',
      welcomePhonetic: '/zvah-kah-nah-kah/'
    },
    {
      name: { en: 'Malagasy', ro: 'Malgașă' },
      flag: '🇲🇬',
      thankYou: 'Misaotra',
      thankYouPhonetic: '/mee-sow-chrah/',
      welcome: 'Tsy misy fisaorana',
      welcomePhonetic: '/tsee mee-see fee-sow-rah-nah/'
    },
    {
      name: { en: 'Chichewa/Nyanja', ro: 'Chichewa/Nyanja' },
      flag: '🇲🇼',
      thankYou: 'Zikomo',
      thankYouPhonetic: '/zee-koh-moh/',
      welcome: 'Palibe kanthu',
      welcomePhonetic: '/pah-lee-beh kahn-too/'
    },
    {
      name: { en: 'Wolof', ro: 'Wolof' },
      flag: '🇸🇳',
      thankYou: 'Jërëjëf',
      thankYouPhonetic: '/jeh-reh-jef/',
      welcome: 'Ñoo ko bokk',
      welcomePhonetic: '/nyoh koh bok/'
    },
    {
      name: { en: 'Fula/Fulfulde', ro: 'Fula/Fulfulde' },
      flag: '🌍',
      thankYou: 'A jaraama',
      thankYouPhonetic: '/ah jah-rah-mah/',
      welcome: 'Awa',
      welcomePhonetic: '/ah-wah/'
    },
    {
      name: { en: 'Akan/Twi', ro: 'Akan/Twi' },
      flag: '🇬🇭',
      thankYou: 'Medaase',
      thankYouPhonetic: '/meh-dah-see/',
      welcome: 'Yɛ ma wo akwaaba',
      welcomePhonetic: '/yeh mah woh ah-kwah-bah/'
    },
    {
      name: { en: 'Bambara', ro: 'Bambara' },
      flag: '🇲🇱',
      thankYou: 'I ni ce',
      thankYouPhonetic: '/ee nee cheh/',
      welcome: 'Ala ka here caya',
      welcomePhonetic: '/ah-lah kah heh-reh chah-yah/'
    },
    {
      name: { en: 'Lingala', ro: 'Lingala' },
      flag: '🇨🇩',
      thankYou: 'Matondi',
      thankYouPhonetic: '/mah-ton-dee/',
      welcome: 'Likambo te',
      welcomePhonetic: '/lee-kahm-bo teh/'
    },
    {
      name: { en: 'Sango', ro: 'Sango' },
      flag: '🇨🇫',
      thankYou: 'Balao',
      thankYouPhonetic: '/bah-lah-oh/',
      welcome: 'A yeke nzoni',
      welcomePhonetic: '/ah yeh-keh nzo-nee/'
    },
    {
      name: { en: 'Tigrinya', ro: 'Tigrinya' },
      flag: '🇪🇷',
      thankYou: 'የቐንየለይ (Yekenyeley)',
      thankYouPhonetic: '/yeh-ken-yeh-lay/',
      welcome: 'ብደሓን (Bidehan)',
      welcomePhonetic: '/bee-deh-han/'
    },
    {
      name: { en: 'Ewe', ro: 'Ewe' },
      flag: '🇹🇬',
      thankYou: 'Akpe',
      thankYouPhonetic: '/ahk-peh/',
      welcome: 'Menyo o',
      welcomePhonetic: '/meh-nyoh oh/'
    },
    {
      name: { en: 'Ga', ro: 'Ga' },
      flag: '🇬🇭',
      thankYou: 'Oyiwaladɔŋ',
      thankYouPhonetic: '/oy-wah-lah-dong/',
      welcome: 'Bibio',
      welcomePhonetic: '/bee-bee-oh/'
    },
    {
      name: { en: 'Luganda', ro: 'Luganda' },
      flag: '🇺🇬',
      thankYou: 'Webale',
      thankYouPhonetic: '/weh-bah-leh/',
      welcome: 'Kale',
      welcomePhonetic: '/kah-leh/'
    },
    {
      name: { en: 'Luo', ro: 'Luo' },
      flag: '🇰🇪',
      thankYou: 'Erokamano',
      thankYouPhonetic: '/eh-roh-kah-mah-no/',
      welcome: 'Ber ahinya',
      welcomePhonetic: '/ber ah-heen-yah/'
    },
    {
      name: { en: 'Kikuyu', ro: 'Kikuyu' },
      flag: '🇰🇪',
      thankYou: 'Ni wega',
      thankYouPhonetic: '/nee weh-gah/',
      welcome: 'Tiga kuona',
      welcomePhonetic: '/tee-gah koh-oh-nah/'
    },
    {
      name: { en: 'Kongo', ro: 'Kongo' },
      flag: '🇨🇩',
      thankYou: 'Matondo',
      thankYouPhonetic: '/mah-ton-doh/',
      welcome: 'Mpasi ko',
      welcomePhonetic: '/m-pah-see koh/'
    },
    {
      name: { en: 'Sesotho', ro: 'Sesotho' },
      flag: '🇱🇸',
      thankYou: 'Kea leboha',
      thankYouPhonetic: '/keh-ah leh-boh-hah/',
      welcome: 'Ho lokile',
      welcomePhonetic: '/hoh loh-kee-leh/'
    },
    {
      name: { en: 'Setswana', ro: 'Setswana' },
      flag: '🇧🇼',
      thankYou: 'Ke a leboga',
      thankYouPhonetic: '/keh ah leh-boh-gah/',
      welcome: 'Go siame',
      welcomePhonetic: '/goh see-ah-meh/'
    },
    {
      name: { en: 'Sepedi', ro: 'Sepedi' },
      flag: '🇿🇦',
      thankYou: 'Ke a leboga',
      thankYouPhonetic: '/keh ah leh-boh-kha/',
      welcome: 'Go lokile',
      welcomePhonetic: '/goh loh-kee-leh/'
    },
    {
      name: { en: 'Swati', ro: 'Swati' },
      flag: '🇸🇿',
      thankYou: 'Ngiyabonga kakhulu',
      thankYouPhonetic: '/ngee-yah-bong-gah kah-khoo-loo/',
      welcome: 'Wemukelekile',
      welcomePhonetic: '/weh-moo-keh-leh-kee-leh/'
    },
    {
      name: { en: 'Tsonga', ro: 'Tsonga' },
      flag: '🇿🇦',
      thankYou: 'Ndza khensa',
      thankYouPhonetic: '/ndzah khen-sah/',
      welcome: 'Swi kahle',
      welcomePhonetic: '/swee kah-leh/'
    },
    {
      name: { en: 'Venda', ro: 'Venda' },
      flag: '🇿🇦',
      thankYou: 'Ndi a livhuwa',
      thankYouPhonetic: '/n-dee ah lee-voo-wah/',
      welcome: 'Zwo luga',
      welcomePhonetic: '/zwoh loo-gah/'
    },
    {
      name: { en: 'Pashto', ro: 'Paștună' },
      flag: '🇦🇫',
      thankYou: 'مننه (Manana)',
      thankYouPhonetic: '/mah-nah-nah/',
      welcome: 'هر کله (Har kala)',
      welcomePhonetic: '/har kah-lah/'
    },
    {
      name: { en: 'Kurdish', ro: 'Kurdă' },
      flag: '🌍',
      thankYou: 'Spas',
      thankYouPhonetic: '/spahs/',
      welcome: 'Ser çavan',
      welcomePhonetic: '/ser chah-vahn/'
    },
    {
      name: { en: 'Kazakh', ro: 'Kazahă' },
      flag: '🇰🇿',
      thankYou: 'Рақмет (Rakhmet)',
      thankYouPhonetic: '/rakh-met/',
      welcome: 'Оқасы жоқ (Oqasy joq)',
      welcomePhonetic: '/oh-kah-see zhok/'
    },
    {
      name: { en: 'Uzbek', ro: 'Uzbecă' },
      flag: '🇺🇿',
      thankYou: 'Katta rahmat',
      thankYouPhonetic: '/kat-tah rah-mat/',
      welcome: 'Arzimaydi',
      welcomePhonetic: '/ar-zee-may-dee/'
    },
    {
      name: { en: 'Azerbaijani', ro: 'Azeră' },
      flag: '🇦🇿',
      thankYou: 'Sağ olun',
      thankYouPhonetic: '/sagh oh-loon/',
      welcome: 'Buyurun',
      welcomePhonetic: '/boo-yoo-roon/'
    },
    {
      name: { en: 'Turkmen', ro: 'Turkmenă' },
      flag: '🇹🇲',
      thankYou: 'Sag boluň',
      thankYouPhonetic: '/sagh boh-loong/',
      welcome: 'Hiç zat däl',
      welcomePhonetic: '/heech zaht dahl/'
    },
    {
      name: { en: 'Kyrgyz', ro: 'Kârgâză' },
      flag: '🇰🇬',
      thankYou: 'Чоң рахмат (Chong rakhmat)',
      thankYouPhonetic: '/chong rakh-mat/',
      welcome: 'Эч нерсе эмес (Ech nerse emes)',
      welcomePhonetic: '/ech ner-seh eh-mes/'
    },
    {
      name: { en: 'Tajik', ro: 'Tadjică' },
      flag: '🇹🇯',
      thankYou: 'Ташаккур (Tashakkur)',
      thankYouPhonetic: '/tah-shahk-koor/',
      welcome: 'Марҳамат (Marhamat)',
      welcomePhonetic: '/mar-hah-mat/'
    },
    {
      name: { en: 'Mongolian', ro: 'Mongolă' },
      flag: '🇲🇳',
      thankYou: 'Баярлалаа (Bayarlalaa)',
      thankYouPhonetic: '/bah-yar-lah-lah/',
      welcome: 'Зүгээр (Zugeer)',
      welcomePhonetic: '/zoo-gehr/'
    },
    {
      name: { en: 'Armenian', ro: 'Armeană' },
      flag: '🇦🇲',
      thankYou: 'Շնորհակալություն (Shnorhakalutyun)',
      thankYouPhonetic: '/shnor-hah-kah-loo-tyoon/',
      welcome: 'Խնդրեմ (Khndrem)',
      welcomePhonetic: '/khun-drem/'
    },
    {
      name: { en: 'Georgian', ro: 'Georgiană' },
      flag: '🇬🇪',
      thankYou: 'მადლობა (Madloba)',
      thankYouPhonetic: '/mahd-loh-bah/',
      welcome: 'არაფრის (Arapris)',
      welcomePhonetic: '/ah-rah-pris/'
    },
    {
      name: { en: 'Hebrew', ro: 'Ebraică' },
      flag: '🇮🇱',
      thankYou: 'תודה (Toda)',
      thankYouPhonetic: '/toh-dah/',
      welcome: 'בבקשה (Bevakasha)',
      welcomePhonetic: '/beh-vah-kah-shah/'
    },
    {
      name: { en: 'Yiddish', ro: 'Idiș' },
      flag: '🌍',
      thankYou: 'אַ דאַנק (A dank)',
      thankYouPhonetic: '/ah dank/',
      welcome: 'ניטאָ פֿאַר וואָס (Nito far vos)',
      welcomePhonetic: '/nee-toh far vos/'
    },
    {
      name: { en: 'Assyrian Neo-Aramaic', ro: 'Neo-aramaică asiriană' },
      flag: '🌍',
      thankYou: 'Basima',
      thankYouPhonetic: '/bah-see-mah/',
      welcome: 'La shula',
      welcomePhonetic: '/lah shoo-lah/'
    },
    {
      name: { en: 'Quechua', ro: 'Quechua' },
      flag: '🇵🇪',
      thankYou: 'Sulpayki',
      thankYouPhonetic: '/sool-pie-kee/',
      welcome: 'Mana imapas',
      welcomePhonetic: '/mah-nah ee-mah-pas/'
    },
    {
      name: { en: 'Aymara', ro: 'Aymara' },
      flag: '🇧🇴',
      thankYou: 'Yuspagara',
      thankYouPhonetic: '/yoos-pah-gah-rah/',
      welcome: 'Janiw kunasa',
      welcomePhonetic: '/hah-neew koo-nah-sah/'
    },
    {
      name: { en: 'Guarani', ro: 'Guarani' },
      flag: '🇵🇾',
      thankYou: 'Aguyje',
      thankYouPhonetic: '/ah-gwee-jeh/',
      welcome: 'Mbaʼevére',
      welcomePhonetic: '/m-bah-eh-veh-reh/'
    },
    {
      name: { en: 'Nahuatl', ro: 'Nahuatl' },
      flag: '🇲🇽',
      thankYou: 'Tlazohcamati',
      thankYouPhonetic: '/tlah-soh-kah-mah-tee/',
      welcome: 'Ahmitla',
      welcomePhonetic: '/ah-meet-lah/'
    },
    {
      name: { en: 'Maya/Yucatec', ro: 'Maya/Yucatecă' },
      flag: '🇲🇽',
      thankYou: 'Dios boʼotik',
      thankYouPhonetic: '/dyos boh-oh-teek/',
      welcome: 'Maʼalob',
      welcomePhonetic: '/mah-ah-lob/'
    },
    {
      name: { en: 'Haitian Creole', ro: 'Creolă haitiană' },
      flag: '🇭🇹',
      thankYou: 'Mèsi',
      thankYouPhonetic: '/meh-see/',
      welcome: 'Pa dekwa',
      welcomePhonetic: '/pah deh-kwa/'
    },
    {
      name: { en: 'Jamaican Patois', ro: 'Patois jamaican' },
      flag: '🇯🇲',
      thankYou: 'Tenkyuh',
      thankYouPhonetic: '/ten-kyuh/',
      welcome: 'Yuh welcome',
      welcomePhonetic: '/yuh wel-kum/'
    },
    {
      name: { en: 'Fijian', ro: 'Fijiană' },
      flag: '🇫🇯',
      thankYou: 'Vinaka',
      thankYouPhonetic: '/vee-nah-kah/',
      welcome: 'Sega na leqa',
      welcomePhonetic: '/seng-ah nah leng-ah/'
    },
    {
      name: { en: 'Samoan', ro: 'Samoană' },
      flag: '🇼🇸',
      thankYou: 'Faʼafetai',
      thankYouPhonetic: '/fah-ah-feh-tie/',
      welcome: 'Leai se mea',
      welcomePhonetic: '/leh-eye seh meh-ah/'
    },
    {
      name: { en: 'Tongan', ro: 'Tongană' },
      flag: '🇹🇴',
      thankYou: 'Mālō',
      thankYouPhonetic: '/mah-loh/',
      welcome: 'ʻIkai ha meʻa',
      welcomePhonetic: '/ee-kai hah meh-ah/'
    },
    {
      name: { en: 'Maori', ro: 'Maori' },
      flag: '🇳🇿',
      thankYou: 'Kia ora',
      thankYouPhonetic: '/kee-ah aw-rah/',
      welcome: 'Kei te pai',
      welcomePhonetic: '/kay teh pie/'
    },
    {
      name: { en: 'Hawaiian', ro: 'Hawaiiană' },
      flag: '🇺🇸',
      thankYou: 'Mahalo',
      thankYouPhonetic: '/mah-hah-loh/',
      welcome: 'Aʻole pilikia',
      welcomePhonetic: '/ow-oh-leh pee-lee-kee-ah/'
    },
    {
      name: { en: 'Tahitian', ro: 'Tahitiană' },
      flag: '🇵🇫',
      thankYou: 'Māuruuru',
      thankYouPhonetic: '/mah-oo-roo-roo/',
      welcome: 'Aita peʼapeʼa',
      welcomePhonetic: '/eye-tah peh-ah-peh-ah/'
    },
    {
      name: { en: 'Chamorro', ro: 'Chamorro' },
      flag: '🇬🇺',
      thankYou: 'Si Yuʼus maʼåseʼ',
      thankYouPhonetic: '/see dzoo-oos mah-ah-seh/',
      welcome: 'Buen probecho',
      welcomePhonetic: '/bwen proh-beh-choh/'
    },
    {
      name: { en: 'Greenlandic/Kalaallisut', ro: 'Groenlandeză/Kalaallisut' },
      flag: '🇬🇱',
      thankYou: 'Qujanaq',
      thankYouPhonetic: '/koo-yah-nak/',
      welcome: 'Ajunngilaq',
      welcomePhonetic: '/ah-yoon-ngee-lak/'
    },
    {
      name: { en: 'Inuktitut', ro: 'Inuktitut' },
      flag: '🇨🇦',
      thankYou: 'ᖁᔭᓐᓇᒦᒃ (Qujannamiik)',
      thankYouPhonetic: '/koo-yan-nah-meek/',
      welcome: 'Ajurnarmat',
      welcomePhonetic: '/ah-yur-nar-mat/'
    },
    {
      name: { en: 'Cherokee', ro: 'Cherokee' },
      flag: '🇺🇸',
      thankYou: 'ᏩᏙ (Wado)',
      thankYouPhonetic: '/wah-doh/',
      welcome: 'Osda',
      welcomePhonetic: '/ohs-dah/'
    },
    {
      name: { en: 'Navajo', ro: 'Navajo' },
      flag: '🇺🇸',
      thankYou: 'Ahéheeʼ',
      thankYouPhonetic: '/ah-heh-heh/',
      welcome: 'Tʼáá íiyisíí',
      welcomePhonetic: '/tah ee-yee-see/'
    },
    {
      name: { en: 'Luxembourgish', ro: 'Luxemburgheză' },
      flag: '🇱🇺',
      thankYou: 'Merci',
      thankYouPhonetic: '/mair-see/',
      welcome: 'Gär geschitt',
      welcomePhonetic: '/gair geh-shit/'
    },
    {
      name: { en: 'Scottish Gaelic', ro: 'Galeză scoțiană' },
      flag: '🏴',
      thankYou: 'Tapadh leat',
      thankYouPhonetic: '/tah-pah let/',
      welcome: 'ʼS e do bheatha',
      welcomePhonetic: '/sheh doh veh-hah/'
    },
    {
      name: { en: 'Cornish', ro: 'Cornică' },
      flag: '🏴',
      thankYou: 'Meur ras',
      thankYouPhonetic: '/myoor raz/',
      welcome: 'Dynnargh',
      welcomePhonetic: '/din-ark/'
    },
    {
      name: { en: 'Breton', ro: 'Bretonă' },
      flag: '🇫🇷',
      thankYou: 'Trugarez',
      thankYouPhonetic: '/troo-gah-rez/',
      welcome: 'Mann ebet',
      welcomePhonetic: '/mahn eh-bet/'
    },
    {
      name: { en: 'Occitan', ro: 'Occitană' },
      flag: '🇫🇷',
      thankYou: 'Mercé',
      thankYouPhonetic: '/mer-seh/',
      welcome: 'De res',
      welcomePhonetic: '/deh res/'
    },
    {
      name: { en: 'Corsican', ro: 'Corsicană' },
      flag: '🇫🇷',
      thankYou: 'À ringrazià ti',
      thankYouPhonetic: '/ah reen-graht-zyah tee/',
      welcome: 'Di nunda',
      welcomePhonetic: '/dee noon-dah/'
    },
    {
      name: { en: 'Sardinian', ro: 'Sardă' },
      flag: '🇮🇹',
      thankYou: 'Gratzias',
      thankYouPhonetic: '/grat-zyas/',
      welcome: 'De nudda',
      welcomePhonetic: '/deh nood-dah/'
    },
    {
      name: { en: 'Sicilian', ro: 'Siciliană' },
      flag: '🇮🇹',
      thankYou: 'Grazzi',
      thankYouPhonetic: '/graht-tsee/',
      welcome: 'Di nenti',
      welcomePhonetic: '/dee nen-tee/'
    },
    {
      name: { en: 'Neapolitan', ro: 'Napolitană' },
      flag: '🇮🇹',
      thankYou: 'Grazzie',
      thankYouPhonetic: '/grat-tsyeh/',
      welcome: 'E niente',
      welcomePhonetic: '/eh nyen-teh/'
    },
    {
      name: { en: 'Venetian', ro: 'Venețiană' },
      flag: '🇮🇹',
      thankYou: 'Grasie',
      thankYouPhonetic: '/grah-zyeh/',
      welcome: 'De gnente',
      welcomePhonetic: '/deh nyehn-teh/'
    },
    {
      name: { en: 'Lombard', ro: 'Lombardă' },
      flag: '🇮🇹',
      thankYou: 'Grazia',
      thankYouPhonetic: '/grah-tsyah/',
      welcome: 'De nagott',
      welcomePhonetic: '/deh nah-got/'
    },
    {
      name: { en: 'Romansh', ro: 'Romanșă' },
      flag: '🇨🇭',
      thankYou: 'Grazia fitg',
      thankYouPhonetic: '/grah-tsya feech/',
      welcome: 'Anzi',
      welcomePhonetic: '/ahn-tsee/'
    },
    {
      name: { en: 'Frisian', ro: 'Frizonă' },
      flag: '🇳🇱',
      thankYou: 'Tankewol',
      thankYouPhonetic: '/tahn-kuh-vol/',
      welcome: 'Gjin tank',
      welcomePhonetic: '/gyeen tahnk/'
    },
    {
      name: { en: 'Low German', ro: 'Germană joasă' },
      flag: '🇩🇪',
      thankYou: 'Dank di',
      thankYouPhonetic: '/dahnk dee/',
      welcome: 'Gern daan',
      welcomePhonetic: '/gern dahn/'
    },
    {
      name: { en: 'Bavarian', ro: 'Bavareză' },
      flag: '🇩🇪',
      thankYou: 'Vergeltʼs Gott',
      thankYouPhonetic: '/fer-gelts got/',
      welcome: 'Gern gschegn',
      welcomePhonetic: '/gern gshehgn/'
    },
    {
      name: { en: 'Alemannic/Swiss German', ro: 'Alemannică/Germană elvețiană' },
      flag: '🇨🇭',
      thankYou: 'Merci vilmal',
      thankYouPhonetic: '/mer-see feel-mahl/',
      welcome: 'Gärn gscheh',
      welcomePhonetic: '/gairn gsheh/'
    },
    {
      name: { en: 'Faroese', ro: 'Feroeză' },
      flag: '🇫🇴',
      thankYou: 'Takk fyri',
      thankYouPhonetic: '/tahk fee-ree/',
      welcome: 'Ver so god',
      welcomePhonetic: '/ver soh goh/'
    },
    {
      name: { en: 'Northern Sami', ro: 'Sami de nord' },
      flag: '🇳🇴',
      thankYou: 'Giitu',
      thankYouPhonetic: '/gee-too/',
      welcome: 'Leage buorre',
      welcomePhonetic: '/leh-ah-geh boo-or-reh/'
    },
    {
      name: { en: 'Romani', ro: 'Romani' },
      flag: '🌍',
      thankYou: 'Nais tuke',
      thankYouPhonetic: '/nice too-keh/',
      welcome: 'Chi mangel',
      welcomePhonetic: '/chee man-gel/'
    },
    {
      name: { en: 'Esperanto', ro: 'Esperanto' },
      flag: '🌍',
      thankYou: 'Dankon',
      thankYouPhonetic: '/dahn-kon/',
      welcome: 'Nedankinde',
      welcomePhonetic: '/neh-dahn-kin-deh/'
    },
    {
      name: { en: 'Latin', ro: 'Latină' },
      flag: '🇻🇦',
      thankYou: 'Gratias tibi ago',
      thankYouPhonetic: '/grah-tee-ahs tee-bee ah-go/',
      welcome: 'Libenter',
      welcomePhonetic: '/lee-ben-ter/'
    }
  ];

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = languages;
    return;
  }

  root.THANK_YOU_LANGUAGES = languages;
})(typeof globalThis !== 'undefined' ? globalThis : this);
