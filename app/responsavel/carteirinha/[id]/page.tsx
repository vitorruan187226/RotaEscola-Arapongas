'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '../../../../utils/supabase/client';
import { Download, Shield } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// ─── Contrato de Dados (Lei 4 — Tipagem estrita, sem @ts-ignore) ─────────────
interface AlunoCarteirinha {
  id: string;
  nome: string;
  escola: string;
  serie: string;
  rota: string;
  matricula: string;
  qrCodeHash: string;
  fotoUrl?: string;
  validade: string;
}

// ─── Mock tipado de fallback ──────────────────────────────────────────────────
const MOCK_ALUNO: AlunoCarteirinha = {
  id: 'aluno-01',
  nome: 'Thiago Martins Nogueira',
  escola: 'Escola Municipal Dorcelina Folador',
  serie: '4º Ano B - Turno Matutino',
  rota: 'Rota 04 - Zona Rural / Dorcelina Folador',
  matricula: 'AR-2026-98745',
  qrCodeHash: 'rotaescola_arapongas_secure_aluno-01_2026',
  fotoUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=150&auto=format&fit=crop&q=80',
  validade: 'Dezembro / 2026',
};

export default function CarteirinhaDigitalPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [aluno, setAluno] = useState<AlunoCarteirinha | null>(null);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSaveCredential = () => {
    if (!aluno) return;
    setIsDownloading(true);
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsDownloading(false);
      return;
    }

    // Helper to draw image like object-fit: cover
    const drawImageCover = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
      const imgRatio = img.width / img.height;
      const targetRatio = w / h;
      let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

      if (imgRatio > targetRatio) {
        sWidth = img.height * targetRatio;
        sx = (img.width - sWidth) / 2;
      } else {
        sHeight = img.width / targetRatio;
        sy = (img.height - sHeight) / 2;
      }
      ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
    };

    // Background gradient (navy blue)
    const grad = ctx.createLinearGradient(0, 0, 0, 600);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 600);

    // Border / decoration
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 384, 584);

    // Header Text
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PREFEITURA DE ARAPONGAS', 200, 40);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('SECRETARIA MUNICIPAL DE EDUCAÇÃO (SEMED)', 200, 55);

    // Divider line
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 75);
    ctx.lineTo(370, 75);
    ctx.stroke();

    // Student Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(aluno.nome.toUpperCase(), 200, 215);

    // Subtitle "TRANSPORTE AUTORIZADO"
    if (isExpired) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('CARTEIRINHA EXPIRADA - RENOVE O RECADASTRO', 200, 235);
    } else {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('TRANSPORTE AUTORIZADO', 200, 235);
    }

    // Details box background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(30, 260, 340, 100);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(30, 260, 340, 100);

    // Details layout (two columns)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('MATRÍCULA', 45, 285);
    ctx.fillText('VALIDADE', 220, 285);
    ctx.fillText('INSTITUIÇÃO', 45, 325);
    ctx.fillText('ITINERÁRIO ESCOLAR', 220, 325);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(aluno.matricula, 45, 302);
    ctx.fillText(aluno.validade, 220, 302);
    
    const instText = aluno.escola.length > 25 ? aluno.escola.slice(0, 22) + '...' : aluno.escola;
    const itinText = aluno.rota.length > 25 ? aluno.rota.slice(0, 22) + '...' : aluno.rota;
    
    ctx.fillText(instText, 45, 342);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(itinText, 220, 342);

    // Render QR Code SVG and Student Photo asynchronously
    const svgElement = document.querySelector('#carteirinha-qr-code svg');
    if (svgElement) {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = window.URL.createObjectURL(svgBlob);
      
      const imgQR = new window.Image();
      const imgFoto = new window.Image();
      
      let qrLoaded = false;
      let fotoLoaded = false;
      let fotoFailed = false;

      const finishDrawing = () => {
        // Confirm both QR and Foto (if applicable) are resolved
        if (!qrLoaded) return;
        if (aluno.fotoUrl && !fotoLoaded && !fotoFailed) return;

        // Draw Student Photo/Silhouette as rounded rectangle (matching HTML view)
        if (aluno.fotoUrl && fotoLoaded) {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(155, 75, 90, 115, 16);
          ctx.clip();
          drawImageCover(ctx, imgFoto, 155, 75, 90, 115);
          ctx.restore();

          // Stroke border around photo
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#f59e0b';
          ctx.beginPath();
          ctx.roundRect(155, 75, 90, 115, 16);
          ctx.stroke();
        } else {
          // Silhouette placeholder
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.roundRect(155, 75, 90, 115, 16);
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#f59e0b';
          ctx.stroke();
          
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(155, 75, 90, 115, 16);
          ctx.clip();
          
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.arc(200, 115, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(200, 165, 28, Math.PI, 0, false);
          ctx.fill();
          ctx.restore();
        }

        // Draw QR Code Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(135, 385, 130, 130);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.strokeRect(135, 385, 130, 130);

        // Draw QR Code
        ctx.drawImage(imgQR, 140, 390, 120, 120);

        if (isExpired) {
          // Semi-transparent red overlay over the QR code
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(140, 390, 120, 120);
          
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('EXPIRADA', 200, 445);
          ctx.fillStyle = '#cbd5e1';
          ctx.font = 'bold 8px sans-serif';
          ctx.fillText('RENOVE RECADASTRO', 200, 465);
        }

        // Footer message
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('APRESENTE AO MOTORISTA', 200, 540);
        ctx.font = '8px monospace';
        ctx.fillText(aluno.qrCodeHash, 200, 555);

        // Trigger download
        const png = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = png;
        downloadLink.download = `carteirinha-${aluno.nome.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(blobURL);
        setIsDownloading(false);
      };

      imgQR.onload = () => {
        qrLoaded = true;
        finishDrawing();
      };
      imgQR.src = blobURL;

      if (aluno.fotoUrl) {
        imgFoto.crossOrigin = 'anonymous';
        imgFoto.onload = () => {
          fotoLoaded = true;
          finishDrawing();
        };
        imgFoto.onerror = () => {
          fotoFailed = true;
          finishDrawing();
        };
        // Add cache busting timestamp to prevent browser caching from delivering non-CORS response
        imgFoto.src = aluno.fotoUrl + (aluno.fotoUrl.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
      }
    } else {
      // Fallback silhouette when QR SVG is not found
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(155, 75, 90, 115, 16);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f59e0b';
      ctx.stroke();
      
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(155, 75, 90, 115, 16);
      ctx.clip();
      
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(200, 115, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(200, 165, 28, Math.PI, 0, false);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(135, 385, 130, 130);
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('QR CODE', 200, 450);
      
      const png = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = png;
      downloadLink.download = `carteirinha-${aluno.nome.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    async function loadAluno() {
      try {
        // Tenta buscar dados reais do aluno pelo ID da URL
        const { data, error } = await supabase
          .from('alunos')
          .select('id, nome, escola, serie, rota_id, foto_url')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          // Tenta buscar o qr_code_hash da carteirinha associada
          const { data: cartData } = await supabase
            .from('carteirinhas')
            .select('qr_code_hash, data_vencimento')
            .eq('aluno_id', id)
            .maybeSingle();

          let expirationDateStr = null;
          let validadeText = 'Dezembro / 2026';
          let expired = false;

          if (cartData?.data_vencimento) {
            expirationDateStr = cartData.data_vencimento;
            const date = new Date(cartData.data_vencimento);
            const meses = [
              'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
              'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];
            validadeText = `${meses[date.getMonth()]} / ${date.getFullYear()}`;
            expired = new Date() > date;
          }

          setIsExpired(expired);

          setAluno({
            id:         data.id,
            nome:       data.nome,
            escola:     data.escola,
            serie:      data.serie ?? '—',
            rota:       data.rota_id ?? 'Aguardando Atribuição',
            matricula:  `AR-2026-${data.id.slice(0, 5).toUpperCase()}`,
            qrCodeHash: cartData?.qr_code_hash ?? `rotaescola_arapongas_${data.id}_2026`,
            fotoUrl:    data.foto_url ?? undefined,
            validade:   validadeText,
          });
        } else {
          // Fallback mock tipado
          setAluno({ ...MOCK_ALUNO, id, qrCodeHash: `rotaescola_arapongas_${id}_2026` });
        }
      } catch {
        setAluno({ ...MOCK_ALUNO, id, qrCodeHash: `rotaescola_arapongas_${id}_2026` });
      } finally {
        setLoading(false);
      }
    }
    loadAluno();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-semibold">Carregando carteirinha...</span>
      </div>
    );
  }

  if (!aluno) return null;

  return (
    <div className="flex flex-col gap-5 items-center">
      {/* Cabeçalho */}
      <div className="w-full text-left px-1">
        <h2 className="text-base font-extrabold text-slate-900">Carteirinha Digital</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Apresente este QR Code ao motorista ao embarcar no veículo.
        </p>
      </div>

      {/* ── CREDENCIAL OFICIAL DE ARAPONGAS ──────────────────────────────── */}
      <div className="w-full max-w-[320px] bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative">

        {/* Linha Amarela Superior */}
        <div className="h-2.5 bg-amber-500" />

        {/* Cabeçalho do Crachá */}
        <div className="px-5 py-4 bg-slate-950/60 border-b border-slate-800 flex items-center gap-3">
          <span className="text-2xl">🏛️</span>
          <div>
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">
              Prefeitura de Arapongas
            </h3>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
              Secretaria Municipal de Educação (SEMED)
            </span>
          </div>
        </div>

        {/* Corpo do Crachá */}
        <div className="px-5 pt-5 pb-4 flex flex-col items-center text-center relative">

          {/* Marca D'Água */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none text-[150px] select-none">
            🚌
          </div>

          {/* Foto do Estudante */}
          <div className="w-28 h-36 rounded-2xl bg-slate-800 border-2 border-amber-500 overflow-hidden shadow-lg relative z-10">
            {aluno.fotoUrl ? (
              <img src={aluno.fotoUrl} alt={aluno.nome} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500 text-4xl">
                👤
              </div>
            )}
          </div>

          {/* Dados do Aluno */}
          <div className="mt-4 z-10">
            <h4 className="text-base font-black text-white uppercase tracking-wide px-2 leading-tight">
              {aluno.nome}
            </h4>
            <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider mt-1.5 inline-block ${
              isExpired 
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse'
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}>
              {isExpired ? 'Carteirinha Expirada' : 'Transporte Autorizado'}
            </span>
          </div>

          {/* Divisória */}
          <div className="w-full border-t border-slate-800/80 my-4" />

          {/* Detalhes Cadastrais em Grade */}
          <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 w-full text-left text-xs z-10 px-1">
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider block">Matrícula</span>
              <span className="font-mono text-slate-200 font-bold text-[10px]">{aluno.matricula}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider block">Validade</span>
              <span className="text-slate-200 font-bold text-[10px]">{aluno.validade}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider block">Instituição</span>
              <span className="text-slate-200 font-bold text-[10px] truncate block">{aluno.escola}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider block">Itinerário Escolar</span>
              <span className="text-amber-400 font-bold text-[10px] leading-tight block">{aluno.rota}</span>
            </div>
          </div>
        </div>

        {/* ── Seção do QR Code REAL (qrcode.react) ──────────────────────────── */}
        <div className="px-5 py-5 bg-slate-950 border-t border-slate-800 flex flex-col items-center justify-center gap-3">
          <div id="carteirinha-qr-code" className="bg-white p-3.5 rounded-2xl border-2 border-amber-500 flex flex-col items-center justify-center gap-2 shadow-md relative overflow-hidden">
            {/* QR Code dinâmico gerado com a hash do aluno */}
            <QRCodeSVG
              value={aluno.qrCodeHash}
              size={120}
              bgColor="#ffffff"
              fgColor="#0f172a"
              level="M"
            />
            {isExpired && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-2">
                <span className="text-sm font-black text-rose-500 uppercase tracking-widest leading-none">EXPIRADA</span>
                <span className="text-[8px] text-slate-300 font-bold mt-1 leading-tight">Efetue o<br/>Recadastro Anual</span>
              </div>
            )}
            <span className="text-[8px] font-mono text-slate-400 max-w-[140px] truncate">
              {aluno.qrCodeHash.slice(0, 24)}…
            </span>
          </div>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">
            {isExpired ? 'Acesso Bloqueado' : 'Passe pelo Validador de Embarque'}
          </span>
        </div>
      </div>

      {/* Botão de Ação Real */}
      <button
        onClick={handleSaveCredential}
        disabled={isDownloading}
        className="w-full max-w-[320px] bg-slate-900 text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-md mt-2 disabled:opacity-50"
      >
        <Download size={14} className="text-amber-500" />
        <span>{isDownloading ? 'Salvando...' : 'Salvar no Celular (PDF/Imagem)'}</span>
      </button>

      {/* Aviso de Segurança */}
      <div className="w-full max-w-[320px] bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
        <Shield size={14} className="shrink-0 text-slate-400 mt-0.5" />
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Este QR Code é único e vinculado ao matriculado. Não compartilhe com terceiros. Válido apenas para a rota indicada.
        </p>
      </div>
    </div>
  );
}
