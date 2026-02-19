import { motion } from "framer-motion";

interface TriviaCardProps {
  trivia: { text: string; category: string; emoji: string };
  ramadan: { isRamadan: boolean; dayOfRamadan: number };
}

const TriviaCard = ({ trivia, ramadan }: TriviaCardProps) => {
  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="rounded-3xl p-5 mb-4"
      style={{
        background: '#FFFFFF',
        border: '1px solid #F3EDE6',
        boxShadow: '0px 30px 46px rgba(223, 150, 55, 0.1)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{trivia.emoji}</span>
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ background: '#F6FFE7', color: '#15A450' }}
        >
          {trivia.category === "sejarah" ? "Sejarah Islam" : trivia.category === "kisah" ? "Kisah Nabi" : trivia.category === "fakta" ? "Fakta Menarik" : "Hikmah"}
        </span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: '#1D293D' }}>
        {trivia.text}
      </p>
      {ramadan.isRamadan && (
        <p className="mt-3 text-[10px]" style={{ color: '#90A1B9' }}>
          Trivia Ramadan hari ke-{ramadan.dayOfRamadan}
        </p>
      )}
    </motion.div>
  );
};

export default TriviaCard;
