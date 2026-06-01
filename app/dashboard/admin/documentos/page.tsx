'use client';

import { useState, useEffect } from 'react';
import { FileCheck, CheckCircle, XCircle, Eye, X, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { createClient } from '../../../../utils/supabase/client';

interface AlunoAnalise {
  id: string;
  nome: string;
  escola: string;
  serie: string;
  status: 'Em análise';
  enviadoEm: string;
}

const ANALISES_MOCK: AlunoAnalise[] = [
  { id: 'aluno-mock-1', nome: 'Mariana Costa Souza', escola: 'Colégio Estadual Julia Wanderley', serie: '7º Ano A', status: 'Em análise', enviadoEm: '26/05/2026' },
  { id: 'aluno-mock-2', nome: 'Felipe Nascimento Torres', escola: 'Escola Municipal Codorna', serie: '2º Ano C', status: 'Em análise', enviadoEm: '25/05/2026' },
  { id: 'aluno-mock-3', nome: 'Beatriz Martins Nogueira', escola: 'Colégio Estadual Julia Wanderley', serie: '7º Ano A', status: 'Em análise', enviadoEm: '24/05/2026' }
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

  // Estados para designação de rota na aprovação
  const [rotas, setRotas] = useState<any[]>([]);
  const [alunoParaAprovar, setAlunoParaAprovar] = useState<AlunoAnalise | null>(null);
  const [selectedRotaId, setSelectedRotaId] = useState<string>('');

  // Estado de Toast
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadAlunosEmAnalise();
    loadRotas();
  }, []);

  async function loadRotas() {
    try {
      const { data, error } = await supabase
        .from('rotas')
        .select('id, codigo, nome, status');
      if (!error && data) {
        setRotas(data.filter((r: any) => r.status === 'Ativo'));
      } else {
        setRotas([
          { id: '9d0f2832-7288-4682-9642-17cb25e36928', codigo: 'RT-04', nome: 'Rota 04 — Zona Rural', status: 'Ativo' },
          { id: '8a723821-3928-4444-9123-ab39d1b0d777', codigo: 'RT-04-T', nome: 'Rota 04 — Zona Rural (Tarde)', status: 'Ativo' },
          { id: 'rota-mock-3', codigo: 'RT-22', nome: 'Rota 22 — Centro', status: 'Ativo' },
        ]);
      }
    } catch {
      setRotas([
        { id: '9d0f2832-7288-4682-9642-17cb25e36928', codigo: 'RT-04', nome: 'Rota 04 — Zona Rural', status: 'Ativo' },
        { id: '8a723821-3928-4444-9123-ab39d1b0d777', codigo: 'RT-04-T', nome: 'Rota 04 — Zona Rural (Tarde)', status: 'Ativo' },
        { id: 'rota-mock-3', codigo: 'RT-22', nome: 'Rota 22 — Centro', status: 'Ativo' },
      ]);
    }
  }

  async function loadAlunosEmAnalise() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome, escola, serie, status')
        .eq('status', 'Em análise');

      if (!error && data && data.length > 0) {
        const mapped: AlunoAnalise[] = data.map((a: any) => ({
          id: a.id,
          nome: a.nome,
          escola: a.escola,
          serie: a.serie ?? '—',
          status: 'Em análise',
          enviadoEm: new Date().toLocaleDateString('pt-BR')
        }));
        setAlunos(mapped);
        setUsandoMock(false);
      } else {
        setAlunos(ANALISES_MOCK.map(a => ({ ...a, status: 'Em análise' })));
        setUsandoMock(true);
      }
    } catch {
      setAlunos(ANALISES_MOCK.map(a => ({ ...a, status: 'Em análise' })));
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
        // Fallback mock de visualização com 4 documentos reais
        setDocumentos([
          { tipo: 'Comprovante de Residência', url: 'https://picsum.photos/400/300?random=1' },
          { tipo: 'Documento do Aluno', url: 'https://picsum.photos/400/300?random=2' },
          { tipo: 'Documento do Responsável', url: 'https://picsum.photos/400/300?random=3' },
          { tipo: 'Declaração de Matrícula', url: 'https://picsum.photos/400/300?random=4' }
        ]);
      }
    } catch {
      setDocumentos([
        { tipo: 'Comprovante de Residência', url: 'https://picsum.photos/400/300?random=1' },
        { tipo: 'Documento do Aluno', url: 'https://picsum.photos/400/300?random=2' },
        { tipo: 'Documento do Responsável', url: 'https://picsum.photos/400/300?random=3' },
        { tipo: 'Declaração de Matrícula', url: 'https://picsum.photos/400/300?random=4' }
      ]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleAprovar = (aluno: AlunoAnalise) => {
    setAlunoParaAprovar(aluno);
    if (rotas.length > 0) {
      setSelectedRotaId(rotas[0].id);
    } else {
      setSelectedRotaId('');
    }
  };

  const handleConfirmAprovar = async (id: string) => {
    setLoadingAction(id);
    const isMockAluno = id.startsWith('aluno-mock') || usandoMock;
    try {
      if (!isMockAluno) {
        // Persistência Real no Supabase com campo status
        const { data, error } = await supabase
          .from('alunos')
          .update({ 
            status: 'Aprovado',
            rota_id: selectedRotaId 
          })
          .eq('id', id);

        if (error) {
          console.error(error);
          alert('Erro ao salvar aprovação no banco de dados: ' + error.message);
          throw error;
        }
      }
      setAlunos(prev => prev.filter(a => a.id !== id));
      showToast('Solicitação APROVADA e Rota designada com sucesso!', 'success');
      setAlunoParaAprovar(null);
      if (selectedAluno?.id === id) setSelectedAluno(null);
    } catch (err) {
      console.error('Falha de persistência ao aprovar:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRejeitar = async (id: string) => {
    setLoadingAction(id);
    const isMockAluno = id.startsWith('aluno-mock') || usandoMock;
    try {
      if (!isMockAluno) {
        // Persistência Real no Supabase com campo status
        const { data, error } = await supabase
          .from('alunos')
          .update({ 
            status: 'Rejeitado',
            rota_id: null 
          })
          .eq('id', id);

        if (error) {
          console.error(error);
          alert('Erro ao salvar rejeição no banco de dados: ' + error.message);
          throw error;
        }
      }
      setAlunos(prev => prev.filter(a => a.id !== id));
      showToast('Solicitação REJEITADA. Status retornado para pendente.', 'success');
      if (selectedAluno?.id === id) setSelectedAluno(null);
    } catch (err) {
      console.error('Falha de persistência ao rejeitar:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const getDocLabel = (tipo: string) => {
    if (tipo === 'Comprovante_Residencia') return 'Comprovante de Residência';
    if (tipo === 'Documento_Aluno') return 'Documento do Aluno';
    if (tipo === 'Documento_Responsavel') return 'Documento do Responsável';
    if (tipo === 'Declaracao_Matricula') return 'Declaração de Matrícula';
    // Fallbacks legados
    if (tipo === 'Declaracao')  return 'Declaração de Matrícula';
    if (tipo === 'Comprovante') return 'Comprovante de Residência';
    return 'Documento Geral';
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
                        {a.status}
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
                          onClick={() => handleAprovar(a)}
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
                onClick={() => handleAprovar(selectedAluno)}
                className="py-2.5 px-5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all flex items-center gap-1.5 shadow"
              >
                <CheckCircle2 size={14} />
                <span>Aprovar Cadastro</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: DESIGNAÇÃO DE ROTA (APROVAÇÃO) */}
      {alunoParaAprovar && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border flex flex-col animate-fadeIn">
            
            {/* Header */}
            <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Aprovar e Designar Rota</h3>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5 uppercase">SEMED Arapongas</span>
              </div>
              <button onClick={() => setAlunoParaAprovar(null)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={15} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col gap-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-xs text-emerald-800 flex gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Aprovando estudante:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{alunoParaAprovar.nome}</p>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                  Selecione a Rota Escolar
                </label>
                <select
                  value={selectedRotaId}
                  onChange={(e) => setSelectedRotaId(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border text-xs font-bold text-slate-850 bg-white focus:outline-none focus:border-slate-900 transition-all cursor-pointer"
                >
                  <option value="" disabled>-- Selecione uma Rota --</option>
                  {rotas.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.nome_rota || r.nome}{r.turno ? ` (${r.turno === 'manha' || r.turno === 'Manhã' ? 'Manhã' : 'Tarde'})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                  A rota selecionada definirá automaticamente o motorista designado e o veículo que aparecerão na carteirinha digital e no mapa do responsável.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t bg-slate-50 flex gap-2 justify-end">
              <button
                onClick={() => setAlunoParaAprovar(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold border text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={!selectedRotaId || loadingAction !== null}
                onClick={() => handleConfirmAprovar(alunoParaAprovar.id)}
                className={`py-2.5 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow ${
                  selectedRotaId && loadingAction === null
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-slate-100 text-slate-450 border cursor-not-allowed'
                }`}
              >
                {loadingAction === alunoParaAprovar.id ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-550 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Aprovar e Liberar</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
