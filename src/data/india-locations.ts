export interface District {
  name: string;
  taluks: string[];
}

export interface StateData {
  state: string;
  districts: District[];
}

export const statesAndDistricts: StateData[] = [
  {
    state: "Karnataka",
    districts: [
      { name: "Bagalkot", taluks: ["Bagalkot", "Badami", "Hungund", "Jamkhandi", "Bilagi", "Mudhol", "Ilkal", "Rabkavi Banhatti", "Guledgudda"] },
      { name: "Ballari", taluks: ["Ballari", "Kurugodu", "Kampli", "Sandur", "Siruguppa"] },
      { name: "Belagavi", taluks: ["Belagavi", "Athani", "Bailhongal", "Chikkodi", "Gokak", "Hukkeri", "Khanapur", "Ramdurg", "Raybag", "Saundatti", "Kittur", "Nippani", "Kagwad", "Mudalgi"] },
      { name: "Bengaluru Rural", taluks: ["Devanahalli", "Doddaballapura", "Hosakote", "Nelamangala"] },
      { name: "Bengaluru Urban", taluks: ["Bengaluru North", "Bengaluru South", "Bengaluru East", "Yelahanka", "Anekal"] },
      { name: "Bidar", taluks: ["Bidar", "Bhalki", "Homnabad", "Aurad", "Basavakalyan", "Kamalnagar", "Hulsoor"] },
      { name: "Chamarajanagar", taluks: ["Chamarajanagar", "Gundlupet", "Kollegal", "Yelandur", "Hanur"] },
      { name: "Chikkaballapur", taluks: ["Chikkaballapura", "Bagepalli", "Chintamani", "Gauribidanur", "Gudibanda", "Sidlaghatta"] },
      { name: "Chikkamagaluru", taluks: ["Chikkamagaluru", "Kadur", "Koppa", "Mudigere", "Narasimharajapura", "Sringeri", "Tarikere", "Ajjampura"] },
      { name: "Chitradurga", taluks: ["Chitradurga", "Challakere", "Hiriyur", "Holalkere", "Hosadurga", "Molakalmuru"] },
      { name: "Dakshina Kannada", taluks: ["Mangaluru", "Bantwal", "Belthangady", "Puttur", "Sullia", "Kadaba", "Moodabidri"] },
      { name: "Davanagere", taluks: ["Davanagere", "Harihar", "Honnali", "Jagalur", "Channagiri", "Nyamati"] },
      { name: "Dharwad", taluks: ["Dharwad", "Hubballi (Urban)", "Hubballi (Rural)", "Kundgol", "Navalgund", "Kalghatgi", "Alnavar", "Annigeri"] },
      { name: "Gadag", taluks: ["Gadag", "Mundargi", "Nargund", "Ron", "Shirahatti", "Gajendragad", "Lakshmeshwar"] },
      { name: "Hassan", taluks: ["Hassan", "Alur", "Arkalgud", "Arsikere", "Belur", "Channarayapatna", "Holenarasipura", "Sakleshpur"] },
      { name: "Haveri", taluks: ["Haveri", "Byadgi", "Hanagal", "Hirekerur", "Ranibennur", "Savanur", "Shiggaon", "Rattihalli"] },
      { name: "Kalaburagi", taluks: ["Kalaburagi", "Aland", "Afzalpur", "Chincholi", "Chittapur", "Jevargi", "Sedam", "Shahabad", "Kalgi", "Kamalapur", "Yedrami"] },
      { name: "Kodagu", taluks: ["Madikeri", "Somwarpet", "Virajpet"] },
      { name: "Kolar", taluks: ["Kolar", "Bangarapet", "Malur", "Mulbagal", "Srinivaspur", "Kolar Gold Fields (KGF)"] },
      { name: "Koppal", taluks: ["Koppal", "Gangawati", "Kushtagi", "Yelburga", "Kanakagiri", "Karatagi", "Kukanoor"] },
      { name: "Mandya", taluks: ["Mandya", "Maddur", "Malavalli", "Nagamangala", "Pandavapura", "Krishnarajpet", "Srirangapatna"] },
      { name: "Mysuru", taluks: ["Mysuru", "Hunsur", "Krishnarajanagara", "Nanjangud", "Piriyapatna", "T.Narsipura", "Saragur", "Saligrama"] },
      { name: "Raichur", taluks: ["Raichur", "Devadurga", "Lingsugur", "Manvi", "Sindhanur", "Maski", "Sirwar"] },
      { name: "Ramanagara", taluks: ["Ramanagara", "Channapatna", "Kanakapura", "Magadi"] },
      { name: "Shivamogga", taluks: ["Shivamogga", "Bhadravathi", "Hosanagara", "Sagar", "Shikaripura", "Soraba", "Thirthahalli"] },
      { name: "Tumakuru", taluks: ["Tumakuru", "Chikkanayakanahalli", "Gubbi", "Koratagere", "Kunigal", "Madhugiri", "Pavagada", "Sira", "Tiptur", "Turuvekere"] },
      { name: "Udupi", taluks: ["Udupi", "Brahmavara", "Kapu", "Kundapura", "Byndoor", "Karkala", "Hebri"] },
      { name: "Uttara Kannada", taluks: ["Karwar", "Ankola", "Bhatkal", "Haliyal", "Honnavar", "Joida", "Kumta", "Mundgod", "Siddapur", "Sirsi", "Yellapur", "Dandeli"] },
      { name: "Vijayapura", taluks: ["Vijayapura", "Indi", "Muddebihal", "Sindagi", "Basavana Bagewadi", "Babaleshwar", "Chadchan", "Tikota", "Nidagundi", "Devara Hipparagi", "Talikoti", "Almel"] },
      { name: "Yadgir", taluks: ["Yadgir", "Shahapur", "Shorapur", "Gurmitkal", "Hunasagi", "Wadgera"] },
      { name: "Vijayanagara", taluks: ["Hosapete", "Kudligi", "Hagaribommanahalli", "Kotturu", "Hoovina Hadagali", "Harapanahalli"] }
    ]
  },
  {
    state: "Maharashtra",
    districts: [
      { name: "Mumbai City", taluks: ["Mumbai City"] },
      { name: "Mumbai Suburban", taluks: ["Kurla", "Andheri", "Borivali"] },
      { name: "Pune", taluks: ["Pune City", "Haveli", "Khed", "Baramati", "Shirur", "Maval", "Mulshi", "Bhor", "Indapur", "Purandar", "Velhe", "Junner", "Ambegaon", "Daund"] },
      { name: "Nagpur", taluks: ["Nagpur", "Nagpur Rural", "Kamptee", "Hingna", "Katol", "Kalameshwar", "Ramtek", "Mouda", "Umred", "Bhiwapur", "Kuhi", "Narkhed", "Savner", "Parseoni"] }
    ]
  },
  {
    state: "Delhi",
    districts: [
      { name: "New Delhi", taluks: ["Chanakyapuri", "Delhi Cantonment", "Vasant Vihar"] },
      { name: "South Delhi", taluks: ["Saket", "Hauz Khas", "Mehrauli"] },
      { name: "North Delhi", taluks: ["Model Town", "Narela", "Alipur"] }
    ]
  },
  {
    state: "Tamil Nadu",
    districts: [
      { name: "Chennai", taluks: ["Alandur", "Ambattur", "Aminjikarai", "Ayanavaram", "Egmore", "Guindy", "Madhavaram", "Maduravoyal", "Mambalam", "Mylapore", "Perambur", "Purasawalkam", "Sholinganallur", "Tiruvottiyur", "Velachery"] },
      { name: "Coimbatore", taluks: ["Coimbatore North", "Coimbatore South", "Mettupalayam", "Pollachi", "Valparai"] }
    ]
  },
  {
    state: "Kerala",
    districts: [
      { name: "Thiruvananthapuram", taluks: ["Thiruvananthapuram", "Neyyattinkara", "Nedumangad", "Chirayinkeezhu", "Varkala", "Kattakada"] },
      { name: "Ernakulam", taluks: ["Kochi", "Kanayannur", "Aluva", "Kunnathunad", "Paravur", "Kothamangalam", "Muvattupuzha"] }
    ]
  },
  {
    state: "Telangana",
    districts: [
      { name: "Hyderabad", taluks: ["Hyderabad", "Musheerabad", "Ameerpet", "Khairatabad", "Shaikpet", "Golconda", "Himayatnagar", "Asifnagar", "Bahadurpura", "Nampally", "Charminar", "Saidabad", "Amberpet", "Secunderabad", "Trimulgherry", "Marredpally"] }
    ]
  }
];
