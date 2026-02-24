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
        background: 'var(--c-surface)',
        border: '1px solid var(--c-border-warm)',
        boxShadow: 'var(--s-card)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{trivia.emoji}</span>
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ background: 'var(--c-badge-gray-bg)', color: 'var(--c-green-text)' }}
        >
          {trivia.category === "sejarah" ? "Sejarah Islam" : trivia.category === "kisah" ? "Kisah Nabi" : trivia.category === "fakta" ? "Fakta Menarik" : "Hikmah"}
        </span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text)' }}>
        {trivia.text}
      </p>
      {ramadan.isRamadan && (
        <p className="mt-3 text-[10px]" style={{ color: 'var(--c-text-completed)' }}>
          Trivia Ramadan hari ke-{ramadan.dayOfRamadan}
        </p>
      )}
    </motion.div>
  );
};

export default TriviaCard;
