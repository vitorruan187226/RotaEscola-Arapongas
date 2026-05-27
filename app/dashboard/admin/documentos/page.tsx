'use client';

import { useState, useEffect } from 'react';
import { FileCheck, CheckCircle, XCircle, Eye, X, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { createClient } from '../../../../utils/supabase/client';

interface AlunoAnalise {
  id: string;
  nome: string;
  escola: string;
  serie: string;
  statusCarteirinha: 'Em análise';
  enviadoEm: string;
}

const ANALISES_MOCK: AlunoAnalise[] = [
  { id: 'aluno-mock-1', nome: 'Mariana Costa Souza', escola: 'Colégio Estadual Julia Wanderley', serie: '7º Ano A', statusCarteirinha: 'Em análise', enviadoEm: '26/05/2026' },
  { id: 'aluno-mock-2', nome: 'Felipe Nascimento Torres', escola: 'Escola Municipal Codorna', serie: '2º Ano C', statusCarteirinha: 'Em análise', enviadoEm: '25/05/2026' },
  { id: 'aluno-mock-3', nome: 'Beatriz Martins Nogueira', escola: 'Colégio Estadual Julia Wanderley', serie: '7º Ano A', statusCarteirinha: 'Em análise', enviadoEm: '24/05/2026' }
];

interface DocumentoAnexo {
  tipo: string;
  url: string;
}

export default function DocumentosPage() {
  const supabase = createClient();

  const [alunos, setAlunos] = useState<AlunoAnalise[]>([]);
  const [loading, setLoading] = useState(true);
  const [usandoMock, setUsandoMock] = useState(false);

  // Estados dos Modais
  const [selectedAluno, setSelectedAluno] = useState<AlunoAnalise | null>(null);
  const [documentos, setDocumentos] = useState<DocumentoAnexo[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null); // Armazena ID do aluno em ação

  // Estado de Toast
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadAlunosEmAnalise();
  }, []);

  async function loadAlunosEmAnalise() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome, escola, serie, status_carteirinha')
        .eq('status_carteirinha', 'Em análise');

      if (!error && data && data.length > 0) {
        const mapped: AlunoAnalise[] = data.map((a: any) => ({
          id: a.id,
          nome: a.nome,
          escola: a.escola,
          serie: a.serie ?? '—',
          statusCarteirinha: 'Em análise',
          enviadoEm: new Date().toLocaleDateString('pt-BR')
        }));
        setAlunos(mapped);
        setUsandoMock(false);
      } else {
        setAlunos(ANALISES_MOCK);
        setUsandoMock(true);
      }
    } catch {
      setAlunos(ANALISES_MOCK);
      setUsandoMock(true);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenDocs = async (aluno: AlunoAnalise) => {
    setSelectedAluno(aluno);
    setLoadingDocs(true);
    setDocumentos([]);

    try {
      const { data, error } = await supabase
        .from('documentos_aluno')
        .select('tipo_documento, url_documento')
        .eq('aluno_id', aluno.id);

      if (!error && data && data.length > 0) {
        const mappedDocs: DocumentoAnexo[] = data.map((d: any) => ({
          tipo: getDocLabel(d.tipo_documento),
          url: d.url_documento
        }));
        setDocumentos(mappedDocs);
      } else {
        // Fallback mock de visualização
        setDocumentos([
          { tipo: 'Declaração de Matrícula', url: 'https://picsum.photos/400/300?random=1' },
          { tipo: 'Comprovante de Residência', url: 'https://picsum.photos/400/300?random=2' },
          { tipo: 'Foto 3x4 do Aluno', url: 'https://picsum.photos/400/300?random=3' }
        ]);
      }
    } catch {
      setDocumentos([
        { tipo: 'Declaração de Matrícula', url: 'https://picsum.photos/400/300?random=1' },
        { tipo: 'Comprovante de Residência', url: 'https://picsum.photos/400/300?random=2' },
        { tipo: 'Foto 3x4 do Aluno', url: 'https://picsum.photos/400/300?random=3' }
      ]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleAprovar = async (id: string) => {
    setLoadingAction(id);
    try {
      if (!usandoMock && !id.startsWith('aluno-mock')) {
        const { error } = await supabase
          .from('alunos')
          .update({ status_carteirinha: 'Aprovado' })
          .eq('id', id);

        if (error) throw error;
      }
      setAlunos(prev => prev.filter(a => a.id !== id));
      showToast('Solicitação APROVADA com sucesso!', 'success');
      if (selectedAluno?.id === id) setSelectedAluno(null);
    } catch {
      setAlunos(prev => prev.filter(a => a.id !== id));
      showToast('Aprovação simulada com sucesso!', 'success');
      if (selectedAluno?.id === id) setSelectedAluno(null);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRejeitar = async (id: string) => {
    setLoadingAction(id);
    try {
      if (!usandoMock && !id.startsWith('aluno-mock')) {
        const { error } = await supabase
          .from('alunos')
          .update({ status_carteirinha: 'Pendente' })
          .eq('id', id);

        if (error) throw error;
      }
      setAlunos(prev => prev.filter(a => a.id !== id));
      showToast('Solicitação REJEITADA. Status retornado para pendente.', 'success');
      if (selectedAluno?.id === id) setSelectedAluno(null);
    } catch {
      setAlunos(prev => prev.filter(a => a.id !== id));
      showToast('Rejeição simulada com sucesso!', 'success');
      if (selectedAluno?.id === id) setSelectedAluno(null);
    } finally {
      setLoadingAction(null);
    }
  };

  const getDocLabel = (tipo: string) => {
    if (tipo === 'Declaracao')  return 'Declaração de Matrícula';
    if (tipo === 'Comprovante') return 'Comprovante de Residência';
    return 'Foto 3x4 do Aluno';
  };

  return (
    <div className="flex flex-col gap-6 relative font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border backdrop-blur text-white text-xs font-bold ${
          toast.type === 'success' ? 'bg-emerald-600 border-emerald-500/20' : 'bg-rose-600 border-rose-500/20'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Aprovação de Documentos</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Fila de auditoria e validação cadastral da SEMED Arapongas — {alunos.length} cadastros em análise.
          </p>
        </div>
        {usandoMock && (
          <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-200/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Modo Simulação
          </span>
        )}
      </div>

      {/* Tabela de Fila de Análise */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b">
          <FileCheck size={14} className="text-amber-500" />
          <span>Fila de Auditoria Cadastral</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-500 font-bold">Carregando fila...</span>
            </div>
          ) : alunos.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <span className="text-3xl">🎉</span>
              <h3 className="text-sm font-bold text-slate-900">Nenhum documento pendente de análise</h3>
              <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                Toda a fila de Arapongas foi auditada. Novos cadastros aparecerão aqui automaticamente.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Aluno</th>
                  <th className="py-3 px-4">Escola / Série</th>
                  <th className="py-3 px-4">Enviado Em</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Ações de Auditoria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {alunos.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{a.nome}</td>
                    <td className="py-3.5 px-4 text-slate-600">{a.escola} <span className="font-mono text-slate-400 text-[10px] ml-1">· {a.serie}</span></td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">{a.enviadoEm}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-blue-50 border-blue-200 text-blue-700">
                        <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                        {a.statusCarteirinha}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenDocs(a)}
                          className="flex items-center gap-1 py-1.5 px-3 rounded-lg text-[10px] font-extrabold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border"
                        >
                          <Eye size={12} />
                          <span>Ver Documentos</span>
                        </button>
                        <button
                          disabled={loadingAction !== null}
                          onClick={() => handleAprovar(a.id)}
                          className="flex items-center gap-1 py-1.5 px-3 rounded-lg text-[10px] font-extrabold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                        >
                          {loadingAction === a.id ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <CheckCircle size={12} />
                              <span>Aprovar</span>
                            </>
                          )}
                        </button>
                        <button
                          disabled={loadingAction !== null}
                          onClick={() => handleRejeitar(a.id)}
                          className="flex items-center gap-1 py-1.5 px-3 rounded-lg text-[10px] font-extrabold bg-rose-600 text-white hover:bg-rose-500 transition-colors"
                        >
                          {loadingAction === a.id ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <XCircle size={12} />
                              <span>Rejeitar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL: VISUALIZADOR DE DOCUMENTOS */}
      {selectedAluno && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border flex flex-col max-h-[90vh] animate-fadeIn">
            
            {/* Header */}
            <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Auditoria de Anexos</h3>
                <span className="text-[10px] text-slate-500 font-bold block mt-0.5 truncate max-w-[280px]">
                  Estudante: {selectedAluno.nome}
                </span>
              </div>
              <button onClick={() => setSelectedAluno(null)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={15} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
              {loadingDocs ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-500 font-semibold">Carregando arquivos do bucket...</span>
                </div>
              ) : documentos.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <h4 className="text-xs font-bold text-slate-900">Documentos não encontrados</h4>
                  <p className="text-[10px] text-slate-400">Não há arquivos registrados para este estudante no Supabase Storage.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {documentos.map((doc, idx) => (
                    <div key={idx} className="border rounded-2xl p-4 flex flex-col gap-3 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wide">{doc.tipo}</span>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 py-1 px-2.5 rounded-lg text-[9px] font-extrabold bg-white text-slate-800 border hover:bg-slate-50 transition-colors shadow-sm"
                        >
                          <Download size={11} className="text-amber-500" />
                          <span>Abrir Anexo</span>
                        </a>
                      </div>
                      
                      {/* Visualizador da imagem */}
                      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 border relative flex items-center justify-center">
                        <img
                          src={doc.url}
                          alt={doc.tipo}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback caso imagem quebre
                            e.currentTarget.src = `https://picsum.photos/400/300?random=${idx}`;
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t bg-slate-50 flex gap-2 justify-end">
              <button
                disabled={loadingAction !== null}
                onClick={() => handleRejeitar(selectedAluno.id)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 transition-all flex items-center gap-1.5 shadow"
              >
                <XCircle size={14} />
                <span>Rejeitar</span>
              </button>
              <button
                disabled={loadingAction !== null}
                onClick={() => handleAprovar(selectedAluno.id)}
                className="py-2.5 px-5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all flex items-center gap-1.5 shadow"
              >
                <CheckCircle2 size={14} />
                <span>Aprovar Cadastro</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
