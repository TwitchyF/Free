const gpt = require('./ai-gpt.js');

const languageList = {
  "ID": "Indonesia",
  "EN": "Inggris",
  "FR": "Perancis",
  "ES": "Spanyol",
  "DE": "Jerman",
  "ZH": "Tiongkok",
  "JA": "Jepang",
  "PT": "Portugis",
  "RU": "Rusia",
  "IT": "Italia",
  "AR": "Arab",
  "KO": "Korea",
  "TR": "Turki",
  "HI": "Hindi",
  "VI": "Vietnam",
  "PL": "Polandia",
  "UK": "Ukraina",
  "TH": "Thailand",
  "MS": "Melayu",
  "FA": "Persia",
  "SW": "Swahili",
  "NL": "Belanda",
  "BG": "Bulgaria",
  "CS": "Ceko",
  "DA": "Denmark",
  "FI": "Finlandia",
  "HU": "Hungaria",
  "EL": "Yunani",
  "HE": "Ibrani",
  "RO": "Rumania",
  "SK": "Slovakia",
  "SV": "Swedia",
  "CA": "Catalan",
  "HR": "Kroasia",
  "SR": "Serbia",
  "LT": "Lithuania",
  "LV": "Latvia",
  "SL": "Slovenia",
  "ET": "Estonia",
  "EU": "Basque",
  "GA": "Irlandia",
  "GL": "Galicia",
  "KY": "Kirgistan",
  "MK": "Makedonia",
  "AZ": "Azerbaijan",
  "UZ": "Uzbekistan",
  "KA": "Georgia",
  "AM": "Armenia",
  "SW": "Swahili",
  "BN": "Bengali",
  "GU": "Gujarat",
  "MR": "Marathi",
  "TA": "Tamil",
  "TE": "Telugu",
  "UR": "Urdu"
}


async function get(text, lang) {
    try {
      if (!lang) return languageList;
        const uppercaseLang = lang.toUpperCase();
        if (!(uppercaseLang in languageList)) {
          return `Waduh *${lang}* belum ada, saat ini hanya :\n`+Object.entries(languageList).map(([key, value]) => `*${key} :* ${value}`).join(',\n');
        }

        const query = `aku ingin anda menerjemahkan teks di bawah ke bahasa ${languageList[uppercaseLang]}

Text: ${text}

note: aku ingin anda memberikan teks terjemahan tanpa tambahan teks apapun.`;

        const result = await gpt.get('gpt-4',query);
        return result.gpt;
    } catch (error) {
        return error;
    }
}

module.exports = {
    get
};