import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-background px-6 py-12">
      {/* Mascot area */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mb-12"
        >
          {/* Glow ring */}
          <div className="absolute inset-0 -m-8 rounded-full bg-accent opacity-60 blur-2xl animate-glow" />
          <div className="absolute inset-0 -m-4 rounded-full bg-accent opacity-40 blur-xl" />

          {/* Moon/circle mascot */}
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-card shadow-lg">
            <span className="text-5xl">🌙</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="mb-3 text-3xl font-bold text-foreground">
            Assalamu'alaikum!
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xs">
            Kala hadir menemani ibadah harianmu dengan mudah dan tenang
          </p>
        </motion.div>
      </div>

      {/* Next button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          localStorage.setItem("kala_onboarded", "true");
          navigate("/today");
        }}
        className="w-full max-w-sm rounded-2xl gradient-primary py-4 text-lg font-semibold text-primary-foreground shadow-lg"
      >
        Mulai
      </motion.button>
    </div>
  );
};

export default Welcome;
