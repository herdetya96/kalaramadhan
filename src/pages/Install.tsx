import { ArrowLeft, Download, Share, MoreVertical, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Install = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-5 pb-24">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-muted-foreground">
        <ArrowLeft className="w-5 h-5" />
        <span>Kembali</span>
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-2">Install Kala</h1>
      <p className="text-muted-foreground mb-8">
        Tambahkan Kala ke home screen HP kamu agar lebih mudah diakses — seperti app biasa!
      </p>

      {/* Android */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          Android (Chrome)
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
          <li>Buka app ini di <strong>Google Chrome</strong></li>
          <li>Ketuk ikon <MoreVertical className="inline w-4 h-4" /> (titik tiga) di pojok kanan atas</li>
          <li>Pilih <strong>"Add to Home Screen"</strong> atau <strong>"Install App"</strong></li>
          <li>Ketuk <strong>"Install"</strong> untuk konfirmasi</li>
        </ol>
      </section>

      {/* iOS */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          iPhone / iPad (Safari)
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
          <li>Buka app ini di <strong>Safari</strong></li>
          <li>Ketuk ikon <Share className="inline w-4 h-4" /> (kotak dengan panah ke atas) di bawah</li>
          <li>Scroll ke bawah, pilih <strong>"Add to Home Screen"</strong></li>
          <li>Ketuk <strong>"Add"</strong> di pojok kanan atas</li>
        </ol>
      </section>

      <div className="rounded-xl bg-accent/50 p-4 text-sm text-accent-foreground">
        <p className="font-medium mb-1">✨ Setelah di-install:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Buka langsung dari home screen</li>
          <li>Tampilan fullscreen seperti app native</li>
          <li>Loading lebih cepat</li>
        </ul>
      </div>
    </div>
  );
};

export default Install;
