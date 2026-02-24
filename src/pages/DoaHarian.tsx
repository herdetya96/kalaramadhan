import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Doa {
  id: number;
  title: string;
  arabic: string;
  latin: string;
  translation: string;
  category: string;
}

const DOA_LIST: Doa[] = [
  { id: 1, title: "Doa Sebelum Makan", category: "Harian", arabic: "اَللّٰهُمَّ بَارِكْ لَنَا فِيْمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ", latin: "Allahumma baarik lanaa fiimaa razaqtanaa wa qinaa 'adzaa ban naar", translation: "Ya Allah, berkahilah kami dalam rezeki yang telah Engkau berikan kepada kami dan peliharalah kami dari siksa api neraka." },
  { id: 2, title: "Doa Sesudah Makan", category: "Harian", arabic: "اَلْحَمْدُ لِلّٰهِ الَّذِيْ أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِيْنَ", latin: "Alhamdulillaahil ladzii ath'amanaa wa saqaanaa wa ja'alanaa minal muslimiin", translation: "Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami termasuk orang-orang Islam." },
  { id: 3, title: "Doa Sebelum Tidur", category: "Harian", arabic: "بِاسْمِكَ اللّٰهُمَّ أَحْيَا وَأَمُوْتُ", latin: "Bismikallaahumma ahyaa wa amuut", translation: "Dengan menyebut nama-Mu ya Allah, aku hidup dan aku mati." },
  { id: 4, title: "Doa Bangun Tidur", category: "Harian", arabic: "اَلْحَمْدُ لِلّٰهِ الَّذِيْ أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُوْرُ", latin: "Alhamdulillaahil ladzii ahyaanaa ba'da maa amaatanaa wa ilaihin nusyuur", translation: "Segala puji bagi Allah yang telah menghidupkan kami sesudah mematikan kami dan kepada-Nya kami dikembalikan." },
  { id: 5, title: "Doa Masuk Masjid", category: "Ibadah", arabic: "اَللّٰهُمَّ افْتَحْ لِيْ أَبْوَابَ رَحْمَتِكَ", latin: "Allaahummaf tahlii abwaaba rahmatik", translation: "Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu." },
  { id: 6, title: "Doa Keluar Masjid", category: "Ibadah", arabic: "اَللّٰهُمَّ إِنِّيْ أَسْأَلُكَ مِنْ فَضْلِكَ", latin: "Allaahumma innii as-aluka min fadllik", translation: "Ya Allah, sesungguhnya aku memohon kepada-Mu dari karunia-Mu." },
  { id: 7, title: "Doa Masuk Kamar Mandi", category: "Harian", arabic: "اَللّٰهُمَّ إِنِّيْ أَعُوْذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ", latin: "Allaahumma innii a'uudzubika minal khubutsi wal khabaa-its", translation: "Ya Allah, sesungguhnya aku berlindung kepada-Mu dari godaan setan laki-laki dan setan perempuan." },
  { id: 8, title: "Doa Keluar Kamar Mandi", category: "Harian", arabic: "غُفْرَانَكَ", latin: "Ghufraanak", translation: "Aku memohon ampun kepada-Mu." },
  { id: 9, title: "Doa Bercermin", category: "Harian", arabic: "اَللّٰهُمَّ كَمَا حَسَّنْتَ خَلْقِيْ فَحَسِّنْ خُلُقِيْ", latin: "Allaahumma kamaa hassanta khalqii fahassin khuluqii", translation: "Ya Allah, sebagaimana Engkau perindah kejadianku, maka perindah pula akhlakku." },
  { id: 10, title: "Doa Keluar Rumah", category: "Harian", arabic: "بِسْمِ اللّٰهِ تَوَكَّلْتُ عَلَى اللّٰهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ", latin: "Bismillaahi tawakkaltu 'alallaahi laa hawla walaa quwwata illaa billaah", translation: "Dengan nama Allah, aku bertawakal kepada Allah, tidak ada daya dan kekuatan kecuali dengan pertolongan Allah." },
  { id: 11, title: "Doa Masuk Rumah", category: "Harian", arabic: "بِسْمِ اللّٰهِ وَلَجْنَا وَبِسْمِ اللّٰهِ خَرَجْنَا وَعَلَى اللّٰهِ رَبِّنَا تَوَكَّلْنَا", latin: "Bismillaahi walajnaa wa bismillaahi kharajnaa wa 'alallaahi rabbanaa tawakkalnaa", translation: "Dengan nama Allah kami masuk, dengan nama Allah kami keluar, dan kepada Allah Tuhan kami, kami bertawakal." },
  { id: 12, title: "Doa Berbuka Puasa", category: "Ramadan", arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوْقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللّٰهُ", latin: "Dzahabazh zhama-u wabtallatil 'uruuqu wa tsabatal ajru insyaa-Allaah", translation: "Telah hilang dahaga, urat-urat telah basah dan pahala telah ditetapkan, insya Allah." },
  { id: 13, title: "Doa Niat Puasa", category: "Ramadan", arabic: "نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هٰذِهِ السَّنَةِ لِلّٰهِ تَعَالَى", latin: "Nawaitu shauma ghadin 'an adaa-i fardhi syahri ramadhana haadzihis sanati lillaahi ta'aalaa", translation: "Aku niat berpuasa esok hari untuk menunaikan kewajiban di bulan Ramadan tahun ini karena Allah Ta'ala." },
  { id: 14, title: "Doa Naik Kendaraan", category: "Perjalanan", arabic: "سُبْحَانَ الَّذِيْ سَخَّرَ لَنَا هٰذَا وَمَا كُنَّا لَهُ مُقْرِنِيْنَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُوْنَ", latin: "Subhaanal ladzii sakhkhara lanaa haadzaa wa maa kunnaa lahuu muqriniin wa innaa ilaa rabbinaa lamunqalibuun", translation: "Maha Suci Allah yang telah menundukkan semua ini untuk kami padahal kami sebelumnya tidak mampu menguasainya. Dan sesungguhnya kami akan kembali kepada Tuhan kami." },
  { id: 15, title: "Doa Ketika Hujan", category: "Alam", arabic: "اَللّٰهُمَّ صَيِّبًا نَافِعًا", latin: "Allaahumma shayyiban naafi'an", translation: "Ya Allah, turunkanlah hujan yang bermanfaat." },
  { id: 16, title: "Doa Memakai Pakaian", category: "Harian", arabic: "اَلْحَمْدُ لِلّٰهِ الَّذِيْ كَسَانِيْ هٰذَا وَرَزَقَنِيْهِ مِنْ غَيْرِ حَوْلٍ مِنِّيْ وَلَا قُوَّةٍ", latin: "Alhamdulillaahil ladzii kasaanii haadzaa wa razaqaniihi min ghairi hawlin minnii walaa quwwah", translation: "Segala puji bagi Allah yang telah memberiku pakaian ini dan memberi rezeki tanpa daya dan kekuatan dariku." },
];

const CATEGORIES = ["Semua", "Harian", "Ibadah", "Ramadan", "Perjalanan", "Alam"];

const DoaHarian = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = DOA_LIST.filter((d) => {
    const matchSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = activeCategory === "Semua" || d.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden" style={{ background: 'var(--c-surface)' }}>
      <div className="absolute pointer-events-none" style={{ width: '100%', height: 286, left: 0, top: 0, background: 'var(--page-header-bg)', zIndex: 0 }} />

      <div className="relative z-10 flex flex-col pt-6 px-4 gap-4">
        <div className="flex items-center w-full">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full">
            <ChevronLeft className="h-6 w-6" style={{ color: 'var(--c-text-secondary)' }} strokeWidth={2} />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center pr-10" style={{ color: 'var(--c-text)', letterSpacing: '-0.44px' }}>Doa Harian</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--c-text-completed)' }} />
          <input type="text" placeholder="Cari doa..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl pl-10 pr-4 py-3 text-sm outline-none"
            style={{ background: 'var(--c-surface-alt)', border: '1px solid var(--c-border-warm)', color: 'var(--c-text)' }}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all"
              style={{
                background: activeCategory === cat ? 'linear-gradient(180deg, #7DF8AD 0%, #F9FFD2 100%)' : 'var(--c-surface-alt)',
                border: activeCategory === cat ? '1px solid var(--c-surface)' : '1px solid var(--c-border-warm)',
                color: activeCategory === cat ? 'var(--c-text-dark)' : 'var(--c-text-secondary)',
                boxShadow: activeCategory === cat ? 'var(--s-small)' : 'none',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 pb-6">
          {filtered.map((doa, i) => (
            <motion.div key={doa.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}
              onClick={() => setExpandedId(expandedId === doa.id ? null : doa.id)}
              className="rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all"
              style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-warm)', boxShadow: 'var(--s-card-light)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>{doa.title}</span>
                  <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{doa.category}</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'var(--c-badge-green-bg)', color: 'var(--c-badge-green-text)' }}>
                  {expandedId === doa.id ? 'Tutup' : 'Baca'}
                </span>
              </div>

              {expandedId === doa.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="flex flex-col gap-3 pt-2" style={{ borderTop: '1px solid var(--c-border-warm)' }}
                >
                  <p className="text-right text-xl leading-loose" dir="rtl" style={{ color: 'var(--c-text)', fontFamily: "'LPMQ IsepMisbah', 'Scheherazade New', serif", lineHeight: 2.2 }}>{doa.arabic}</p>
                  <p className="text-sm italic" style={{ color: 'var(--c-text-secondary)' }}>{doa.latin}</p>
                  <p className="text-sm" style={{ color: 'var(--c-text-dark)' }}>{doa.translation}</p>
                </motion.div>
              )}
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-10">
              <span className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Doa tidak ditemukan</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoaHarian;
