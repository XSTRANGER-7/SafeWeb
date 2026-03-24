export const STORAGE_KEY = 'safeweb-language'

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English', nativeLabel: 'English', locale: 'en-IN', htmlLang: 'en' },
  { value: 'hi', label: 'Hindi', nativeLabel: 'हिंदी', locale: 'hi-IN-u-nu-deva', htmlLang: 'hi' },
  { value: 'od', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ', locale: 'or-IN-u-nu-orya', htmlLang: 'or' }
]

const LANGUAGE_ALIASES = {
  en: 'en',
  english: 'en',
  hi: 'hi',
  hindi: 'hi',
  od: 'od',
  or: 'od',
  odia: 'od',
  odiya: 'od'
}

const PHRASES = {}

export function addPhrase(english, hi, od) {
  PHRASES[english] = { hi, od }
}

addPhrase('Language', 'भाषा', 'ଭାଷା')
addPhrase('English', 'अंग्रेज़ी', 'ଇଂରାଜୀ')
addPhrase('Hindi', 'हिंदी', 'ହିନ୍ଦୀ')
addPhrase('Odia', 'ओड़िया', 'ଓଡ଼ିଆ')
addPhrase('Home', 'होम', 'ମୁଖ୍ୟପୃଷ୍ଠା')
addPhrase('Features', 'फ़ीचर्स', 'ବିଶେଷତା')
addPhrase('Analytics', 'एनालिटिक्स', 'ବିଶ୍ଳେଷଣ')
addPhrase('Docs', 'डॉक्स', 'ଦଳିଲ')
addPhrase('Documentation', 'दस्तावेज़', 'ଦଳିଲ')
addPhrase('Login', 'लॉगिन', 'ଲଗଇନ୍')
addPhrase('Logout', 'लॉगआउट', 'ଲଗଆଉଟ୍')
addPhrase('Dashboard', 'डैशबोर्ड', 'ଡ୍ୟାଶବୋର୍ଡ')
addPhrase('About', 'परिचय', 'ପରିଚୟ')
addPhrase('Contact', 'संपर्क', 'ଯୋଗାଯୋଗ')
addPhrase('Privacy Policy', 'गोपनीयता नीति', 'ଗୋପନୀୟତା ନୀତି')
addPhrase('Notifications', 'सूचनाएँ', 'ବିଜ୍ଞପ୍ତି')
addPhrase('Mark all as read', 'सभी को पढ़ा हुआ चिह्नित करें', 'ସବୁକୁ ପଢ଼ା ହୋଇଛି ବୋଲି ଚିହ୍ନଟ କରନ୍ତୁ')
addPhrase('Loading...', 'लोड हो रहा है...', 'ଲୋଡ୍ ହେଉଛି...')
addPhrase('No notifications', 'कोई सूचना नहीं', 'କୌଣସି ବିଜ୍ଞପ୍ତି ନାହିଁ')
addPhrase('No unread notifications', 'कोई अपठित सूचना नहीं', 'କୌଣସି ଅପଢ଼ିତ ବିଜ୍ଞପ୍ତି ନାହିଁ')
addPhrase('Show All', 'सब दिखाएँ', 'ସବୁ ଦେଖାନ୍ତୁ')
addPhrase('Show Unread Only', 'केवल अपठित दिखाएँ', 'କେବଳ ଅପଢ଼ିତ ଦେଖାନ୍ତୁ')
addPhrase('read', 'पढ़े गए', 'ପଢ଼ାଯାଇଛି')
addPhrase('Read', 'पढ़ा गया', 'ପଢ଼ାଯାଇଛି')
addPhrase('unread', 'अपठित', 'ଅପଢ଼ିତ')
addPhrase('New', 'नया', 'ନୂଆ')
addPhrase('Government Logo', 'सरकारी लोगो', 'ସରକାରୀ ଲୋଗୋ')
addPhrase('Copyright', 'कॉपीराइट', 'କପିରାଇଟ୍')
addPhrase('All rights reserved.', 'सर्वाधिकार सुरक्षित।', 'ସମସ୍ତ ଅଧିକାର ସଂରକ୍ଷିତ।')
addPhrase('Profile menu', 'प्रोफ़ाइल मेनू', 'ପ୍ରୋଫାଇଲ୍ ମେନୁ')
addPhrase('No contact info', 'कोई संपर्क जानकारी नहीं', 'କୌଣସି ଯୋଗାଯୋଗ ସୂଚନା ନାହିଁ')
addPhrase('Logout failed. Please try again.', 'लॉगआउट विफल हुआ। कृपया फिर से प्रयास करें।', 'ଲଗଆଉଟ୍ ବିଫଳ ହେଲା। ଦୟାକରି ପୁଣିଥରେ ଚେଷ୍ଟା କରନ୍ତୁ।')
addPhrase('Secure. Report. Protect.', 'सुरक्षित रहें। रिपोर्ट करें। सुरक्षा करें।', 'ସୁରକ୍ଷିତ ରୁହନ୍ତୁ। ରିପୋର୍ଟ କରନ୍ତୁ। ସୁରକ୍ଷା କରନ୍ତୁ।')
addPhrase("Hello! I'm", 'नमस्ते! मैं हूँ', 'ନମସ୍କାର! ମୁଁ')
addPhrase('Your Virtual Assistant', 'आपका वर्चुअल सहायक', 'ଆପଣଙ୍କ ଭର୍ଚୁଆଲ୍ ସହାୟକ')
addPhrase("I'm Mr. OP, your virtual agent powered by Odisha Police. I'm here to help you access multiple services and support systems that will assist you in times of need.", 'मैं श्री ओपी हूँ, ओडिशा पुलिस द्वारा संचालित आपका वर्चुअल एजेंट। आवश्यकता के समय कई सेवाओं और सहायता प्रणालियों तक पहुँचने में आपकी मदद के लिए मैं यहाँ हूँ।', 'ମୁଁ ଶ୍ରୀ ଓପି, ଓଡିଶା ପୋଲିସ୍ ଦ୍ୱାରା ପ୍ରଚାଳିତ ଆପଣଙ୍କ ଭର୍ଚୁଆଲ୍ ଏଜେଣ୍ଟ। ଆପଣଙ୍କ ଆବଶ୍ୟକ ସମୟରେ ବିଭିନ୍ନ ସେବା ଓ ସହାୟତା ବ୍ୟବସ୍ଥାକୁ ପହଞ୍ଚିବାରେ ସହାଯ୍ୟ କରିବା ପାଇଁ ମୁଁ ଏଠାରେ ଅଛି।')
addPhrase('Phishing Detection', 'फ़िशिंग जाँच', 'ଫିଶିଙ୍ଗ ଚିହ୍ନଟ')
addPhrase('Women Safety', 'महिला सुरक्षा', 'ମହିଳା ସୁରକ୍ଷା')
addPhrase('Cyber Fraud', 'साइबर धोखाधड़ी', 'ସାଇବର ଠକେଇ')
addPhrase('Detect and report phishing URLs to protect yourself and others', 'अपने और दूसरों की सुरक्षा के लिए फ़िशिंग यूआरएल पहचानें और रिपोर्ट करें', 'ନିଜେ ଓ ଅନ୍ୟମାନଙ୍କୁ ସୁରକ୍ଷିତ ରଖିବା ପାଇଁ ଫିଶିଙ୍ଗ URL ଚିହ୍ନଟ କରି ରିପୋର୍ଟ କରନ୍ତୁ')
addPhrase('Report harassment incidents and get immediate support', 'उत्पीड़न की घटनाओं की रिपोर्ट करें और तुरंत सहायता प्राप्त करें', 'ଉତ୍ପୀଡନ ଘଟଣା ରିପୋର୍ଟ କରନ୍ତୁ ଏବଂ ତୁରନ୍ତ ସହାୟତା ପାଆନ୍ତୁ')
addPhrase('File cyber fraud complaints and track your case progress', 'साइबर धोखाधड़ी की शिकायत दर्ज करें और अपने केस की प्रगति ट्रैक करें', 'ସାଇବର ଠକେଇ ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ ଏବଂ ମାମଲାର ପ୍ରଗତି ଟ୍ରାକ୍ କରନ୍ତୁ')
addPhrase('Odisha Police', 'ओडिशा पुलिस', 'ଓଡିଶା ପୋଲିସ')
addPhrase('Reserve Bank of India', 'भारतीय रिज़र्व बैंक', 'ଭାରତୀୟ ରିଜର୍ଭ ବ୍ୟାଙ୍କ')
addPhrase('Docs placeholder - integration guides and API documentation will be here.', 'डॉक्स प्लेसहोल्डर - एकीकरण गाइड और एपीआई दस्तावेज़ यहाँ होंगे।', 'ଡକ୍ସ ସ୍ଥାନଧାରକ - ଇଣ୍ଟିଗ୍ରେସନ୍ ଗାଇଡ୍ ଓ API ଦଳିଲଗୁଡ଼ିକ ଏଠାରେ ରହିବ।')
addPhrase('Phishing URL Detection', 'फ़िशिंग URL जाँच', 'ଫିଶିଙ୍ଗ URL ଚିହ୍ନଟ')
addPhrase("Protect yourself from malicious websites. Enter a URL to check if it's safe.", 'दुष्ट वेबसाइटों से स्वयं को सुरक्षित रखें। यह सुरक्षित है या नहीं, जाँचने के लिए URL दर्ज करें।', 'କୁସଙ୍କଳ୍ପୀ ୱେବସାଇଟ୍‌ରୁ ନିଜକୁ ସୁରକ୍ଷିତ ରଖନ୍ତୁ। ସୁରକ୍ଷିତ କି ନୁହେଁ ଯାଞ୍ଚ ପାଇଁ URL ଦିଅନ୍ତୁ।')
addPhrase('Enter URL to Scan', 'स्कैन के लिए URL दर्ज करें', 'ସ୍କାନ ପାଇଁ URL ଦିଅନ୍ତୁ')
addPhrase('Scan URL', 'URL स्कैन करें', 'URL ସ୍କାନ କରନ୍ତୁ')
addPhrase('Scanning...', 'स्कैन हो रहा है...', 'ସ୍କାନ ହେଉଛି...')
addPhrase('Analyzing URL for security threats...', 'सुरक्षा खतरों के लिए URL का विश्लेषण किया जा रहा है...', 'ସୁରକ୍ଷା ଝୁମୁରିକା ପାଇଁ URL ବିଶ୍ଳେଷଣ ହେଉଛି...')
addPhrase('Final Verdict', 'अंतिम निर्णय', 'ଅନ୍ତିମ ନିଷ୍କର୍ଷ')
addPhrase('Confidence', 'विश्वसनीयता', 'ନିଶ୍ଚିତତା')
addPhrase('Signals & Enrichment Data', 'संकेत और समृद्ध डेटा', 'ସିଗ୍ନାଲ୍ ଓ ସହାୟକ ତଥ୍ୟ')
addPhrase('Domain', 'डोमेन', 'ଡୋମେନ୍')
addPhrase('SSL Days Remaining', 'शेष SSL दिन', 'ଅବଶିଷ୍ଟ SSL ଦିନ')
addPhrase('SSL Valid From', 'SSL वैध आरंभ', 'SSL ବୈଧ ଆରମ୍ଭ')
addPhrase('SSL Valid To', 'SSL वैध समाप्ति', 'SSL ବୈଧ ସମାପ୍ତି')
addPhrase('External Links', 'बाहरी लिंक', 'ବାହ୍ୟ ଲିଙ୍କ')
addPhrase('Top External Domains', 'शीर्ष बाहरी डोमेन', 'ଶୀର୍ଷ ବାହ୍ୟ ଡୋମେନ୍')
addPhrase('Tips to Stay Safe', 'सुरक्षित रहने के सुझाव', 'ସୁରକ୍ଷିତ ରହିବା ପାଇଁ ପରାମର୍ଶ')
addPhrase('Always check the URL carefully before entering credentials', 'क्रेडेंशियल दर्ज करने से पहले URL को ध्यान से जाँचें', 'କ୍ରେଡେନ୍ସିଆଲ୍ ଦେବା ପୂର୍ବରୁ URL କୁ ସତର୍କତାର ସହିତ ଯାଞ୍ଚ କରନ୍ତୁ')
addPhrase('Look for HTTPS and a valid SSL certificate', 'HTTPS और वैध SSL प्रमाणपत्र देखें', 'HTTPS ଏବଂ ବୈଧ SSL ସର୍ଟିଫିକେଟ୍ ଯାଞ୍ଚ କରନ୍ତୁ')
addPhrase('Be cautious of URLs with misspellings or unusual domains', 'गलत वर्तनी या असामान्य डोमेन वाले URL से सावधान रहें', 'ଭୁଲ ଶବ୍ଦଲିପି କିମ୍ବା ଅସାଧାରଣ ଡୋମେନ୍ ଥିବା URL ଠାରୁ ସତର୍କ ରୁହନ୍ତୁ')
addPhrase('Never click on suspicious links in emails or messages', 'ईमेल या संदेशों में संदिग्ध लिंक पर कभी क्लिक न करें', 'ଇମେଲ୍ କିମ୍ବା ସନ୍ଦେଶରେ ସନ୍ଦେହଜନକ ଲିଙ୍କରେ କେବେ କ୍ଲିକ୍ କରନ୍ତୁ ନାହିଁ')
addPhrase('Phishing', 'फ़िशिंग', 'ଫିଶିଙ୍ଗ')
addPhrase('Likely Phishing', 'संभावित फ़िशिंग', 'ସମ୍ଭାବ୍ୟ ଫିଶିଙ୍ଗ')
addPhrase('Safe', 'सुरक्षित', 'ସୁରକ୍ଷିତ')
addPhrase('Women Safety Harassment Report', 'महिला सुरक्षा उत्पीड़न रिपोर्ट', 'ମହିଳା ସୁରକ୍ଷା ଉତ୍ପୀଡନ ରିପୋର୍ଟ')
addPhrase('Report any harassment or safety concern. Your report will be handled with confidentiality.', 'किसी भी उत्पीड़न या सुरक्षा चिंता की रिपोर्ट करें। आपकी रिपोर्ट गोपनीय रूप से संभाली जाएगी।', 'ଯେକୌଣସି ଉତ୍ପୀଡନ କିମ୍ବା ସୁରକ୍ଷା ସମସ୍ୟା ରିପୋର୍ଟ କରନ୍ତୁ। ଆପଣଙ୍କ ରିପୋର୍ଟ ଗୋପନୀୟତା ସହିତ ହାତଲିଆଯିବ।')
addPhrase('Report Submitted Successfully', 'रिपोर्ट सफलतापूर्वक जमा हुई', 'ରିପୋର୍ଟ ସଫଳତାର ସହିତ ଜମା ହେଲା')
addPhrase('Your report has been received. Authorities will be notified and appropriate action will be taken.', 'आपकी रिपोर्ट प्राप्त हो गई है। संबंधित अधिकारियों को सूचित किया जाएगा और उचित कार्रवाई की जाएगी।', 'ଆପଣଙ୍କ ରିପୋର୍ଟ ମିଳିଗଲା। ସମ୍ବନ୍ଧିତ କର୍ତ୍ତୃପକ୍ଷଙ୍କୁ ଜଣାଯିବ ଏବଂ ଯଥାଯଥ କାର୍ଯ୍ୟ କରାଯିବ।')
addPhrase('Type of Incident', 'घटना का प्रकार', 'ଘଟଣାର ପ୍ରକାର')
addPhrase('Select incident type', 'घटना का प्रकार चुनें', 'ଘଟଣାର ପ୍ରକାର ବାଛନ୍ତୁ')
addPhrase('Verbal Harassment', 'मौखिक उत्पीड़न', 'ମୌଖିକ ଉତ୍ପୀଡନ')
addPhrase('Physical Harassment', 'शारीरिक उत्पीड़न', 'ଶାରୀରିକ ଉତ୍ପୀଡନ')
addPhrase('Stalking', 'पीछा करना', 'ଅନୁସରଣ')
addPhrase('Cyber Harassment', 'साइबर उत्पीड़न', 'ସାଇବର ଉତ୍ପୀଡନ')
addPhrase('Other', 'अन्य', 'ଅନ୍ୟାନ୍ୟ')
addPhrase('Date', 'तारीख', 'ତାରିଖ')
addPhrase('Time', 'समय', 'ସମୟ')
addPhrase('Location', 'स्थान', 'ସ୍ଥାନ')
addPhrase('Description', 'विवरण', 'ବିବରଣୀ')
addPhrase('Contact Number (Optional)', 'संपर्क नंबर (वैकल्पिक)', 'ଯୋଗାଯୋଗ ନମ୍ବର (ଐଚ୍ଛିକ)')
addPhrase('Enter location where incident occurred', 'घटना का स्थान दर्ज करें', 'ଘଟଣା ଘଟିଥିବା ସ୍ଥାନ ଦିଅନ୍ତୁ')
addPhrase('Provide detailed description of the incident', 'घटना का विस्तृत विवरण दें', 'ଘଟଣାର ବିସ୍ତୃତ ବିବରଣୀ ଦିଅନ୍ତୁ')
addPhrase('Your contact number for follow-up', 'अनुवर्ती कार्रवाई के लिए आपका संपर्क नंबर', 'ପରବର୍ତ୍ତୀ ସମ୍ପର୍କ ପାଇଁ ଆପଣଙ୍କ ନମ୍ବର')
addPhrase('Submit Report', 'रिपोर्ट जमा करें', 'ରିପୋର୍ଟ ଦାଖଲ କରନ୍ତୁ')
addPhrase('Emergency Contacts', 'आपातकालीन संपर्क', 'ଜରୁରୀ ସମ୍ପର୍କ')
addPhrase('Women Helpline', 'महिला हेल्पलाइन', 'ମହିଳା ହେଲ୍ପଲାଇନ୍')
addPhrase('Emergency', 'आपातकालीन', 'ଜରୁରୀ')
addPhrase('Create Your Account', 'अपना खाता बनाएँ', 'ଆପଣଙ୍କ ଖାତା ସୃଷ୍ଟି କରନ୍ତୁ')
addPhrase('Sign In', 'साइन इन', 'ସାଇନ୍ ଇନ୍')
addPhrase('Use your account credentials or continue with Google.', 'अपने खाते के विवरण का उपयोग करें या Google के साथ जारी रखें।', 'ଆପଣଙ୍କ ଖାତା ସନଦ ବ୍ୟବହାର କରନ୍ତୁ କିମ୍ବା Google ସହିତ ଜାରି ରଖନ୍ତୁ।')
addPhrase('Register with email and password, or continue with Google for a faster setup.', 'ईमेल और पासवर्ड से पंजीकरण करें, या तेज़ सेटअप के लिए Google से जारी रखें।', 'ଇମେଲ୍ ଓ ପାସୱାର୍ଡ ସହ ପଞ୍ଜିକରଣ କରନ୍ତୁ, କିମ୍ବା ଶୀଘ୍ର ସେଟଅପ୍ ପାଇଁ Google ସହିତ ଜାରି ରଖନ୍ତୁ।')
addPhrase('User Access', 'उपयोगकर्ता प्रवेश', 'ଉପଯୋଗକର୍ତ୍ତା ପ୍ରବେଶ')
addPhrase('Sign in securely, or register a new user account in a few quick steps.', 'सुरक्षित रूप से साइन इन करें, या कुछ आसान चरणों में नया उपयोगकर्ता खाता बनाएँ।', 'ସୁରକ୍ଷିତ ଭାବରେ ସାଇନ୍ ଇନ୍ କରନ୍ତୁ, କିମ୍ବା କିଛି ସହଜ ପଦକ୍ଷେପରେ ନୂତନ ଖାତା ସୃଷ୍ଟି କରନ୍ତୁ।')
addPhrase('Email sign-in for returning users', 'वापसी करने वाले उपयोगकर्ताओं के लिए ईमेल साइन-इन', 'ପୁନର୍ବାର ଆସୁଥିବା ଉପଯୋଗକର୍ତ୍ତାଙ୍କ ପାଇଁ ଇମେଲ୍ ସାଇନ୍-ଇନ୍')
addPhrase('Google sign-in with one tap access', 'एक टैप में Google साइन-इन', 'ଏକ ଟ୍ୟାପରେ Google ସାଇନ୍-ଇନ୍')
addPhrase('New users can register directly from this page', 'नए उपयोगकर्ता इसी पेज से सीधे पंजीकरण कर सकते हैं', 'ନୂତନ ଉପଯୋଗକର୍ତ୍ତାମାନେ ଏହି ପୃଷ୍ଠାରୁ ସିଧାସଳଖ ପଞ୍ଜିକରଣ କରିପାରିବେ')
addPhrase('Full Name', 'पूरा नाम', 'ପୂର୍ଣ୍ଣ ନାମ')
addPhrase('Enter your full name', 'अपना पूरा नाम दर्ज करें', 'ଆପଣଙ୍କ ପୂର୍ଣ୍ଣ ନାମ ଲେଖନ୍ତୁ')
addPhrase('Email', 'ईमेल', 'ଇମେଲ୍')
addPhrase('Password', 'पासवर्ड', 'ପାସୱାର୍ଡ')
addPhrase('Confirm Password', 'पासवर्ड की पुष्टि करें', 'ପାସୱାର୍ଡ ନିଶ୍ଚିତ କରନ୍ତୁ')
addPhrase('Create a password', 'पासवर्ड बनाएँ', 'ପାସୱାର୍ଡ ସୃଷ୍ଟି କରନ୍ତୁ')
addPhrase('Enter your password', 'अपना पासवर्ड दर्ज करें', 'ଆପଣଙ୍କ ପାସୱାର୍ଡ ଦିଅନ୍ତୁ')
addPhrase('Confirm your password', 'अपना पासवर्ड पुष्टि करें', 'ଆପଣଙ୍କ ପାସୱାର୍ଡ ନିଶ୍ଚିତ କରନ୍ତୁ')
addPhrase('Creating account...', 'खाता बनाया जा रहा है...', 'ଖାତା ସୃଷ୍ଟି ହେଉଛି...')
addPhrase('Signing in...', 'साइन इन हो रहा है...', 'ସାଇନ୍ ଇନ୍ ହେଉଛି...')
addPhrase('Create Account', 'खाता बनाएँ', 'ଖାତା ସୃଷ୍ଟି କରନ୍ତୁ')
addPhrase('Sign In with Email', 'ईमेल से साइन इन करें', 'ଇମେଲ୍ ସହିତ ସାଇନ୍ ଇନ୍ କରନ୍ତୁ')
addPhrase('Or continue', 'या जारी रखें', 'କିମ୍ବା ଜାରି ରଖନ୍ତୁ')
addPhrase('Please wait...', 'कृपया प्रतीक्षा करें...', 'ଦୟାକରି ଅପେକ୍ଷା କରନ୍ତୁ...')
addPhrase('Continue with Google', 'Google के साथ जारी रखें', 'Google ସହିତ ଜାରି ରଖନ୍ତୁ')
addPhrase('Already have an account?', 'क्या पहले से खाता है?', 'ଆଗରୁ ଖାତା ଅଛି କି?')
addPhrase('New user?', 'नए उपयोगकर्ता?', 'ନୂତନ ଉପଯୋଗକର୍ତ୍ତା?')
addPhrase('Back to Sign In', 'साइन इन पर वापस जाएँ', 'ସାଇନ୍ ଇନ୍ କୁ ଫେରନ୍ତୁ')
addPhrase('Register Now', 'अभी पंजीकरण करें', 'ଏବେ ପଞ୍ଜିକରଣ କରନ୍ତୁ')
addPhrase('Official login', 'आधिकारिक लॉगिन', 'ଆଧିକାରିକ ଲଗଇନ୍')
addPhrase('Police Login', 'पुलिस लॉगिन', 'ପୋଲିସ ଲଗଇନ୍')
addPhrase('Bank Login', 'बैंक लॉगिन', 'ବ୍ୟାଙ୍କ ଲଗଇନ୍')
addPhrase('Official Login', 'आधिकारिक लॉगिन', 'ଆଧିକାରିକ ଲଗଇନ୍')
addPhrase('Secure access for authorized personnel', 'अधिकृत कर्मियों के लिए सुरक्षित प्रवेश', 'ଅନୁମୋଦିତ କର୍ମଚାରୀଙ୍କ ପାଇଁ ସୁରକ୍ଷିତ ପ୍ରବେଶ')
addPhrase('Secure & Encrypted', 'सुरक्षित और एन्क्रिप्टेड', 'ସୁରକ୍ଷିତ ଏବଂ ଏନ୍କ୍ରିପ୍ଟେଡ୍')
addPhrase('Official Credentials', 'आधिकारिक प्रमाण-पत्र', 'ଆଧିକାରିକ ସନଦ')
addPhrase('Fast & Reliable', 'तेज़ और भरोसेमंद', 'ତ୍ୱରିତ ଏବଂ ନିର୍ଭରଯୋଗ୍ୟ')
addPhrase('Official access', 'आधिकारिक प्रवेश', 'ଆଧିକାରିକ ପ୍ରବେଶ')
addPhrase('Official Email Address', 'आधिकारिक ईमेल पता', 'ଆଧିକାରିକ ଇମେଲ୍ ଠିକଣା')
addPhrase('Switch login type', 'लॉगिन प्रकार बदलें', 'ଲଗଇନ୍ ପ୍ରକାର ବଦଳାନ୍ତୁ')
addPhrase('User Login', 'उपयोगकर्ता लॉगिन', 'ଉପଯୋଗକର୍ତ୍ତା ଲଗଇନ୍')
addPhrase('Admin Panel', 'एडमिन पैनल', 'ଆଡମିନ୍ ପ୍ୟାନେଲ୍')
addPhrase('Manage Police and Bank Official Accounts', 'पुलिस और बैंक के आधिकारिक खातों का प्रबंधन करें', 'ପୋଲିସ ଓ ବ୍ୟାଙ୍କ ଆଧିକାରିକ ଖାତା ପରିଚାଳନା କରନ୍ତୁ')
addPhrase('Create New Official Account', 'नया आधिकारिक खाता बनाएँ', 'ନୂତନ ଆଧିକାରିକ ଖାତା ସୃଷ୍ଟି କରନ୍ତୁ')
addPhrase('Official Name', 'अधिकारी का नाम', 'କର୍ମଚାରୀଙ୍କ ନାମ')
addPhrase('Enter official name', 'अधिकारी का नाम दर्ज करें', 'କର୍ମଚାରୀଙ୍କ ନାମ ଲେଖନ୍ତୁ')
addPhrase('Official ID', 'आधिकारिक आईडी', 'ଆଧିକାରିକ ID')
addPhrase('Email Address', 'ईमेल पता', 'ଇମେଲ୍ ଠିକଣା')
addPhrase('Minimum 6 characters', 'कम से कम 6 अक्षर', 'କମ୍ ସେ କମ୍ 6 ଅକ୍ଷର')
addPhrase('Password must be at least 6 characters long', 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए', 'ପାସୱାର୍ଡ କମ୍ ସେ କମ୍ 6 ଅକ୍ଷର ହେବା ଉଚିତ୍')
addPhrase('Create Official Account', 'आधिकारिक खाता बनाएँ', 'ଆଧିକାରିକ ଖାତା ସୃଷ୍ଟି କରନ୍ତୁ')
addPhrase('Existing Officials', 'मौजूदा अधिकारी', 'ବର୍ତ୍ତମାନ ଅଧିକାରୀ')
addPhrase('Loading officials...', 'अधिकारियों को लोड किया जा रहा है...', 'ଅଧିକାରୀମାନଙ୍କୁ ଲୋଡ୍ କରାଯାଉଛି...')
addPhrase('Refresh', 'रीफ़्रेश', 'ରିଫ୍ରେଶ')
addPhrase('Personal Dashboard', 'व्यक्तिगत डैशबोर्ड', 'ବ୍ୟକ୍ତିଗତ ଡ୍ୟାଶବୋର୍ଡ')
addPhrase('Today', 'आज', 'ଆଜି')
addPhrase('Resolution Rate', 'समाधान दर', 'ସମାଧାନ ହାର')
addPhrase('Across all submitted applications', 'सभी जमा आवेदनों में', 'ସମସ୍ତ ଦାଖଲ ଆବେଦନରେ')
addPhrase('Quick Actions', 'त्वरित कार्य', 'ଦ୍ରୁତ କାର୍ଯ୍ୟ')
addPhrase('File New Complaint', 'नई शिकायत दर्ज करें', 'ନୂତନ ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ')
addPhrase('Track Applications', 'आवेदन ट्रैक करें', 'ଆବେଦନ ଟ୍ରାକ୍ କରନ୍ତୁ')
addPhrase('Check Suspicious Link', 'संदिग्ध लिंक जाँचें', 'ସନ୍ଦେହଜନକ ଲିଙ୍କ ଯାଞ୍ଚ କରନ୍ତୁ')
addPhrase('Women Safety Support', 'महिला सुरक्षा सहायता', 'ମହିଳା ସୁରକ୍ଷା ସହାୟତା')
addPhrase('Start a fresh complaint and upload evidence securely.', 'नई शिकायत शुरू करें और प्रमाण सुरक्षित रूप से अपलोड करें।', 'ନୂତନ ଅଭିଯୋଗ ଆରମ୍ଭ କରନ୍ତୁ ଏବଂ ପ୍ରମାଣ ସୁରକ୍ଷିତ ଭାବରେ ଅପଲୋଡ୍ କରନ୍ତୁ।')
addPhrase('Review all submitted complaints and their live status.', 'सभी जमा शिकायतों और उनकी लाइव स्थिति की समीक्षा करें।', 'ସମସ୍ତ ଦାଖଲ ଅଭିଯୋଗ ଓ ସେମାନଙ୍କର ଲାଇଭ୍ ସ୍ଥିତି ଯାଞ୍ଚ କରନ୍ତୁ।')
addPhrase('Scan a URL before opening it or sharing details.', 'किसी URL को खोलने या विवरण साझा करने से पहले स्कैन करें।', 'କୌଣସି URL ଖୋଲିବା କିମ୍ବା ବିବରଣୀ ଶେୟାର କରିବା ପୂର୍ବରୁ ସ୍କାନ କରନ୍ତୁ।')
addPhrase('Open safety tools, alerts, and emergency resources.', 'सुरक्षा उपकरण, अलर्ट और आपातकालीन संसाधन खोलें।', 'ସୁରକ୍ଷା ସାଧନ, ସତର୍କତା ଓ ଜରୁରୀ ସମ୍ବଲ ଖୋଲନ୍ତୁ।')
addPhrase('Pending', 'लंबित', 'ଲମ୍ବିତ')
addPhrase('In Process', 'प्रक्रिया में', 'ପ୍ରକ୍ରିୟାରେ')
addPhrase('Funds Frozen', 'धन रोका गया', 'ଧନ ଫ୍ରିଜ୍ କରାଯାଇଛି')
addPhrase('Refunded', 'रिफंड किया गया', 'ଫେରତ ଦିଆଯାଇଛି')
addPhrase('Closed', 'बंद', 'ବନ୍ଦ')
addPhrase('Resolved', 'सुलझा हुआ', 'ସମାଧାନ ହୋଇଛି')
addPhrase('Total Cases', 'कुल मामले', 'ମୋଟ ମାମଲା')
addPhrase('Solved Cases', 'सुलझे मामले', 'ସମାଧାନ ହୋଇଥିବା ମାମଲା')
addPhrase("Today's Cases", 'आज के मामले', 'ଆଜିର ମାମଲା')
addPhrase('Total Amount Lost', 'कुल खोई गई राशि', 'ମୋଟ ହାରାଇଥିବା ରାଶି')
addPhrase('Cases by Status', 'स्थिति के अनुसार मामले', 'ସ୍ଥିତି ଅନୁସାରେ ମାମଲା')
addPhrase('Top 10 Fraud Types', 'शीर्ष 10 धोखाधड़ी प्रकार', 'ଶୀର୍ଷ 10 ଠକେଇ ପ୍ରକାର')
addPhrase('Daily Cases Trend (Last 30 Days)', 'दैनिक मामलों की प्रवृत्ति (पिछले 30 दिन)', 'ଦୈନିକ ମାମଲା ପ୍ରବୃତ୍ତି (ଶେଷ 30 ଦିନ)')
addPhrase('Monthly Trend (Last 12 Months)', 'मासिक प्रवृत्ति (पिछले 12 महीने)', 'ମାସିକ ପ୍ରବୃତ୍ତି (ଶେଷ 12 ମାସ)')
addPhrase('Pending Cases', 'लंबित मामले', 'ଲମ୍ବିତ ମାମଲା')
addPhrase('Under investigation', 'जाँच के अधीन', 'ତଦନ୍ତାଧୀନ')
addPhrase('This Month', 'इस महीने', 'ଏହି ମାସ')
addPhrase('Cases reported this month', 'इस महीने रिपोर्ट हुए मामले', 'ଏହି ମାସରେ ରିପୋର୍ଟ ହୋଇଥିବା ମାମଲା')
addPhrase('Loading analytics...', 'एनालिटिक्स लोड हो रहा है...', 'ବିଶ୍ଳେଷଣ ଲୋଡ୍ ହେଉଛି...')
addPhrase('Cyber Crime Analytics - Odisha', 'साइबर अपराध विश्लेषण - ओडिशा', 'ସାଇବର ଅପରାଧ ବିଶ୍ଳେଷଣ - ଓଡିଶା')
addPhrase('Real-time statistics and insights', 'रियल-टाइम आँकड़े और जानकारी', 'ରିଅଲ୍-ଟାଇମ୍ ସାଂଖ୍ୟିକୀ ଓ ତଥ୍ୟ')
addPhrase('Bank Statistics Dashboard', 'बैंक सांख्यिकी डैशबोर्ड', 'ବ୍ୟାଙ୍କ ସାଂଖ୍ୟିକୀ ଡ୍ୟାଶବୋର୍ଡ')
addPhrase('Bank Analytics & Financial Insights', 'बैंक विश्लेषण और वित्तीय अंतर्दृष्टि', 'ବ୍ୟାଙ୍କ ବିଶ୍ଳେଷଣ ଏବଂ ଆର୍ଥିକ ଅନ୍ତର୍ଦୃଷ୍ଟି')
addPhrase('Back to Dashboard', 'डैशबोर्ड पर वापस जाएँ', 'ଡ୍ୟାଶବୋର୍ଡକୁ ଫେରନ୍ତୁ')
addPhrase('Refunded Amount', 'रिफंड की गई राशि', 'ଫେରତ ଦିଆଯାଇଥିବା ରାଶି')
addPhrase('Pending Investigation', 'लंबित जाँच', 'ଲମ୍ବିତ ତଦନ୍ତ')
addPhrase('Police Statistics Dashboard', 'पुलिस सांख्यिकी डैशबोर्ड', 'ପୋଲିସ ସାଂଖ୍ୟିକୀ ଡ୍ୟାଶବୋର୍ଡ')
addPhrase('Real-time Analytics & Insights for Odisha', 'ओडिशा के लिए रियल-टाइम विश्लेषण और जानकारी', 'ଓଡିଶା ପାଇଁ ରିଅଲ୍-ଟାଇମ୍ ବିଶ୍ଳେଷଣ ଓ ତଥ୍ୟ')
addPhrase('Cases with Location', 'स्थान सहित मामले', 'ସ୍ଥାନ ସହିତ ମାମଲା')
addPhrase('Zone-wise Case Distribution', 'क्षेत्रवार मामले वितरण', 'କ୍ଷେତ୍ର ଅନୁସାରେ ମାମଲା ବଣ୍ଟନ')
addPhrase('No location data available', 'स्थान संबंधी डेटा उपलब्ध नहीं है', 'ସ୍ଥାନ ତଥ୍ୟ ଉପଲବ୍ଧ ନାହିଁ')
addPhrase('Cases will appear here when location data is available', 'स्थान डेटा उपलब्ध होने पर मामले यहाँ दिखाई देंगे', 'ସ୍ଥାନ ତଥ୍ୟ ଉପଲବ୍ଧ ହେଲେ ମାମଲା ଏଠାରେ ଦେଖାଯିବ')
addPhrase('Track Complaints', 'शिकायत ट्रैक करें', 'ଅଭିଯୋଗ ଟ୍ରାକ୍ କରନ୍ତୁ')
addPhrase('Report and track cyber fraud incidents', 'साइबर धोखाधड़ी घटनाओं की रिपोर्ट करें और ट्रैक करें', 'ସାଇବର ଠକେଇ ଘଟଣା ରିପୋର୍ଟ କରନ୍ତୁ ଓ ଟ୍ରାକ୍ କରନ୍ତୁ')
addPhrase('Personal Information', 'व्यक्तिगत जानकारी', 'ବ୍ୟକ୍ତିଗତ ସୂଚନା')
addPhrase('Review before submit', 'जमा करने से पहले समीक्षा', 'ଦାଖଲ ପୂର୍ବରୁ ସମୀକ୍ଷା')
addPhrase('Submit Complaint', 'शिकायत जमा करें', 'ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ')
addPhrase('Submitting...', 'जमा हो रहा है...', 'ଦାଖଲ ହେଉଛି...')
addPhrase('Get My Location', 'मेरा स्थान प्राप्त करें', 'ମୋ ଅବସ୍ଥାନ ନିଅନ୍ତୁ')
addPhrase('Try Again - Get My Location', 'फिर से कोशिश करें - मेरा स्थान प्राप्त करें', 'ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ - ମୋ ଅବସ୍ଥାନ ନିଅନ୍ତୁ')
addPhrase('Select Gender', 'लिंग चुनें', 'ଲିଙ୍ଗ ବାଛନ୍ତୁ')
addPhrase('Select ID Type', 'आईडी प्रकार चुनें', 'ID ପ୍ରକାର ବାଛନ୍ତୁ')
addPhrase('Select Incident Type', 'घटना प्रकार चुनें', 'ଘଟଣା ପ୍ରକାର ବାଛନ୍ତୁ')
addPhrase('Select Mode', 'मोड चुनें', 'ମୋଡ୍ ବାଛନ୍ତୁ')
addPhrase('Select Platform', 'प्लेटफ़ॉर्म चुनें', 'ପ୍ଲାଟଫର୍ମ ବାଛନ୍ତୁ')
addPhrase('Preferred Language', 'पसंदीदा भाषा', 'ପସନ୍ଦର ଭାଷା')
addPhrase('Terms and Conditions', 'नियम और शर्तें', 'ନିୟମ ଓ ଶର୍ତ୍ତ')
addPhrase('Tap to upload documents', 'दस्तावेज़ अपलोड करने के लिए टैप करें', 'ଦଳିଲ ଅପଲୋଡ୍ ପାଇଁ ଟାପ୍ କରନ୍ତୁ')
addPhrase('Police Dashboard', 'पुलिस डैशबोर्ड', 'ପୋଲିସ ଡ୍ୟାଶବୋର୍ଡ')
addPhrase('Bank Dashboard', 'बैंक डैशबोर्ड', 'ବ୍ୟାଙ୍କ ଡ୍ୟାଶବୋର୍ଡ')
addPhrase('Search', 'खोजें', 'ଖୋଜନ୍ତୁ')
addPhrase('Sort By', 'क्रमबद्ध करें', 'କ୍ରମବଦ୍ଧ କରନ୍ତୁ')
addPhrase('View Full Details', 'पूरा विवरण देखें', 'ସମ୍ପୂର୍ଣ୍ଣ ବିବରଣୀ ଦେଖନ୍ତୁ')
addPhrase('Hide Details', 'विवरण छिपाएँ', 'ବିବରଣୀ ଲୁଚାନ୍ତୁ')
addPhrase('No Cases Found', 'कोई मामला नहीं मिला', 'କୌଣସି ମାମଲା ମିଳିଲା ନାହିଁ')
addPhrase("You haven't filed any complaints yet.", 'आपने अभी तक कोई शिकायत दर्ज नहीं की है।', 'ଆପଣ ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଅଭିଯୋଗ ଦାଖଲ କରିନାହାନ୍ତି।')
addPhrase('No cases available at the moment.', 'इस समय कोई मामला उपलब्ध नहीं है।', 'ଏହି ସମୟରେ କୌଣସି ମାମଲା ଉପଲବ୍ଧ ନାହିଁ।')
addPhrase('File Your First Complaint', 'अपनी पहली शिकायत दर्ज करें', 'ଆପଣଙ୍କ ପ୍ରଥମ ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ')
addPhrase('Complaint Description', 'शिकायत का विवरण', 'ଅଭିଯୋଗ ବିବରଣୀ')
addPhrase('Transaction Details', 'लेन-देन विवरण', 'ଲେନଦେନ ବିବରଣୀ')
addPhrase('Amount Lost', 'खोई गई राशि', 'ହାରାଇଥିବା ରାଶି')
addPhrase('Transaction ID', 'लेन-देन आईडी', 'ଲେନଦେନ ID')
addPhrase('Bank Name', 'बैंक का नाम', 'ବ୍ୟାଙ୍କର ନାମ')
addPhrase('Scammer Account Details', 'ठग के खाते का विवरण', 'ଠକଙ୍କ ଖାତା ବିବରଣୀ')
addPhrase('Account', 'खाता', 'ଖାତା')
addPhrase('UPI ID', 'UPI आईडी', 'UPI ID')
addPhrase('Victim', 'पीड़ित', 'ପୀଡିତ')
addPhrase('Case Progress', 'मामले की प्रगति', 'ମାମଲାର ପ୍ରଗତି')
addPhrase('Evidence Files', 'सबूत फ़ाइलें', 'ପ୍ରମାଣ ଫାଇଲ୍')
addPhrase('No timeline updates yet', 'अभी तक समयरेखा अपडेट नहीं', 'ଏପର୍ଯ୍ୟନ୍ତ ସମୟରେଖା ଅଦ୍ୟତନ ନାହିଁ')
addPhrase('Not available', 'उपलब्ध नहीं', 'ଉପଲବ୍ଧ ନାହିଁ')
addPhrase('Not provided', 'प्रदान नहीं किया गया', 'ଦିଆଯାଇନାହିଁ')
addPhrase('Unknown', 'अज्ञात', 'ଅଜଣା')
addPhrase('Unknown Fraud', 'अज्ञात धोखाधड़ी', 'ଅଜଣା ଠକେଇ')
addPhrase('Unknown Victim', 'अज्ञात पीड़ित', 'ଅଜଣା ପୀଡିତ')
addPhrase('Status', 'स्थिति', 'ସ୍ଥିତି')
addPhrase('Loading cases...', 'मामले लोड हो रहे हैं...', 'ମାମଲା ଲୋଡ୍ ହେଉଛି...')
addPhrase('Case ID', 'केस आईडी', 'କେସ୍ ID')
addPhrase('Filed On', 'दर्ज की तिथि', 'ଦାଖଲ ତାରିଖ')
addPhrase('Wallet/Payment App', 'वॉलेट/पेमेंट ऐप', 'ୱାଲେଟ୍/ପେମେଣ୍ଟ ଆପ୍')
addPhrase('Search by Case ID, Fraud Type, or Victim Name', 'केस आईडी, धोखाधड़ी प्रकार या पीड़ित नाम से खोजें', 'କେସ୍ ID, ଠକେଇ ପ୍ରକାର କିମ୍ବା ପୀଡିତ ନାମରେ ଖୋଜନ୍ତୁ')
addPhrase('Select a case to view details', 'विवरण देखने के लिए एक मामला चुनें', 'ବିବରଣୀ ଦେଖିବାକୁ ଗୋଟିଏ ମାମଲା ବାଛନ୍ତୁ')
addPhrase('Police Officer', 'पुलिस अधिकारी', 'ପୋଲିସ ଅଧିକାରୀ')
addPhrase('Statistics', 'सांख्यिकी', 'ସାଂଖ୍ୟିକୀ')
addPhrase('Recent Activity', 'हाल की गतिविधि', 'ସମ୍ପ୍ରତି କାର୍ଯ୍ୟକଳାପ')
addPhrase('Status Mix', 'स्थिति मिश्रण', 'ସ୍ଥିତି ମିଶ୍ରଣ')
addPhrase('Submission Trend', 'जमा करने की प्रवृत्ति', 'ଦାଖଲ ପ୍ରବୃତ୍ତି')
addPhrase('What To Watch', 'क्या देखें', 'କଣ ଧ୍ୟାନ ଦେବେ')
addPhrase('Progress', 'प्रगति', 'ପ୍ରଗତି')
addPhrase('User', 'उपयोगकर्ता', 'ବ୍ୟବହାରକାରୀ')
addPhrase('Cyber Fraud Report', 'साइबर धोखाधड़ी रिपोर्ट', 'ସାଇବର ଠକେଇ ରିପୋର୍ଟ')
addPhrase('File a Complaint', 'शिकायत दर्ज करें', 'ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ')
addPhrase('Track Complaints', 'शिकायतें ट्रैक करें', 'ଅଭିଯୋଗ ଟ୍ରାକ୍ କରନ୍ତୁ')
addPhrase('Form auto-saves as you type', 'आपके टाइप करते ही फॉर्म अपने आप सेव होता है', 'ଆପଣ ଟାଇପ୍ କଲେ ଫର୍ମ ଆପେ-ଆପେ ସେଭ୍ ହୁଏ')
addPhrase('Verify your identity and personal details', 'अपनी पहचान और व्यक्तिगत विवरण सत्यापित करें', 'ଆପଣଙ୍କ ପରିଚୟ ଏବଂ ବ୍ୟକ୍ତିଗତ ବିବରଣୀ ସତ୍ୟାପନ କରନ୍ତୁ')
addPhrase('Capture incident information and financial details', 'घटना की जानकारी और वित्तीय विवरण दर्ज करें', 'ଘଟଣା ସୂଚନା ଓ ଆର୍ଥିକ ବିବରଣୀ ଧରନ୍ତୁ')
addPhrase('Upload documents, confirm terms, and submit', 'दस्तावेज़ अपलोड करें, शर्तें स्वीकार करें और जमा करें', 'ଦଳିଲ ଅପଲୋଡ୍ କରନ୍ତୁ, ନିୟମ ସ୍ୱୀକାର କରନ୍ତୁ ଏବଂ ଦାଖଲ କରନ୍ତୁ')
addPhrase('Auto-saved draft', 'स्वतः सहेजा गया ड्राफ्ट', 'ଆପେ-ଆପେ ସଞ୍ଚିତ ଖସଡ଼ା')
addPhrase('Personal Details', 'व्यक्तिगत विवरण', 'ବ୍ୟକ୍ତିଗତ ବିବରଣୀ')
addPhrase('Incident Details', 'घटना का विवरण', 'ଘଟଣା ବିବରଣୀ')
addPhrase('Documents & Review', 'दस्तावेज़ और समीक्षा', 'ଦଳିଲ ଏବଂ ସମୀକ୍ଷା')
addPhrase('Start', 'शुरू करें', 'ଆରମ୍ଭ')
addPhrase('Done', 'पूर्ण', 'ସମ୍ପୂର୍ଣ୍ଣ')
addPhrase('Locked', 'लॉक', 'ଲକ୍')
addPhrase('PAN scan and identity check', 'पैन स्कैन और पहचान जाँच', 'ପ୍ୟାନ୍ ସ୍କାନ୍ ଏବଂ ପରିଚୟ ଯାଞ୍ଚ')
addPhrase('Use the PAN scan slot for quick auto-fill, then review the personal details before continuing.', 'त्वरित ऑटो-फिल के लिए PAN स्कैन स्लॉट का उपयोग करें, फिर आगे बढ़ने से पहले व्यक्तिगत विवरण की समीक्षा करें।', 'ଦ୍ରୁତ ଅଟୋ-ଫିଲ୍ ପାଇଁ PAN ସ୍କାନ୍ ସ୍ଲଟ୍ ବ୍ୟବହାର କରନ୍ତୁ, ପରେ ଆଗକୁ ବଢ଼ିବା ପୂର୍ବରୁ ବ୍ୟକ୍ତିଗତ ବିବରଣୀ ଯାଞ୍ଚ କରନ୍ତୁ।')
addPhrase('PAN OCR Slot', 'पैन OCR स्लॉट', 'PAN OCR ସ୍ଲଟ୍')
addPhrase('Scan PAN card and pre-fill identity details', 'पैन कार्ड स्कैन करें और पहचान विवरण पहले से भरें', 'PAN କାର୍ଡ ସ୍କାନ୍ କରି ପରିଚୟ ବିବରଣୀ ପୂରଣ କରନ୍ତୁ')
addPhrase("Upload a clear PAN image to auto-fill name, PAN number, father's name, and age where detected.", 'नाम, PAN नंबर, पिता का नाम और आयु ऑटो-फिल करने के लिए स्पष्ट PAN छवि अपलोड करें।', 'ନାମ, PAN ନମ୍ବର, ପିତାଙ୍କ ନାମ ଏବଂ ବୟସ୍ ସ୍ୱୟଂଚାଳିତ ଭାବେ ପୂରଣ ପାଇଁ ସ୍ପଷ୍ଟ PAN ଛବି ଅପଲୋଡ୍ କରନ୍ତୁ।')
addPhrase('OCR assisted', 'OCR सहायक', 'OCR ସହାୟତାପ୍ରାପ୍ତ')
addPhrase('Sample PAN card', 'नमूना पैन कार्ड', 'ନମୁନା PAN କାର୍ଡ')
addPhrase('Scan options', 'स्कैन विकल्प', 'ସ୍କାନ୍ ବିକଳ୍ପ')
addPhrase('Use camera scan for live capture or upload a clean PAN image from your device.', 'लाइव कैप्चर के लिए कैमरा स्कैन का उपयोग करें या अपने डिवाइस से साफ PAN छवि अपलोड करें।', 'ଲାଇଭ୍ କ୍ୟାପଚର୍ ପାଇଁ କ୍ୟାମେରା ସ୍କାନ୍ ବ୍ୟବହାର କରନ୍ତୁ କିମ୍ବା ଡିଭାଇସରୁ ସ୍ପଷ୍ଟ PAN ଛବି ଅପଲୋଡ୍ କରନ୍ତୁ।')
addPhrase('Camera Scan', 'कैमरा स्कैन', 'କ୍ୟାମେରା ସ୍କାନ୍')
addPhrase('Upload PAN Image', 'पैन छवि अपलोड करें', 'PAN ଛବି ଅପଲୋଡ୍ କରନ୍ତୁ')
addPhrase('Last scanned file', 'अंतिम स्कैन की गई फ़ाइल', 'ଶେଷ ସ୍କାନ୍ ହୋଇଥିବା ଫାଇଲ୍')
addPhrase('Reading PAN card', 'पैन कार्ड पढ़ा जा रहा है', 'PAN କାର୍ଡ ପଢ଼ାଯାଉଛି')
addPhrase('Image looks clear and the main PAN details were fetched properly. This scan is ready to attach with your complaint.', 'छवि साफ़ दिख रही है और मुख्य PAN विवरण सही तरह से प्राप्त हुए हैं। यह स्कैन आपकी शिकायत के साथ जोड़ने के लिए तैयार है।', 'ଛବି ସ୍ପଷ୍ଟ ଦେଖାଯାଉଛି ଏବଂ ମୁଖ୍ୟ PAN ବିବରଣୀ ଠିକ୍ ଭାବରେ ମିଳିଛି। ଏହି ସ୍କାନ୍ ଆପଣଙ୍କ ଅଭିଯୋଗ ସହ ଯୋଡ଼ିବାକୁ ପ୍ରସ୍ତୁତ।')
addPhrase('Extracted preview', 'निकाला गया पूर्वावलोकन', 'ନିଷ୍କାଷିତ ପୂର୍ବଦର୍ଶନ')
addPhrase('Parent Name', 'अभिभावक का नाम', 'ଅଭିଭାବକଙ୍କ ନାମ')
addPhrase('PAN Number', 'पैन नंबर', 'PAN ନମ୍ବର')
addPhrase('Not detected', 'पता नहीं चला', 'ଚିହ୍ନଟ ହୋଇନି')
addPhrase('OCR Confidence', 'OCR विश्वसनीयता', 'OCR ବିଶ୍ୱସନୀୟତା')
addPhrase('Image Sharpness', 'छवि की स्पष्टता', 'ଛବିର ସ୍ପଷ୍ଟତା')
addPhrase('PAN image ready for upload', 'अपलोड के लिए PAN छवि तैयार है', 'ଅପଲୋଡ୍ ପାଇଁ PAN ଛବି ପ୍ରସ୍ତୁତ')
addPhrase('Scan a PAN image to attach it with this complaint.', 'इस शिकायत के साथ जोड़ने के लिए PAN छवि स्कैन करें।', 'ଏହି ଅଭିଯୋଗ ସହ ଯୋଡ଼ିବା ପାଇଁ PAN ଛବି ସ୍କାନ୍ କରନ୍ତୁ।')
addPhrase('The OCR preview will appear here after you scan a PAN card. You can still edit every field manually.', 'PAN कार्ड स्कैन करने के बाद OCR पूर्वावलोकन यहाँ दिखेगा। आप हर फ़ील्ड को अभी भी मैन्युअली संपादित कर सकते हैं।', 'PAN କାର୍ଡ ସ୍କାନ୍ ପରେ OCR ପୂର୍ବଦର୍ଶନ ଏଠାରେ ଦେଖାଯିବ। ଆପଣ ଏପରିକି ପ୍ରତ୍ୟେକ ଫିଲ୍ଡ୍‌କୁ ହାତେ ସମ୍ପାଦନ କରିପାରିବେ।')
addPhrase("Father's / Mother's Name", 'पिता / माता का नाम', 'ପିତା / ମାତାଙ୍କ ନାମ')
addPhrase('For identity verification', 'पहचान सत्यापन के लिए', 'ପରିଚୟ ସତ୍ୟାପନ ପାଇଁ')
addPhrase('Occupation', 'पेशा', 'ପେଶା')
addPhrase('e.g., Student, Engineer, Business', 'जैसे: छात्र, इंजीनियर, व्यवसाय', 'ଯେପରିକି: ଛାତ୍ର, ଇଞ୍ଜିନିୟର, ବ୍ୟବସାୟ')
addPhrase('Your age', 'आपकी आयु', 'ଆପଣଙ୍କ ବୟସ୍')
addPhrase('Incident Information', 'घटना की जानकारी', 'ଘଟଣା ସୂଚନା')
addPhrase('Capture the fraud timeline, financial trail, scammer information, and a clear complaint narrative.', 'धोखाधड़ी की समयरेखा, वित्तीय जानकारी, ठग की सूचना और स्पष्ट शिकायत विवरण दर्ज करें।', 'ଠକେଇର ସମୟରେଖା, ଆର୍ଥିକ ସନ୍ଧାନ, ଠକଙ୍କ ସୂଚନା ଏବଂ ସ୍ପଷ୍ଟ ଅଭିଯୋଗ ବର୍ଣ୍ଣନା ଧରନ୍ତୁ।')
addPhrase('Fill the incident step as accurately as possible. Use exact dates, transaction references, and platform details wherever available.', 'घटना वाले चरण को यथासंभव सही भरें। जहाँ भी संभव हो, सही तारीख, लेनदेन संदर्भ और प्लेटफ़ॉर्म विवरण दें।', 'ଘଟଣା ଅଂଶଟିକୁ ସମ୍ଭବ ଥିବା ସବୁଠାରୁ ସଠିକ୍ ଭାବେ ପୂରଣ କରନ୍ତୁ। ଯେଉଁଠି ସମ୍ଭବ, ନିଷ୍ପତ୍ତିକ ତାରିଖ, ଲେନଦେନ ସନ୍ଦର୍ଭ ଓ ପ୍ଲାଟଫର୍ମ ବିବରଣୀ ଦିଅନ୍ତୁ।')
addPhrase('Date of Reporting', 'रिपोर्ट करने की तारीख', 'ରିପୋର୍ଟ କରିବାର ତାରିଖ')
addPhrase('Time of Reporting', 'रिपोर्ट करने का समय', 'ରିପୋର୍ଟ କରିବାର ସମୟ')
addPhrase('Location / Place of Occurrence', 'स्थान / घटना का स्थान', 'ସ୍ଥାନ / ଘଟଣା ସ୍ଥଳ')
addPhrase('City, State or Online/Website name', 'शहर, राज्य या ऑनलाइन/वेबसाइट का नाम', 'ସହର, ରାଜ୍ୟ କିମ୍ବା ଅନଲାଇନ୍/ୱେବସାଇଟ୍ ନାମ')
addPhrase('Physical location or online platform where incident occurred', 'घटना जहाँ हुई वह भौतिक स्थान या ऑनलाइन प्लेटफ़ॉर्म', 'ଘଟଣା ଘଟିଥିବା ସ୍ଥାନ କିମ୍ବା ଅନଲାଇନ୍ ପ୍ଲାଟଫର୍ମ')
addPhrase('Transaction ID / Reference No.', 'लेनदेन आईडी / संदर्भ संख्या', 'ଲେନଦେନ ID / ସନ୍ଦର୍ଭ ସଂଖ୍ୟା')
addPhrase('From UPI, bank, or card statement', 'UPI, बैंक या कार्ड स्टेटमेंट से', 'UPI, ବ୍ୟାଙ୍କ କିମ୍ବା କାର୍ଡ୍ ଷ୍ଟେଟମେଣ୍ଟରୁ')
addPhrase('Wallet / Payment App', 'वॉलेट / पेमेंट ऐप', 'ୱାଲେଟ୍ / ପେମେଣ୍ଟ ଆପ୍')
addPhrase("e.g., SBI, HDFC, ICICI", 'जैसे: SBI, HDFC, ICICI', 'ଯେପରିକି: SBI, HDFC, ICICI')
addPhrase('Account Number', 'खाता संख्या', 'ଖାତା ସଂଖ୍ୟା')
addPhrase("Scammer's account number", 'ठग का खाता नंबर', 'ଠକଙ୍କ ଖାତା ସଂଖ୍ୟା')
addPhrase('Bank IFSC code', 'बैंक IFSC कोड', 'ବ୍ୟାଙ୍କ IFSC କୋଡ୍')
addPhrase('Phone Call', 'फोन कॉल', 'ଫୋନ୍ କଲ୍')
addPhrase('SMS/WhatsApp Link', 'SMS/व्हाट्सऐप लिंक', 'SMS/WhatsApp ଲିଙ୍କ')
addPhrase('Fake Website', 'फर्जी वेबसाइट', 'ନକଲି ୱେବସାଇଟ୍')
addPhrase('Mobile App', 'मोबाइल ऐप', 'ମୋବାଇଲ୍ ଆପ୍')
addPhrase('In-Person', 'सामने से', 'ସାମ୍ନାସାମ୍ନି')
addPhrase('Device / Platform', 'डिवाइस / प्लेटफ़ॉर्म', 'ଡିଭାଇସ୍ / ପ୍ଲାଟଫର୍ମ')
addPhrase('Explain what happened, how you were contacted, and what action you already took.', 'बताइए क्या हुआ, आपसे कैसे संपर्क किया गया, और आपने अब तक क्या कार्रवाई की।', 'କଣ ଘଟିଲା, କିପରି ଆପଣଙ୍କୁ ସଂପର୍କ କରାଗଲା ଏବଂ ଆପଣ ଏପର୍ଯ୍ୟନ୍ତ କଣ କାର୍ଯ୍ୟ କଲେ ସେସବୁ ଲେଖନ୍ତୁ।')
addPhrase('Share the key sequence clearly so the case can be reviewed faster.', 'मुख्य घटनाक्रम साफ़ लिखें ताकि मामले की समीक्षा जल्दी हो सके।', 'ମୁଖ୍ୟ ଘଟଣାକ୍ରମକୁ ସ୍ପଷ୍ଟ ଭାବେ ଲେଖନ୍ତୁ ଯାହାରେ ମାମଲା ଶୀଘ୍ର ସମୀକ୍ଷା ହୋଇପାରିବ।')
addPhrase('Next: Incident Details', 'अगला: घटना का विवरण', 'ପରବର୍ତ୍ତୀ: ଘଟଣା ବିବରଣୀ')
addPhrase('Back to Personal Details', 'व्यक्तिगत विवरण पर वापस जाएँ', 'ବ୍ୟକ୍ତିଗତ ବିବରଣୀକୁ ଫେରନ୍ତୁ')
addPhrase('Next: Upload Evidence', 'अगला: साक्ष्य अपलोड करें', 'ପରବର୍ତ୍ତୀ: ପ୍ରମାଣ ଅପଲୋଡ୍ କରନ୍ତୁ')
addPhrase('Attach proof, capture location, submit', 'प्रमाण जोड़ें, स्थान कैप्चर करें, जमा करें', 'ପ୍ରମାଣ ଯୋଡନ୍ତୁ, ଅବସ୍ଥାନ ଧରନ୍ତୁ, ଦାଖଲ କରନ୍ତୁ')
addPhrase('Upload valid supporting documents, confirm location access, and review the complaint before final submission.', 'मान्य सहायक दस्तावेज़ अपलोड करें, स्थान की अनुमति की पुष्टि करें और अंतिम जमा से पहले शिकायत की समीक्षा करें।', 'ବୈଧ ସହାୟକ ଦଳିଲ ଅପଲୋଡ୍ କରନ୍ତୁ, ଅବସ୍ଥାନ ଅନୁମତି ସୁନିଶ୍ଚିତ କରନ୍ତୁ ଏବଂ ଅନ୍ତିମ ଦାଖଲ ପୂର୍ବରୁ ଅଭିଯୋଗ ସମୀକ୍ଷା କରନ୍ତୁ।')
addPhrase('Supporting Documents', 'सहायक दस्तावेज़', 'ସହାୟକ ଦଳିଲ')
addPhrase('Upload screenshots, statements, chats, or emails. Each file can be up to 750 KB.', 'स्क्रीनशॉट, स्टेटमेंट, चैट या ईमेल अपलोड करें। हर फ़ाइल 750 KB तक हो सकती है।', 'ସ୍କ୍ରିନଶଟ୍, ଷ୍ଟେଟମେଣ୍ଟ, ଚାଟ୍ କିମ୍ବା ଇମେଲ୍ ଅପଲୋଡ୍ କରନ୍ତୁ। ପ୍ରତ୍ୟେକ ଫାଇଲ୍ 750 KB ପର୍ଯ୍ୟନ୍ତ ହୋଇପାରେ।')
addPhrase('supporting file(s) selected', 'सहायक फ़ाइल(ें) चुनी गईं', 'ସହାୟକ ଫାଇଲ୍ ଚୟନ ହୋଇଛି')
addPhrase('file(s) selected:', 'फ़ाइल(ें) चुनी गईं:', 'ଫାଇଲ୍ ଚୟନ ହୋଇଛି:')
addPhrase('file(s) will be submitted with this complaint.', 'फ़ाइल(ें) इस शिकायत के साथ जमा होंगी।', 'ଫାଇଲ୍ ଏହି ଅଭିଯୋଗ ସହ ଦାଖଲ ହେବ।')
addPhrase('Identity Proof', 'पहचान प्रमाण', 'ପରିଚୟ ପ୍ରମାଣ')
addPhrase('PAN scan attached', 'पैन स्कैन संलग्न है', 'PAN ସ୍କାନ୍ ସଂଲଗ୍ନ ଅଛି')
addPhrase('Scan a PAN card in the first section to auto-fill details and attach the image here.', 'पहले सेक्शन में PAN कार्ड स्कैन करें ताकि विवरण ऑटो-फिल हो जाएँ और छवि यहाँ जुड़ जाए।', 'ପ୍ରଥମ ଅଂଶରେ PAN କାର୍ଡ ସ୍କାନ୍ କରନ୍ତୁ ଯାହାରେ ବିବରଣୀ ଅଟୋ-ଫିଲ୍ ହେବ ଏବଂ ଛବି ଏଠାରେ ସଂଲଗ୍ନ ହେବ।')
addPhrase('Ready attachments', 'तैयार अटैचमेंट', 'ପ୍ରସ୍ତୁତ ସଂଲଗ୍ନକ')
addPhrase('Evidence (Files) - Optional', 'साक्ष्य (फ़ाइलें) - वैकल्पिक', 'ପ୍ରମାଣ (ଫାଇଲ୍) - ବୈକଳ୍ପିକ')
addPhrase('Allowed file types:', 'अनुमत फ़ाइल प्रकार:', 'ଅନୁମୋଦିତ ଫାଇଲ୍ ପ୍ରକାର:')
addPhrase('Maximum file size: 750KB per file (stored in Firestore subcollection)', 'अधिकतम फ़ाइल आकार: 750KB प्रति फ़ाइल (Firestore सबकलेक्शन में संग्रहित)', 'ସର୍ବାଧିକ ଫାଇଲ୍ ଆକାର: ପ୍ରତି ଫାଇଲ୍ 750KB (Firestore ସବକଲେକ୍ସନ୍‌ରେ ସଞ୍ଚିତ)')
addPhrase('Tip: Upload screenshots of transactions, chat conversations, emails, or any relevant documents', 'सुझाव: लेनदेन, चैट, ईमेल या अन्य संबंधित दस्तावेज़ों के स्क्रीनशॉट अपलोड करें', 'ସୁପରିଶ: ଲେନଦେନ, ଚାଟ୍, ଇମେଲ୍ କିମ୍ବା ସମ୍ପର୍କିତ ଦଳିଲର ସ୍କ୍ରିନଶଟ୍ ଅପଲୋଡ୍ କରନ୍ତୁ')
addPhrase('Note: File selections are not saved if you refresh the page. Please upload files just before submitting.', 'नोट: पेज रिफ्रेश करने पर चुनी गई फ़ाइलें सेव नहीं होतीं। कृपया जमा करने से ठीक पहले फ़ाइलें अपलोड करें।', 'ଟିପ୍ପଣୀ: ପୃଷ୍ଠା ରିଫ୍ରେଶ୍ କଲେ ଚୟନ କରା ଫାଇଲ୍ ସେଭ୍ ହୁଏନାହିଁ। ଦୟାକରି ଦାଖଲ ପୂର୍ବରୁ ଫାଇଲ୍ ଅପଲୋଡ୍ କରନ୍ତୁ।')
addPhrase('Location Access (Required)', 'स्थान की अनुमति (आवश्यक)', 'ଅବସ୍ଥାନ ଅନୁମତି (ଆବଶ୍ୟକ)')
addPhrase('Getting your location...', 'आपका स्थान प्राप्त किया जा रहा है...', 'ଆପଣଙ୍କ ଅବସ୍ଥାନ ନିଆଯାଉଛି...')
addPhrase('Location captured successfully', 'स्थान सफलतापूर्वक प्राप्त हुआ', 'ଅବସ୍ଥାନ ସଫଳତାର ସହ ଧରାଯାଇଛି')
addPhrase('Latitude', 'अक्षांश', 'ଅକ୍ଷାଂଶ')
addPhrase('Longitude', 'देशांतर', 'ଦେଶାଂଶ')
addPhrase('Accuracy', 'सटीकता', 'ସଠିକତା')
addPhrase('meters', 'मीटर', 'ମିଟର')
addPhrase('How to enable location access:', 'स्थान अनुमति कैसे सक्षम करें:', 'ଅବସ୍ଥାନ ଅନୁମତି କିପରି ସକ୍ରିୟ କରିବେ:')
addPhrase("Click the lock icon (🔒) in your browser's address bar", 'अपने ब्राउज़र के एड्रेस बार में लॉक आइकन (🔒) पर क्लिक करें', 'ବ୍ରାଉଜରର ଏଡ୍ରେସ୍ ବାରରେ ଥିବା ଲକ୍ ଆଇକନ୍ (🔒) କୁ କ୍ଲିକ୍ କରନ୍ତୁ')
addPhrase('Select "Allow" for Location permissions', 'स्थान अनुमति के लिए "Allow" चुनें', 'ଅବସ୍ଥାନ ଅନୁମତି ପାଇଁ "Allow" ବାଛନ୍ତୁ')
addPhrase('Or go to your browser settings → Privacy → Location → Allow for this site', 'या ब्राउज़र सेटिंग्स → Privacy → Location → इस साइट के लिए Allow पर जाएँ', 'କିମ୍ବା ବ୍ରାଉଜର ସେଟିଂସ୍ → Privacy → Location → ଏହି ସାଇଟ୍ ପାଇଁ Allow କୁ ଯାଆନ୍ତୁ')
addPhrase('Then click "Get My Location" button again', 'फिर "Get My Location" बटन दोबारा क्लिक करें', 'ତାପରେ "Get My Location" ବଟନ୍‌କୁ ପୁଣି କ୍ଲିକ୍ କରନ୍ତୁ')
addPhrase('I accept the Terms and Conditions', 'मैं नियम और शर्तें स्वीकार करता/करती हूँ', 'ମୁଁ ନିୟମ ଓ ଶର୍ତ୍ତ ସ୍ୱୀକାର କରୁଛି')
addPhrase('I confirm the complaint details are accurate.', 'मैं पुष्टि करता/करती हूँ कि शिकायत का विवरण सही है।', 'ମୁଁ ନିଶ୍ଚିତ କରୁଛି ଯେ ଅଭିଯୋଗର ବିବରଣୀ ସଠିକ୍ ଅଟେ।')
addPhrase('I allow the authorities to use the attached information and location for verification.', 'मैं सत्यापन के लिए अधिकारियों को संलग्न जानकारी और स्थान उपयोग करने की अनुमति देता/देती हूँ।', 'ମୁଁ ସତ୍ୟାପନ ପାଇଁ କର୍ତ୍ତୃପକ୍ଷଙ୍କୁ ସଂଲଗ୍ନ ସୂଚନା ଓ ଅବସ୍ଥାନ ବ୍ୟବହାର କରିବାକୁ ଅନୁମତି ଦେଉଛି।')
addPhrase('I understand officials may contact me on the shared phone number or email.', 'मैं समझता/समझती हूँ कि अधिकारी साझा किए गए फ़ोन नंबर या ईमेल पर मुझसे संपर्क कर सकते हैं।', 'ମୁଁ ବୁଝୁଛି ଯେ କର୍ତ୍ତୃପକ୍ଷ ଦିଆଯାଇଥିବା ଫୋନ୍ ନମ୍ବର କିମ୍ବା ଇମେଲ୍‌ରେ ମୋତେ ସଂପର୍କ କରିପାରନ୍ତି।')
addPhrase('Summary', 'सारांश', 'ସାରାଂଶ')
addPhrase('Review your complaint before submitting', 'जमा करने से पहले अपनी शिकायत की समीक्षा करें', 'ଦାଖଲ ପୂର୍ବରୁ ନିଜ ଅଭିଯୋଗକୁ ସମୀକ୍ଷା କରନ୍ତୁ')
addPhrase('PAN Attached', 'पैन संलग्न', 'PAN ସଂଲଗ୍ନ')
addPhrase('Total Attachments', 'कुल अटैचमेंट', 'ମୋଟ ସଂଲଗ୍ନକ')
addPhrase('Terms Accepted', 'शर्तें स्वीकार की गईं', 'ଶର୍ତ୍ତ ସ୍ୱୀକୃତ')
addPhrase('Not specified', 'निर्दिष्ट नहीं', 'ନିର୍ଦ୍ଦିଷ୍ଟ ନୁହେଁ')
addPhrase('Captured', 'कैप्चर किया गया', 'ଧରାଯାଇଛି')
addPhrase('Not captured', 'कैप्चर नहीं हुआ', 'ଧରାଯାଇନି')
addPhrase('File', 'फ़ाइल', 'ଫାଇଲ୍')
addPhrase('Download', 'डाउनलोड', 'ଡାଉନଲୋଡ୍')
addPhrase('N/A', 'उपलब्ध नहीं', 'ଉପଲବ୍ଧ ନୁହେଁ')
addPhrase('Invalid files:', 'अमान्य फ़ाइलें:', 'ଅବୈଧ ଫାଇଲଗୁଡ଼ିକ:')
addPhrase('File type not allowed. Allowed types: PDF, Images (JPG, PNG, GIF, WEBP), Word (DOC, DOCX), TXT', 'यह फ़ाइल प्रकार अनुमत नहीं है। अनुमत प्रकार: PDF, Images (JPG, PNG, GIF, WEBP), Word (DOC, DOCX), TXT', 'ଏହି ଫାଇଲ୍ ପ୍ରକାର ଅନୁମତିପ୍ରାପ୍ତ ନୁହେଁ। ଅନୁମତିପ୍ରାପ୍ତ ପ୍ରକାର: PDF, Images (JPG, PNG, GIF, WEBP), Word (DOC, DOCX), TXT')
addPhrase('Unable to process this file.', 'इस फ़ाइल को प्रोसेस नहीं किया जा सका।', 'ଏହି ଫାଇଲକୁ ପ୍ରକ୍ରିୟାକରଣ କରିପାରିଲୁ ନାହିଁ।')
addPhrase('Loading evidence files...', 'साक्ष्य फ़ाइलें लोड हो रही हैं...', 'ପ୍ରମାଣ ଫାଇଲଗୁଡ଼ିକ ଲୋଡ୍ ହେଉଛି...')
addPhrase('Error downloading file. Please try again.', 'फ़ाइल डाउनलोड करने में त्रुटि हुई। कृपया फिर से प्रयास करें।', 'ଫାଇଲ୍ ଡାଉନଲୋଡ୍ କରିବାବେଳେ ତ୍ରୁଟି ହୋଇଛି। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।')
addPhrase('Click files to download evidence (stored in Firestore subcollection)', 'प्रमाण डाउनलोड करने के लिए फ़ाइलों पर क्लिक करें (Firestore सबकलेक्शन में संग्रहित)', 'ପ୍ରମାଣ ଡାଉନଲୋଡ୍ ପାଇଁ ଫାଇଲ୍‌ଗୁଡ଼ିକୁ କ୍ଲିକ୍ କରନ୍ତୁ (Firestore ସବକଲେକ୍ସନ୍‌ରେ ସଞ୍ଚିତ)')
addPhrase('Firestore index required. Visit:', 'Firestore इंडेक्स आवश्यक है। जाएँ:', 'Firestore ଇଣ୍ଡେକ୍ସ ଆବଶ୍ୟକ। ଯାଆନ୍ତୁ:')
addPhrase('Your complaint has been received and is awaiting review', 'आपकी शिकायत प्राप्त हो गई है और समीक्षा की प्रतीक्षा में है', 'ଆପଣଙ୍କ ଅଭିଯୋଗ ମିଳିଛି ଏବଂ ସମୀକ୍ଷା ପାଇଁ ଅପେକ୍ଷାରତ ଅଛି')
addPhrase('Your complaint is being investigated by authorities', 'आपकी शिकायत की जाँच अधिकारी कर रहे हैं', 'ଆପଣଙ୍କ ଅଭିଯୋଗର ତଦନ୍ତ କର୍ତ୍ତୃପକ୍ଷ କରୁଛନ୍ତି')
addPhrase('Funds have been frozen pending investigation', 'जाँच पूरी होने तक धनराशि फ्रीज़ कर दी गई है', 'ତଦନ୍ତ ଶେଷ ପର୍ଯ୍ୟନ୍ତ ଧନରାଶି ଫ୍ରିଜ୍ କରାଯାଇଛି')
addPhrase('Amount has been refunded to your account', 'राशि आपके खाते में वापस कर दी गई है', 'ରାଶି ଆପଣଙ୍କ ଖାତାକୁ ଫେରାଇ ଦିଆଯାଇଛି')
addPhrase('Case has been closed', 'मामला बंद कर दिया गया है', 'ମାମଲା ବନ୍ଦ କରାଯାଇଛି')
addPhrase('Please upload a PAN card image in JPG, PNG, or WEBP format.', 'कृपया JPG, PNG या WEBP प्रारूप में PAN कार्ड छवि अपलोड करें।', 'ଦୟାକରି JPG, PNG କିମ୍ବା WEBP ଫର୍ମାଟରେ PAN କାର୍ଡ ଛବି ଅପଲୋଡ୍ କରନ୍ତୁ।')
addPhrase('This image looks blurry or low-contrast. Try scanning again in bright light with the PAN card fully flat.', 'यह छवि धुंधली या कम-कॉन्ट्रास्ट लग रही है। PAN कार्ड को सीधा रखकर तेज रोशनी में फिर से स्कैन करें।', 'ଏହି ଛବି ଧୁସର କିମ୍ବା କମ୍-କନ୍ଟ୍ରାଷ୍ଟ ଲାଗୁଛି। PAN କାର୍ଡକୁ ସିଧା ରଖି ଭଲ ଆଲୋକରେ ପୁଣି ସ୍କାନ୍ କରନ୍ତୁ।')
addPhrase('Some PAN details could not be read clearly. Please verify and correct the fields manually.', 'कुछ PAN विवरण साफ़ नहीं पढ़े जा सके। कृपया फ़ील्ड्स को मैन्युअली जाँचकर सही करें।', 'କିଛି PAN ବିବରଣୀ ସ୍ପଷ୍ଟ ଭାବେ ପଢ଼ାଯାଇନି। ଦୟାକରି ଫିଲ୍ଡଗୁଡ଼ିକୁ ହାତେ ଯାଞ୍ଚ କରି ଠିକ୍ କରନ୍ତୁ।')
addPhrase('OCR confidence is low. Please review the extracted details carefully before continuing.', 'OCR की विश्वसनीयता कम है। आगे बढ़ने से पहले निकाले गए विवरण ध्यान से जाँचें।', 'OCR ନିଶ୍ଚିତତା କମ୍ ଅଛି। ଆଗକୁ ବଢ଼ିବା ପୂର୍ବରୁ ନିଷ୍କାଷିତ ବିବରଣୀକୁ ଭଲଭାବେ ଯାଞ୍ଚ କରନ୍ତୁ।')
addPhrase('PAN details were read, but', 'PAN विवरण पढ़े गए, लेकिन', 'PAN ବିବରଣୀ ପଢ଼ାଗଲା, କିନ୍ତୁ')
addPhrase('Please crop or rescan the image if you want it stored with the complaint.', 'यदि आप इसे शिकायत के साथ सहेजना चाहते हैं तो कृपया छवि को क्रॉप करें या फिर से स्कैन करें।', 'ଯଦି ଆପଣ ଏହାକୁ ଅଭିଯୋଗ ସହ ସଞ୍ଚୟ କରିବାକୁ ଚାହାଁନ୍ତି, ଦୟାକରି ଛବିକୁ କ୍ରପ୍ କରନ୍ତୁ କିମ୍ବା ପୁଣି ସ୍କାନ୍ କରନ୍ତୁ।')
addPhrase('PAN card scanned successfully. The image looks clear and the key details were fetched.', 'PAN कार्ड सफलतापूर्वक स्कैन हुआ। छवि साफ़ है और मुख्य विवरण प्राप्त हो गए।', 'PAN କାର୍ଡ ସଫଳଭାବେ ସ୍କାନ୍ ହେଲା। ଛବି ସ୍ପଷ୍ଟ ଅଛି ଏବଂ ମୁଖ୍ୟ ବିବରଣୀ ମିଳିଗଲା।')
addPhrase('Image is blurry or PAN details were not fetched properly. Please scan again with a clearer image.', 'छवि धुंधली है या PAN विवरण सही से प्राप्त नहीं हुए। कृपया अधिक स्पष्ट छवि के साथ फिर से स्कैन करें।', 'ଛବି ଧୁସର ଅଛି କିମ୍ବା PAN ବିବରଣୀ ଠିକ୍ ଭାବେ ମିଳିନାହିଁ। ଦୟାକରି ଅଧିକ ସ୍ପଷ୍ଟ ଛବି ସହ ପୁଣି ସ୍କାନ୍ କରନ୍ତୁ।')
addPhrase('PAN scan failed. Please upload a clearer PAN image or fill the details manually.', 'PAN स्कैन विफल हुआ। कृपया अधिक स्पष्ट PAN छवि अपलोड करें या विवरण मैन्युअली भरें।', 'PAN ସ୍କାନ୍ ବିଫଳ ହେଲା। ଦୟାକରି ଅଧିକ ସ୍ପଷ୍ଟ PAN ଛବି ଅପଲୋଡ୍ କରନ୍ତୁ କିମ୍ବା ବିବରଣୀ ହାତେ ପୂରଣ କରନ୍ତୁ।')
addPhrase('PAN scan failed. Please try again with a clear image.', 'PAN स्कैन विफल हुआ। कृपया साफ़ छवि के साथ फिर से प्रयास करें।', 'PAN ସ୍କାନ୍ ବିଫଳ ହେଲା। ଦୟାକରି ସ୍ପଷ୍ଟ ଛବି ସହ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।')
addPhrase('Please enter your full name as per ID proof.', 'कृपया पहचान प्रमाण के अनुसार अपना पूरा नाम दर्ज करें।', 'ଦୟାକରି ପରିଚୟ ପ୍ରମାଣ ଅନୁଯାୟୀ ଆପଣଙ୍କ ପୂରା ନାମ ଲେଖନ୍ତୁ।')
addPhrase('Please enter a valid 10-digit contact number.', 'कृपया मान्य 10-अंकों का संपर्क नंबर दर्ज करें।', 'ଦୟାକରି ବୈଧ 10-ଅଙ୍କିଆ ସମ୍ପର୍କ ସଂଖ୍ୟା ଲେଖନ୍ତୁ।')
addPhrase('Please enter a valid email address.', 'कृपया मान्य ईमेल पता दर्ज करें।', 'ଦୟାକରି ବୈଧ ଇମେଲ୍ ଠିକଣା ଲେଖନ୍ତୁ।')
addPhrase('Please fill in the required field:', 'कृपया आवश्यक फ़ील्ड भरें:', 'ଦୟାକରି ଆବଶ୍ୟକ ଫିଲ୍ଡ ପୂରଣ କରନ୍ତୁ:')
addPhrase('Please accept the Terms and Conditions to proceed.', 'आगे बढ़ने के लिए कृपया नियम और शर्तें स्वीकार करें।', 'ଆଗକୁ ବଢ଼ିବା ପାଇଁ ଦୟାକରି ନିୟମ ଓ ଶର୍ତ୍ତ ସ୍ୱୀକାର କରନ୍ତୁ।')
addPhrase('Please allow location access. Your location is required to file a complaint.', 'कृपया स्थान अनुमति दें। शिकायत दर्ज करने के लिए आपका स्थान आवश्यक है।', 'ଦୟାକରି ଅବସ୍ଥାନ ଅନୁମତି ଦିଅନ୍ତୁ। ଅଭିଯୋଗ ଦାଖଲ ପାଇଁ ଆପଣଙ୍କ ଅବସ୍ଥାନ ଆବଶ୍ୟକ।')
addPhrase('Your previous form data has been restored. You can continue filling the form.', 'आपका पिछला फॉर्म डेटा पुनर्स्थापित कर दिया गया है। आप फॉर्म भरना जारी रख सकते हैं।', 'ଆପଣଙ୍କ ପୂର୍ବତନ ଫର୍ମ ତଥ୍ୟ ପୁନରୁଦ୍ଧାର ହୋଇଛି। ଆପଣ ଫର୍ମ ପୂରଣ ଜାରି ରଖିପାରିବେ।')
addPhrase('Geolocation is not supported by your browser. Please enable location services.', 'आपका ब्राउज़र जियोलोकेशन को सपोर्ट नहीं करता। कृपया लोकेशन सेवाएँ सक्षम करें।', 'ଆପଣଙ୍କ ବ୍ରାଉଜର ଜିଓଲୋକେସନ୍‌କୁ ସମର୍ଥନ କରୁନାହିଁ। ଦୟାକରି ଅବସ୍ଥାନ ସେବା ସକ୍ରିୟ କରନ୍ତୁ।')
addPhrase('Unable to get your location.', 'आपका स्थान प्राप्त नहीं हो सका।', 'ଆପଣଙ୍କ ଅବସ୍ଥାନ ମିଳିଲା ନାହିଁ।')
addPhrase('Location access was denied.', 'स्थान अनुमति अस्वीकार कर दी गई।', 'ଅବସ୍ଥାନ ଅନୁମତି ନାକୋଚ ହୋଇଛି।')
addPhrase('Please click the button below to try again, or enable location access in your browser settings.', 'कृपया फिर से प्रयास करने के लिए नीचे दिए गए बटन पर क्लिक करें, या ब्राउज़र सेटिंग्स में स्थान अनुमति सक्षम करें।', 'ପୁଣି ଚେଷ୍ଟା କରିବା ପାଇଁ ଦୟାକରି ନିମ୍ନସ୍ଥ ବଟନ୍‌କୁ କ୍ଲିକ୍ କରନ୍ତୁ, କିମ୍ବା ବ୍ରାଉଜର ସେଟିଂସରେ ଅବସ୍ଥାନ ଅନୁମତି ସକ୍ରିୟ କରନ୍ତୁ।')
addPhrase('Location information is unavailable. Please check your device location settings.', 'स्थान की जानकारी उपलब्ध नहीं है। कृपया अपने डिवाइस की लोकेशन सेटिंग्स जाँचें।', 'ଅବସ୍ଥାନ ସୂଚନା ଉପଲବ୍ଧ ନାହିଁ। ଦୟାକରି ଆପଣଙ୍କ ଡିଭାଇସର ଲୋକେସନ୍ ସେଟିଂସ୍ ଯାଞ୍ଚ କରନ୍ତୁ।')
addPhrase('Location request timed out. Please try again.', 'स्थान अनुरोध का समय समाप्त हो गया। कृपया फिर से प्रयास करें।', 'ଅବସ୍ଥାନ ଅନୁରୋଧର ସମୟ ସମାପ୍ତ ହେଲା। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।')
addPhrase('An unknown error occurred. Please try again.', 'एक अज्ञात त्रुटि हुई। कृपया फिर से प्रयास करें।', 'ଏକ ଅଜଣା ତ୍ରୁଟି ଘଟିଛି। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।')
addPhrase('Warning: No attachments could be processed. The case will be created without saved documents.', 'चेतावनी: कोई भी अटैचमेंट प्रोसेस नहीं हो सका। मामला बिना सहेजे गए दस्तावेज़ों के बनाया जाएगा।', 'ସଚେତନତା: କୌଣସି ସଂଲଗ୍ନକ ପ୍ରକ୍ରିୟାକରଣ ହୋଇପାରିଲା ନାହିଁ। ମାମଲା ସଞ୍ଚିତ ଦଳିଲ ବିନା ସୃଷ୍ଟି ହେବ।')
addPhrase('Submit failed:', 'जमा विफल:', 'ଦାଖଲ ବିଫଳ:')
addPhrase('Firestore permission denied. Please update Firestore security rules in Firebase Console to allow case creation.', 'Firestore अनुमति अस्वीकृत है। केस बनाने की अनुमति देने के लिए Firebase Console में Firestore सुरक्षा नियम अपडेट करें।', 'Firestore ଅନୁମତି ନାକୋଚ ହୋଇଛି। କେସ୍ ସୃଷ୍ଟିକୁ ଅନୁମତି ଦେବା ପାଇଁ Firebase Console ରେ Firestore ସୁରକ୍ଷା ନିୟମ ଅଦ୍ୟତନ କରନ୍ତୁ।')
addPhrase('Request blocked by browser extension or ad blocker. Please disable ad blockers for this site and try again.', 'ब्राउज़र एक्सटेंशन या ऐड-ब्लॉकर ने अनुरोध रोक दिया। कृपया इस साइट के लिए ऐड-ब्लॉकर बंद करके फिर प्रयास करें।', 'ବ୍ରାଉଜର ଏକ୍ସଟେନସନ୍ କିମ୍ବା ଆଡ୍-ବ୍ଲକର୍ ଅନୁରୋଧକୁ ଅଟକାଇଛି। ଦୟାକରି ଏହି ସାଇଟ୍ ପାଇଁ ଆଡ୍-ବ୍ଲକର୍ ବନ୍ଦ କରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।')
addPhrase('CORS Error: Please configure Firebase Storage CORS. See console for details.', 'CORS त्रुटि: कृपया Firebase Storage CORS कॉन्फ़िगर करें। विवरण के लिए कंसोल देखें।', 'CORS ତ୍ରୁଟି: ଦୟାକରି Firebase Storage CORS କନଫିଗର୍ କରନ୍ତୁ। ବିବରଣୀ ପାଇଁ କନସୋଲ୍ ଦେଖନ୍ତୁ।')
addPhrase('Network error: Please check your internet connection and try again.', 'नेटवर्क त्रुटि: कृपया अपना इंटरनेट कनेक्शन जाँचें और फिर प्रयास करें।', 'ନେଟୱର୍କ ତ୍ରୁଟି: ଦୟାକରି ଆପଣଙ୍କ ଇନ୍ଟରନେଟ୍ ସଂଯୋଗ ଯାଞ୍ଚ କରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।')
addPhrase('Complaint created by victim', 'शिकायत पीड़ित द्वारा बनाई गई', 'ଅଭିଯୋଗ ପୀଡ଼ିତଙ୍କ ଦ୍ୱାରା ସୃଷ୍ଟି')
addPhrase('Pending', 'लंबित', 'ଲମ୍ବିତ')
addPhrase('In Process', 'प्रक्रिया में', 'ପ୍ରକ୍ରିୟାରେ')
addPhrase('Funds Frozen', 'धनराशि फ्रीज़', 'ଧନରାଶି ଫ୍ରିଜ୍')
addPhrase('Refunded', 'रिफंड हुआ', 'ଫେରତ ହୋଇଛି')
addPhrase('Closed', 'बंद', 'ବନ୍ଦ')
addPhrase('Awaiting first review', 'पहली समीक्षा की प्रतीक्षा में', 'ପ୍ରଥମ ସମୀକ୍ଷା ପାଇଁ ଅପେକ୍ଷାରତ')
addPhrase('Investigation in progress', 'जांच जारी है', 'ତଦନ୍ତ ଚାଲିଛି')
addPhrase('Funds action completed', 'धनराशि पर कार्रवाई पूरी', 'ଧନରାଶି ସମ୍ବନ୍ଧୀୟ କାର୍ଯ୍ୟ ସମାପ୍ତ')
addPhrase('Resolved successfully', 'सफलतापूर्वक समाधान हुआ', 'ସଫଳତାର ସହିତ ସମାଧାନ ହେଲା')
addPhrase('Manage your submitted applications, monitor live progress, and keep every important update in one place.', 'अपने जमा किए गए आवेदनों को संभालें, लाइव प्रगति देखें और हर महत्वपूर्ण अपडेट एक ही जगह पर रखें।', 'ଆପଣଙ୍କ ଦାଖଲ ହୋଇଥିବା ଆବେଦନଗୁଡ଼ିକୁ ପରିଚାଳନା କରନ୍ତୁ, ଲାଇଭ୍ ପ୍ରଗତି ଦେଖନ୍ତୁ ଏବଂ ସମସ୍ତ ଦରକାରୀ ଅଦ୍ୟତନ ଏକ ସ୍ଥାନରେ ରଖନ୍ତୁ।')
addPhrase('Today', 'आज', 'ଆଜି')
addPhrase('Resolution Rate', 'समाधान दर', 'ସମାଧାନ ହାର')
addPhrase('Combined reported loss value', 'कुल रिपोर्ट की गई हानि राशि', 'ମୋଟ ରିପୋର୍ଟ ହୋଇଥିବା କ୍ଷତିର ମୂଲ୍ୟ')
addPhrase('Average Claim', 'औसत दावा', 'ସରାସରି ଦାବି')
addPhrase('Average amount per application', 'प्रति आवेदन औसत राशि', 'ପ୍ରତି ଆବେଦନର ସରାସରି ରାଶି')
addPhrase('File New Complaint', 'नई शिकायत दर्ज करें', 'ନୂତନ ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ')
addPhrase('Open Application Tracker', 'आवेदन ट्रैकर खोलें', 'ଆବେଦନ ଟ୍ରାକର୍ ଖୋଲନ୍ତୁ')
addPhrase('Account Snapshot', 'खाते का सारांश', 'ଖାତାର ସାରାଂଶ')
addPhrase('Focused Application', 'केंद्रित आवेदन', 'କେନ୍ଦ୍ରିତ ଆବେଦନ')
addPhrase('Logged-in User Profile', 'लॉग-इन उपयोगकर्ता प्रोफ़ाइल', 'ଲଗ୍-ଇନ୍ ବ୍ୟବହାରକାରୀ ପ୍ରୋଫାଇଲ୍')
addPhrase('normal', 'सामान्य', 'ସାଧାରଣ')
addPhrase('bank', 'बैंक', 'ବ୍ୟାଙ୍କ')
addPhrase('police', 'पुलिस', 'ପୋଲିସ')
addPhrase('Email', 'ईमेल', 'ଇମେଲ୍')
addPhrase('Member Since', 'सदस्य बने', 'ସଦସ୍ୟ ହୋଇଛନ୍ତି')
addPhrase('Recently joined', 'हाल ही में जुड़े', 'ସମ୍ପ୍ରତି ଯୋଗଦେଇଛନ୍ତି')
addPhrase('Latest Application', 'नवीनतम आवेदन', 'ସବୁଠାରୁ ନବୀନ ଆବେଦନ')
addPhrase('Opened From Notification', 'सूचना से खोला गया', 'ବିଜ୍ଞପ୍ତିରୁ ଖୋଲାଗଲା')
addPhrase('Current Focus', 'वर्तमान फोकस', 'ବର୍ତ୍ତମାନର ଫୋକସ୍')
addPhrase('No active focus', 'कोई सक्रिय फोकस नहीं', 'କୌଣସି ସକ୍ରିୟ ଫୋକସ୍ ନାହିଁ')
addPhrase('This application was highlighted from a dashboard notification link.', 'यह आवेदन डैशबोर्ड सूचना लिंक से प्रमुख रूप से खोला गया था।', 'ଏହି ଆବେଦନଟି ଡ୍ୟାଶବୋର୍ଡ ବିଜ୍ଞପ୍ତି ଲିଙ୍କରୁ ମୁଖ୍ୟ ଭାବରେ ଖୋଲାଯାଇଥିଲା।')
addPhrase('Your latest application remains pinned here for quick review.', 'आपका नवीनतम आवेदन त्वरित समीक्षा के लिए यहाँ पिन रहेगा।', 'ଆପଣଙ୍କ ନବୀନତମ ଆବେଦନ ଦ୍ରୁତ ସମୀକ୍ଷା ପାଇଁ ଏଠାରେ ପିନ୍ ହୋଇ ରହିବ।')
addPhrase('Once you file an application, its live status will appear here.', 'जैसे ही आप आवेदन दर्ज करेंगे, उसकी लाइव स्थिति यहाँ दिखाई देगी।', 'ଆପଣ ଆବେଦନ ଦାଖଲ କରିବା ପରେ ତାହାର ଲାଇଭ୍ ସ୍ଥିତି ଏଠାରେ ଦେଖାଯିବ।')
addPhrase('Applications Submitted', 'जमा किए गए आवेदन', 'ଦାଖଲ ହୋଇଥିବା ଆବେଦନ')
addPhrase('All complaints linked to your account', 'आपके खाते से जुड़ी सभी शिकायतें', 'ଆପଣଙ୍କ ଖାତା ସହ ଯୋଡାଯାଇଥିବା ସମସ୍ତ ଅଭିଯୋଗ')
addPhrase('Pending Review', 'समीक्षा लंबित', 'ସମୀକ୍ଷା ଲମ୍ବିତ')
addPhrase('New applications waiting for first action', 'पहली कार्रवाई की प्रतीक्षा में नए आवेदन', 'ପ୍ରଥମ କାର୍ଯ୍ୟପଦକ୍ଷେପ ପାଇଁ ଅପେକ୍ଷାରତ ନୂତନ ଆବେଦନ')
addPhrase('Active Cases', 'सक्रिय मामले', 'ସକ୍ରିୟ ମାମଲା')
addPhrase('Applications currently under active processing', 'वर्तमान में सक्रिय प्रक्रिया में आवेदन', 'ବର୍ତ୍ତମାନ ସକ୍ରିୟ ପ୍ରକ୍ରିୟାରେ ଥିବା ଆବେଦନ')
addPhrase('Applications marked refunded or closed', 'रिफंड या बंद चिह्नित आवेदन', 'ରିଫଣ୍ଡ କିମ୍ବା ବନ୍ଦ ଭାବେ ଚିହ୍ନିତ ଆବେଦନ')
addPhrase('Application Performance', 'आवेदन प्रदर्शन', 'ଆବେଦନ କାର୍ଯ୍ୟଦକ୍ଷତା')
addPhrase('Live view of your submitted applications and outcomes', 'आपके जमा किए गए आवेदनों और उनके परिणामों का लाइव दृश्य', 'ଆପଣଙ୍କ ଦାଖଲ ଆବେଦନ ଏବଂ ସେମାନଙ୍କର ଫଳାଫଳର ଲାଇଭ୍ ଭ୍ୟୁ')
addPhrase('Submitted vs resolved applications over the last 6 months', 'पिछले 6 महीनों में जमा बनाम समाधान हुए आवेदन', 'ଗତ 6 ମାସରେ ଦାଖଲ ବନାମ ସମାଧାନ ହୋଇଥିବା ଆବେଦନ')
addPhrase('Submitted', 'जमा किए गए', 'ଦାଖଲ ହୋଇଥିବା')
addPhrase('File your first application to unlock trend analytics.', 'ट्रेंड एनालिटिक्स देखने के लिए अपना पहला आवेदन दर्ज करें।', 'ଟ୍ରେଣ୍ଡ ବିଶ୍ଳେଷଣ ଦେଖିବା ପାଇଁ ଆପଣଙ୍କ ପ୍ରଥମ ଆବେଦନ ଦାଖଲ କରନ୍ତୁ।')
addPhrase('How your applications are distributed by current status', 'आपके आवेदन वर्तमान स्थिति के अनुसार कैसे वितरित हैं', 'ବର୍ତ୍ତମାନ ସ୍ଥିତି ଅନୁସାରେ ଆପଣଙ୍କ ଆବେଦନ କିପରି ବଣ୍ଟନ ହୋଇଛି')
addPhrase('Status insights will appear after your first complaint.', 'पहली शिकायत के बाद स्थिति संबंधी जानकारी दिखाई देगी।', 'ପ୍ରଥମ ଅଭିଯୋଗ ପରେ ସ୍ଥିତି ସମ୍ବନ୍ଧୀୟ ତଥ୍ୟ ଦେଖାଯିବ।')
addPhrase('Status Tracker', 'स्थिति ट्रैकर', 'ସ୍ଥିତି ଟ୍ରାକର୍')
addPhrase('All Application Status', 'सभी आवेदनों की स्थिति', 'ସମସ୍ତ ଆବେଦନର ସ୍ଥିତି')
addPhrase('Review every complaint, current stage, and the latest operational note.', 'हर शिकायत, वर्तमान चरण और नवीनतम परिचालन टिप्पणी की समीक्षा करें।', 'ପ୍ରତ୍ୟେକ ଅଭିଯୋଗ, ବର୍ତ୍ତମାନର ପର୍ଯ୍ୟାୟ ଏବଂ ନବୀନତମ କାର୍ଯ୍ୟାତ୍ମକ ଟିପ୍ପଣୀକୁ ସମୀକ୍ଷା କରନ୍ତୁ।')
addPhrase('Open Detailed Tracker', 'विस्तृत ट्रैकर खोलें', 'ବିସ୍ତୃତ ଟ୍ରାକର୍ ଖୋଲନ୍ତୁ')
addPhrase('Loading your applications...', 'आपके आवेदन लोड हो रहे हैं...', 'ଆପଣଙ୍କ ଆବେଦନଗୁଡ଼ିକ ଲୋଡ୍ ହେଉଛି...')
addPhrase('Start your first complaint to unlock live tracking, analytics, and end-to-end status updates.', 'लाइव ट्रैकिंग, एनालिटिक्स और पूर्ण स्थिति अपडेट देखने के लिए अपनी पहली शिकायत शुरू करें।', 'ଲାଇଭ୍ ଟ୍ରାକିଂ, ବିଶ୍ଳେଷଣ ଏବଂ ସମ୍ପୂର୍ଣ୍ଣ ସ୍ଥିତି ଅଦ୍ୟତନ ପାଇଁ ଆପଣଙ୍କ ପ୍ରଥମ ଅଭିଯୋଗ ଆରମ୍ଭ କରନ୍ତୁ।')
addPhrase('Cyber Fraud Complaint', 'साइबर धोखाधड़ी शिकायत', 'ସାଇବର ଠକେଇ ଅଭିଯୋଗ')
addPhrase('Focused', 'चयनित', 'କେନ୍ଦ୍ରିତ')
addPhrase('Last Updated', 'अंतिम अपडेट', 'ଶେଷ ଅଦ୍ୟତନ')
addPhrase('Current Stage', 'वर्तमान चरण', 'ବର୍ତ୍ତମାନର ପର୍ଯ୍ୟାୟ')
addPhrase('Latest Update', 'नवीनतम अपडेट', 'ନବୀନତମ ଅଦ୍ୟତନ')
addPhrase('Latest Updates', 'नवीनतम अपडेट्स', 'ନବୀନତମ ଅଦ୍ୟତନଗୁଡ଼ିକ')
addPhrase('Activity from your application timeline will appear here once a case is created.', 'मामला बनते ही आपकी आवेदन समयरेखा की गतिविधि यहाँ दिखाई देगी।', 'ମାମଲା ସୃଷ୍ଟି ହେଲେ ଆପଣଙ୍କ ଆବେଦନ ଟାଇମଲାଇନ୍‌ର କାର୍ଯ୍ୟକଳାପ ଏଠାରେ ଦେଖାଯିବ।')
addPhrase('Guidance', 'मार्गदर्शन', 'ମାର୍ଗଦର୍ଶନ')
addPhrase('After your first complaint, the dashboard will show which applications need the most attention.', 'पहली शिकायत के बाद डैशबोर्ड दिखाएगा कि किन आवेदनों पर सबसे अधिक ध्यान चाहिए।', 'ପ୍ରଥମ ଅଭିଯୋଗ ପରେ ଡ୍ୟାଶବୋର୍ଡ ଦେଖାଇବ କେଉଁ ଆବେଦନଗୁଡ଼ିକୁ ସର୍ବାଧିକ ଧ୍ୟାନ ଦରକାର।')
addPhrase('Keep your evidence and transaction details ready while the first review is pending.', 'पहली समीक्षा लंबित रहने तक अपने प्रमाण और लेनदेन विवरण तैयार रखें।', 'ପ୍ରଥମ ସମୀକ୍ଷା ଲମ୍ବିତ ଥିବା ସମୟରେ ଆପଣଙ୍କ ପ୍ରମାଣ ଓ ଲେନଦେନ ବିବରଣୀ ପ୍ରସ୍ତୁତ ରଖନ୍ତୁ।')
addPhrase('Stay reachable for calls or messages while the investigation is active.', 'जांच सक्रिय रहने तक कॉल या संदेशों के लिए उपलब्ध रहें।', 'ତଦନ୍ତ ସକ୍ରିୟ ଥିବାବେଳେ କଲ୍ କିମ୍ବା ସନ୍ଦେଶ ପାଇଁ ଉପଲବ୍ଧ ରୁହନ୍ତୁ।')
addPhrase('Monitor the tracker closely for the next refund or closure update.', 'अगले रिफंड या क्लोजर अपडेट के लिए ट्रैकर पर नज़र बनाए रखें।', 'ପରବର୍ତ୍ତୀ ରିଫଣ୍ଡ କିମ୍ବା ବନ୍ଦ ଅଦ୍ୟତନ ପାଇଁ ଟ୍ରାକର୍‌କୁ ସାବଧାନତାର ସହ ଦେଖନ୍ତୁ।')
addPhrase('Refund is processed. Keep your case ID saved for records.', 'रिफंड प्रक्रिया पूरी हो गई है। रिकॉर्ड के लिए अपना केस ID सुरक्षित रखें।', 'ରିଫଣ୍ଡ ପ୍ରକ୍ରିୟା ସମାପ୍ତ। ରେକର୍ଡ ପାଇଁ ଆପଣଙ୍କ କେସ୍ ID ସଞ୍ଚୟ କରିରଖନ୍ତୁ।')
addPhrase('Review the case outcome and keep the reference if you need it later.', 'मामले के परिणाम की समीक्षा करें और आगे जरूरत हो तो संदर्भ सुरक्षित रखें।', 'ମାମଲାର ଫଳାଫଳ ସମୀକ୍ଷା କରନ୍ତୁ ଏବଂ ପରେ ଆବଶ୍ୟକ ହେଲେ ସନ୍ଦର୍ଭ ରଖନ୍ତୁ।')
addPhrase('Application created', 'आवेदन बनाया गया', 'ଆବେଦନ ସୃଷ୍ଟି ହେଲା')
addPhrase('Application updated', 'आवेदन अपडेट किया गया', 'ଆବେଦନ ଅଦ୍ୟତନ ହେଲା')
addPhrase('Your dashboard could not load application data because Firestore access is restricted.', 'Firestore पहुँच सीमित होने के कारण आपका डैशबोर्ड आवेदन डेटा लोड नहीं कर सका।', 'Firestore ଅଭିଗମ ଶୀମିତ ଥିବାରୁ ଆପଣଙ୍କ ଡ୍ୟାଶବୋର୍ଡ ଆବେଦନ ତଥ୍ୟ ଲୋଡ୍ କରିପାରିଲା ନାହିଁ।')
addPhrase('Live dashboard updates are being blocked by browser privacy or extension settings.', 'ब्राउज़र गोपनीयता या एक्सटेंशन सेटिंग्स लाइव डैशबोर्ड अपडेट को ब्लॉक कर रही हैं।', 'ବ୍ରାଉଜର ଗୋପନୀୟତା କିମ୍ବା ଏକ୍ସଟେନସନ୍ ସେଟିଂସ୍ ଲାଇଭ୍ ଡ୍ୟାଶବୋର୍ଡ ଅଦ୍ୟତନକୁ ଅବରୋଧ କରୁଛି।')
addPhrase('We could not load your application dashboard right now.', 'हम अभी आपका आवेदन डैशबोर्ड लोड नहीं कर सके।', 'ଆମେ ବର୍ତ୍ତମାନ ଆପଣଙ୍କ ଆବେଦନ ଡ୍ୟାଶବୋର୍ଡ ଲୋଡ୍ କରିପାରୁନାହୁଁ।')
addPhrase('UPI Fraud', 'UPI धोखाधड़ी', 'UPI ଠକେଇ')
addPhrase('OTP Scam', 'OTP घोटाला', 'OTP ଠକେଇ')
addPhrase('Online Job Scam', 'ऑनलाइन नौकरी घोटाला', 'ଅନଲାଇନ୍ ଚାକିରି ଠକେଇ')
addPhrase('Sextortion', 'सेक्सटॉर्शन', 'ସେକ୍ସଟର୍ସନ୍')
addPhrase('Loan App Fraud', 'लोन ऐप धोखाधड़ी', 'ଲୋନ୍ ଆପ୍ ଠକେଇ')
addPhrase('Credit Card Fraud', 'क्रेडिट कार्ड धोखाधड़ी', 'କ୍ରେଡିଟ୍ କାର୍ଡ ଠକେଇ')
addPhrase('Debit Card Fraud', 'डेबिट कार्ड धोखाधड़ी', 'ଡେବିଟ୍ କାର୍ଡ ଠକେଇ')
addPhrase('Online Shopping Fraud', 'ऑनलाइन शॉपिंग धोखाधड़ी', 'ଅନଲାଇନ୍ ଶପିଂ ଠକେଇ')
addPhrase('Social Media Fraud', 'सोशल मीडिया धोखाधड़ी', 'ସୋସିଆଲ୍ ମିଡିଆ ଠକେଇ')
addPhrase('Investment Scam', 'निवेश घोटाला', 'ନିବେଶ ଠକେଇ')
addPhrase('Romance Scam', 'रोमांस घोटाला', 'ରୋମାନ୍ସ ଠକେଇ')

const PHRASE_MAP = {
  hi: buildPhraseMap('hi'),
  od: buildPhraseMap('od')
}

const textNodeOriginals = new WeakMap()
const attributeOriginals = new WeakMap()

export function normalizeLanguage(input) {
  if (!input) return 'en'
  const next = String(input).trim().toLowerCase()
  return LANGUAGE_ALIASES[next] || 'en'
}

export function getLanguageMeta(lang) {
  return LANGUAGE_OPTIONS.find((item) => item.value === normalizeLanguage(lang)) || LANGUAGE_OPTIONS[0]
}

export function getLocaleForLanguage(lang) {
  return getLanguageMeta(lang).locale
}

export function getHtmlLang(lang) {
  return getLanguageMeta(lang).htmlLang
}

export function getInitialLanguage() {
  if (typeof window === 'undefined') return 'en'

  const storedValue = window.localStorage.getItem(STORAGE_KEY)
  if (storedValue) return normalizeLanguage(storedValue)

  return normalizeLanguage(window.navigator.language)
}

export function normalizeLookupKey(text) {
  return String(text).replace(/\s+/g, ' ').trim()
}

function buildPhraseMap(lang) {
  return Object.fromEntries(
    Object.entries(PHRASES).map(([key, value]) => [normalizeLookupKey(key), value[lang]])
  )
}

function splitSpacing(text) {
  const leading = text.match(/^\s*/)?.[0] || ''
  const trailing = text.match(/\s*$/)?.[0] || ''
  return {
    leading,
    trailing,
    core: text.slice(leading.length, text.length - trailing.length)
  }
}

function withOriginalSpacing(original, translatedCore) {
  const { leading, trailing } = splitSpacing(original)
  return `${leading}${translatedCore}${trailing}`
}

function translateCompound(text, lang) {
  const colonIndex = text.indexOf(':')
  if (colonIndex > 0 && colonIndex < text.length - 1) {
    const left = text.slice(0, colonIndex)
    const right = text.slice(colonIndex + 1)
    const translatedLeft = translateText(left, lang)
    const translatedRight = translateText(right, lang)
    if (translatedLeft !== left || translatedRight !== right) {
      return `${translatedLeft}:${translatedRight}`
    }
  }

  const bracketMatch = text.match(/^(.*)\(([^)]+)\)(.*)$/)
  if (bracketMatch) {
    const [, before, inside, after] = bracketMatch
    const translatedBefore = translateText(before, lang)
    const translatedInside = translateText(inside, lang)
    if (translatedBefore !== before || translatedInside !== inside) {
      return `${translatedBefore.trim()} (${translatedInside.trim()})${after}`
    }
  }

  return null
}

function translatePatterns(text, lang) {
  if (lang === 'en') return text

  const locale = getLocaleForLanguage(lang)
  const numberFormat = new Intl.NumberFormat(locale)

  const countMatch = text.match(/^(\d+)\s+(.+)$/)
  if (countMatch) {
    const [, count, label] = countMatch
    const translatedLabel = translateText(label, lang)
    if (translatedLabel !== label) {
      return `${numberFormat.format(Number(count))} ${translatedLabel}`
    }
  }

  const percentMatch = text.match(/^(\d+)%\s+(.+)$/)
  if (percentMatch) {
    const [, value, label] = percentMatch
    const translatedLabel = translateText(label, lang)
    if (translatedLabel !== label) {
      return `${numberFormat.format(Number(value))}% ${translatedLabel}`
    }
  }

  const welcomeMatch = text.match(/^Welcome back,\s+(.+)$/)
  if (welcomeMatch) {
    return lang === 'hi'
      ? `वापसी पर स्वागत है, ${welcomeMatch[1]}`
      : `${welcomeMatch[1]}, ପୁନର୍ବାର ସ୍ୱାଗତ`
  }

  const activeMatch = text.match(/^(\d+)\s+active application(?:s)?\s+need monitoring$/)
  if (activeMatch) {
    const count = numberFormat.format(Number(activeMatch[1]))
    return lang === 'hi'
      ? `${count} सक्रिय आवेदन निगरानी चाहते हैं`
      : `${count}ଟି ସକ୍ରିୟ ଆବେଦନ ନିରୀକ୍ଷଣ ଆବଶ୍ୟକ`
  }

  const stepMatch = text.match(/^Step\s+(\d+)\s+of\s+(\d+)$/)
  if (stepMatch) {
    const current = numberFormat.format(Number(stepMatch[1]))
    const total = numberFormat.format(Number(stepMatch[2]))
    return lang === 'hi'
      ? `चरण ${current} / ${total}`
      : `ପର୍ଯ୍ୟାୟ ${current} / ${total}`
  }

  return text
}

export function translateText(value, lang) {
  const nextLang = normalizeLanguage(lang)
  if (nextLang === 'en' || value == null) return value

  const source = String(value)
  const { core } = splitSpacing(source)
  if (!core || !/[A-Za-z]/.test(core)) return value

  const map = PHRASE_MAP[nextLang] || {}
  const direct = map[normalizeLookupKey(core)]
  if (direct) return withOriginalSpacing(source, direct)

  const strippedCore = core.replace(/([.?!])$/, '')
  const strippedDirect = map[normalizeLookupKey(strippedCore)]
  if (strippedDirect) {
    return withOriginalSpacing(source, `${strippedDirect}${core.slice(strippedCore.length)}`)
  }

  const compound = translateCompound(core, nextLang)
  if (compound) return withOriginalSpacing(source, compound)

  const patterned = translatePatterns(core, nextLang)
  if (patterned !== core) return withOriginalSpacing(source, patterned)

  return value
}

function getAttributeMap(element) {
  let existing = attributeOriginals.get(element)
  if (!existing) {
    existing = new Map()
    attributeOriginals.set(element, existing)
  }
  return existing
}

function shouldSkipNode(parentElement) {
  if (!parentElement) return true
  if (parentElement.closest('[data-no-translate="true"]')) return true
  return ['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE'].includes(parentElement.tagName)
}

function nextTranslatedValue(originalValue, lang) {
  return lang === 'en' ? originalValue : translateText(originalValue, lang)
}

function translateTextNodes(root, lang) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes = []
  let currentNode = walker.nextNode()

  while (currentNode) {
    nodes.push(currentNode)
    currentNode = walker.nextNode()
  }

  for (const node of nodes) {
    if (shouldSkipNode(node.parentElement)) continue

    const currentValue = node.nodeValue || ''
    const originalValue = textNodeOriginals.get(node) ?? currentValue
    if (!textNodeOriginals.has(node)) textNodeOriginals.set(node, originalValue)

    const translated = nextTranslatedValue(originalValue, lang)
    if (translated !== currentValue) {
      node.nodeValue = translated
    }
  }
}

function translateAttributes(root, lang) {
  const elements = root.querySelectorAll('[placeholder],[title],[aria-label],[alt],input[type="button"],input[type="submit"],input[type="reset"]')
  const attributes = ['placeholder', 'title', 'aria-label', 'alt']

  for (const element of elements) {
    if (element.closest('[data-no-translate="true"]')) continue

    const map = getAttributeMap(element)

    for (const attribute of attributes) {
      if (!element.hasAttribute(attribute)) continue

      const currentValue = element.getAttribute(attribute) || ''
      const originalValue = map.get(attribute) ?? currentValue
      if (!map.has(attribute)) map.set(attribute, originalValue)

      const translated = nextTranslatedValue(originalValue, lang)
      if (translated !== currentValue) {
        element.setAttribute(attribute, translated)
      }
    }

    if (element instanceof HTMLInputElement && ['button', 'submit', 'reset'].includes(element.type)) {
      const currentValue = element.value || ''
      const originalValue = map.get('value') ?? currentValue
      if (!map.has('value')) map.set('value', originalValue)

      const translated = nextTranslatedValue(originalValue, lang)
      if (translated !== currentValue) {
        element.value = translated
      }
    }
  }
}

export function applyLanguageToDom(root, lang) {
  if (!(root instanceof HTMLElement)) return
  translateTextNodes(root, lang)
  translateAttributes(root, lang)
}

export function setupDomTranslation(lang) {
  if (typeof document === 'undefined') return () => {}
  const root = document.body
  if (!root) return () => {}

  let frameId = 0
  let applying = false

  const run = () => {
    if (applying) return
    applying = true
    applyLanguageToDom(root, lang)
    applying = false
  }

  const schedule = () => {
    if (frameId) cancelAnimationFrame(frameId)
    frameId = requestAnimationFrame(run)
  }

  const observer = new MutationObserver(() => {
    schedule()
  })

  observer.observe(root, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['placeholder', 'title', 'aria-label', 'alt', 'value']
  })

  schedule()

  return () => {
    observer.disconnect()
    if (frameId) cancelAnimationFrame(frameId)
  }
}

export function formatDateValue(value, locale, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (value == null || value === '') return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale, options).format(date)
}

export function formatDateTimeValue(value, locale, options = { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) {
  return formatDateValue(value, locale, options)
}

export function formatCurrencyValue(value, locale) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value) || 0)
}

export function formatNumberValue(value, locale, options) {
  return new Intl.NumberFormat(locale, options).format(Number(value) || 0)
}

export function formatRelativeTimeValue(value, locale) {
  if (!value) return ''

  const now = Date.now()
  const diff = Number(value) - now
  const seconds = Math.round(diff / 1000)
  const minutes = Math.round(seconds / 60)
  const hours = Math.round(minutes / 60)
  const days = Math.round(hours / 24)
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (Math.abs(days) >= 1) return formatter.format(days, 'day')
  if (Math.abs(hours) >= 1) return formatter.format(hours, 'hour')
  if (Math.abs(minutes) >= 1) return formatter.format(minutes, 'minute')
  return formatter.format(seconds || 0, 'second')
}
