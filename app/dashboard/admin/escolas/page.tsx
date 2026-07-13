'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus, Search, Edit2, Trash2, X, AlertCircle, CheckCircle, MapPin, Clock } from 'lucide-react';
import { createClient } from '../../../../utils/supabase/client';
import { ALUNOS_MOCK_GLOBAL } from '../../../../lib/mocks/alunos';
import { geocodeAddress } from '../../../../lib/utils/geocode';
import { MapPickerModal } from '../../../../lib/components/MapPickerModal';

interface Escola {
  id: string;
  nome: string;
  endereco: string;
  latitude?: number;
  longitude?: number;
  turnos: string[]; // ['Manhã', 'Tarde', 'Noite']
  tipo?: 'municipal' | 'estadual';
  series?: string[]; // ['1º Ano', '2º Ano']
  logo_url?: string;
}

const SERIES_MUNICIPAIS = ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'];
const SERIES_ESTADUAIS = ['6º Ano', '7º Ano', '8º Ano', '9º Ano', '1º Grau', '2º Grau', '3º Grau'];

const ESCOLAS_MOCK: Escola[] = [
  { 
    id: 'escola-mock-1', 
    nome: 'Escola Municipal Dorcelina Folador', 
    endereco: 'Rua das Gralhas, 123 - Arapongas', 
    turnos: ['Manhã', 'Tarde'],
    tipo: 'municipal',
    series: ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano']
  },
  { 
    id: 'escola-mock-2', 
    nome: 'Colégio Estadual Julia Wanderley', 
    endereco: 'Av. Arapongas, 456 - Centro', 
    turnos: ['Manhã', 'Tarde', 'Noite'],
    tipo: 'estadual',
    series: ['6º Ano', '7º Ano', '8º Ano', '9º Ano', '1º Grau', '2º Grau', '3º Grau']
  },
  { 
    id: 'escola-mock-3', 
    nome: 'Escola Municipal Codorna', 
    endereco: 'Rua Codorna, 789 - Zona Sul', 
    turnos: ['Manhã', 'Tarde'],
    tipo: 'municipal',
    series: ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano']
  }
];

export default function EscolasPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [escolasCounts, setEscolasCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [usandoMock, setUsandoMock] = useState(false);


  // Estados dos Modais
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [modalNovo, setModalNovo] = useState(false);
  const [modalEditar, setModalEditar] = useState<Escola | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // Form Fields (Novo / Editar)
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [turnos, setTurnos] = useState<string[]>([]); // ['Manhã', 'Tarde']
  const [tipo, setTipo] = useState<'municipal' | 'estadual'>('municipal');
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const toggleSerieSelection = (serie: string) => {
    if (selectedSeries.includes(serie)) {
      setSelectedSeries(prev => prev.filter(s => s !== serie));
    } else {
      setSelectedSeries(prev => [...prev, serie]);
    }
  };

  // Estado de Toast
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadEscolas();
  }, []);

  const ALUNOS_MOCK_EM_ANALISE = ALUNOS_MOCK_GLOBAL.filter(a => a.statusCarteirinha === 'Em análise');

  async function loadEscolas() {
    setLoading(true);
    try {
      // 1. Busca as escolas do banco de dados (tentando logo_url)
      let res: any = await supabase
        .from('escolas')
        .select('id, nome, endereco, turnos, tipo, series, logo_url, latitude, longitude')
        .order('nome', { ascending: true });

      // Se a coluna logo_url não existir no banco (erro 400 ou código PGRST100)
      if (res.error && (res.error.message?.includes('logo_url') || res.error.code === 'PGRST100' || res.error.message?.includes('column'))) {
        console.warn('Coluna logo_url não encontrada na tabela escolas. Tentando carregar sem logo_url.');
        res = await supabase
          .from('escolas')
          .select('id, nome, endereco, turnos, tipo, series')
          .order('nome', { ascending: true });
      }

      const { data: escolasDB, error: escolasError } = res;

      if (!escolasError && escolasDB && escolasDB.length > 0) {
        setEscolas(escolasDB as Escola[]);
        setUsandoMock(false);

        // 2. Busca as pendências reais via agregação real no Supabase
        const counts: { [key: string]: number } = {};
        await Promise.all(
          escolasDB.map(async (escola) => {
            const { count, error } = await supabase
              .from('alunos')
              .select('*', { count: 'exact', head: true })
              .eq('status_carteirinha', 'Em análise')
              .eq('escola', escola.nome);

            if (error) {
              console.error('--- ERRO DETALHADO DO SUPABASE (Contagem de Escolas) ---');
              console.error('Mensagem:', error.message);
              console.error('Detalhes:', error.details);
              console.error('Dica (Hint):', error.hint);
              console.error('---------------------------------');
            }

            counts[escola.id] = !error && count !== null ? count : 0;
          })
        );
        setEscolasCounts(counts);
      } else {
        setEscolas(ESCOLAS_MOCK);
        setUsandoMock(true);
        // Contagem mockada
        const countsMock: { [key: string]: number } = {};
        ESCOLAS_MOCK.forEach(e => {
          countsMock[e.id] = ALUNOS_MOCK_GLOBAL.filter(
            a => a.escola === e.nome && a.statusCarteirinha === 'Em análise'
          ).length;
        });
        setEscolasCounts(countsMock);
      }
    } catch (err) {
      console.warn('Erro ao carregar escolas do Supabase. Carregando dados fictícios.', err);
      setEscolas(ESCOLAS_MOCK);
      setUsandoMock(true);
      const countsMock: { [key: string]: number } = {};
      ESCOLAS_MOCK.forEach(e => {
        countsMock[e.id] = ALUNOS_MOCK_GLOBAL.filter(
          a => a.escola === e.nome && a.statusCarteirinha === 'Em análise'
        ).length;
      });
      setEscolasCounts(countsMock);
    } finally {
      setLoading(false);
    }
  }

  function schoolIdOrName(esc: Escola) {
    return esc.id;
  }

  const toggleTurno = (turno: string) => {
    if (turnos.includes(turno)) {
      setTurnos(prev => prev.filter(t => t !== turno));
    } else {
      setTurnos(prev => [...prev, turno]);
    }
  };

  const handleGeocode = async () => {
    if (!endereco.trim()) {
      showToast('Digite um endereço primeiro para buscar as coordenadas.', 'error');
      return;
    }
    setIsGeocoding(true);
    const coords = await geocodeAddress(endereco);
    if (coords) {
      setLatitude(coords.lat.toString());
      setLongitude(coords.lon.toString());
      showToast('Coordenadas encontradas e preenchidas!', 'success');
    } else {
      showToast('Não foi possível encontrar as coordenadas para este endereço.', 'error');
    }
    setIsGeocoding(false);
  };

  const handleCreate = async () => {
    if (!nome.trim() || !endereco.trim() || turnos.length === 0) return;
    setLoadingAction(true);
    try {
      let createdId = `escola-gen-${Date.now()}`;
      let uploadedLogoUrl = '';

      if (!usandoMock) {
        // Upload da logo se houver arquivo
        if (logoFile) {
          try {
            const ext = logoFile.name.split('.').pop() || 'png';
            const fileName = `logos/${Date.now()}_logo.${ext}`;
            const { error: uploadError } = await supabase.storage
              .from('logos-escolas')
              .upload(fileName, logoFile);

            if (uploadError) throw uploadError;

            uploadedLogoUrl = supabase.storage
              .from('logos-escolas')
              .getPublicUrl(fileName).data.publicUrl;
          } catch (uploadErr: any) {
            console.error('Erro ao fazer upload da logo:', uploadErr);
          }
        }

        let insertData: any = {
          nome,
          endereco,
          latitude: latitude ? parseFloat(latitude.replace(',', '.')) : null,
          longitude: longitude ? parseFloat(longitude.replace(',', '.')) : null,
          turnos,
          tipo,
          series: selectedSeries,
          logo_url: uploadedLogoUrl || null
        };

        let { data, error } = await supabase
          .from('escolas')
          .insert(insertData)
          .select('id')
          .maybeSingle();

        // Se falhar por causa da coluna logo_url (erro 400 ou código PGRST100)
        if (error && (error.message?.includes('logo_url') || error.code === 'PGRST100' || error.message?.includes('column'))) {
          console.warn('Falha ao inserir com logo_url (coluna ausente). Tentando sem logo_url.');
          delete insertData.logo_url;
          const retry = await supabase
            .from('escolas')
            .insert(insertData)
            .select('id')
            .maybeSingle();
          data = retry.data;
          error = retry.error;
        }

        if (error) throw error;
        if (data?.id) createdId = data.id;
      } else {
        // Fallback simulação
        if (logoFile) {
          uploadedLogoUrl = logoUrl || `https://picsum.photos/150/150?random=${Date.now()}`;
        }
      }

      const nova: Escola = {
        id: createdId,
        nome,
        endereco,
        turnos,
        tipo,
        series: selectedSeries,
        logo_url: uploadedLogoUrl || undefined
      };

      setEscolas(prev => [nova, ...prev]);
      setModalNovo(false);
      setNome('');
      setEndereco('');
      setLatitude('');
      setLongitude('');
      setTurnos([]);
      setTipo('municipal');
      setSelectedSeries([]);
      setLogoFile(null);
      setLogoUrl('');
      showToast('Escola cadastrada com sucesso!', 'success');
    } catch (err: any) {
      console.warn('Erro ao salvar no banco. Salvando simulado localmente.', err.message);
      const mockNova: Escola = {
        id: `escola-mock-${Date.now()}`,
        nome,
        endereco,
        turnos,
        tipo,
        series: selectedSeries,
        logo_url: logoUrl || undefined
      };
      setEscolas(prev => [mockNova, ...prev]);
      setModalNovo(false);
      setNome('');
      setEndereco('');
      setLatitude('');
      setLongitude('');
      setTurnos([]);
      setTipo('municipal');
      setSelectedSeries([]);
      setLogoFile(null);
      setLogoUrl('');
      showToast('Cadastro simulado com sucesso!', 'success');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdate = async () => {
    if (!modalEditar || !nome.trim() || !endereco.trim() || turnos.length === 0) return;
    setLoadingAction(true);
    try {
      let uploadedLogoUrl = logoUrl;

      if (!usandoMock && !modalEditar.id.startsWith('escola-mock')) {
        // Upload da logo se houver novo arquivo
        if (logoFile) {
          try {
            const ext = logoFile.name.split('.').pop() || 'png';
            const fileName = `logos/${Date.now()}_logo.${ext}`;
            const { error: uploadError } = await supabase.storage
              .from('logos-escolas')
              .upload(fileName, logoFile);

            if (uploadError) throw uploadError;

            uploadedLogoUrl = supabase.storage
              .from('logos-escolas')
              .getPublicUrl(fileName).data.publicUrl;
          } catch (uploadErr: any) {
            console.error('Erro ao fazer upload da logo:', uploadErr);
          }
        }

        let updateData: any = {
          nome,
          endereco,
          latitude: latitude ? parseFloat(latitude.replace(',', '.')) : null,
          longitude: longitude ? parseFloat(longitude.replace(',', '.')) : null,
          turnos,
          tipo,
          series: selectedSeries,
          logo_url: uploadedLogoUrl || null
        };

        let { error } = await supabase
          .from('escolas')
          .update(updateData)
          .eq('id', modalEditar.id);

        // Se falhar por causa da coluna logo_url (erro 400 ou código PGRST100)
        if (error && (error.message?.includes('logo_url') || error.code === 'PGRST100' || error.message?.includes('column'))) {
          console.warn('Falha ao atualizar com logo_url (coluna ausente). Tentando sem logo_url.');
          delete updateData.logo_url;
          const retry = await supabase
            .from('escolas')
            .update(updateData)
            .eq('id', modalEditar.id);
          error = retry.error;
        }

        if (error) throw error;
      } else {
        // Fallback simulação
        if (logoFile) {
          uploadedLogoUrl = logoUrl || `https://picsum.photos/150/150?random=${Date.now()}`;
        }
      }

      setEscolas(prev => prev.map(e => e.id === modalEditar.id ? {
        ...e,
        nome,
        endereco,
        turnos,
        tipo,
        series: selectedSeries,
        logo_url: uploadedLogoUrl || undefined
      } : e));
      
      setModalEditar(null);
      setNome('');
      setEndereco('');
      setLatitude('');
      setLongitude('');
      setTurnos([]);
      setTipo('municipal');
      setSelectedSeries([]);
      setLogoFile(null);
      setLogoUrl('');
      showToast('Cadastro atualizado com sucesso!', 'success');
    } catch {
      setEscolas(prev => prev.map(e => e.id === modalEditar.id ? {
        ...e,
        nome,
        endereco,
        turnos,
        tipo,
        series: selectedSeries,
        logo_url: logoUrl || undefined
      } : e));
      setModalEditar(null);
      setNome('');
      setEndereco('');
      setLatitude('');
      setLongitude('');
      setTurnos([]);
      setTipo('municipal');
      setSelectedSeries([]);
      setLogoFile(null);
      setLogoUrl('');
      showToast('Cadastro atualizado localmente!', 'success');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover esta unidade escolar? Alunos vinculados ficarão sem escola associada.')) return;
    try {
      if (!usandoMock && !id.startsWith('escola-mock')) {
        const { error } = await supabase.from('escolas').delete().eq('id', id);
        if (error) throw error;
      }
      setEscolas(prev => prev.filter(e => e.id !== id));
      showToast('Unidade escolar excluída com sucesso.', 'success');
    } catch {
      setEscolas(prev => prev.filter(e => e.id !== id));
      showToast('Exclusão simulada com sucesso.', 'success');
    }
  };

  const filteredEscolas = escolas.filter(e =>
    e.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.endereco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 relative">
      
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
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Entidades Escolares</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Gestão do cadastro relacional de escolas atendidas pelo transporte escolar em Arapongas — {escolas.length} escolas catalogadas.
          </p>
        </div>
        <button
          onClick={() => {
            setNome('');
            setEndereco('');
            setLatitude('');
            setLongitude('');
            setTurnos([]);
            setTipo('municipal');
            setSelectedSeries([]);
            setLogoFile(null);
            setLogoUrl('');
            setModalNovo(true);
          }}
          className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow"
        >
          <Plus size={14} className="text-amber-500" />
          <span>Cadastrar Escola</span>
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou endereço da escola..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-bold placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all"
          />
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        {usandoMock && (
          <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-200/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Modo Demonstração
          </span>
        )}
      </div>

      {/* Grid de Cards de Escolas */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between animate-pulse h-[220px]">
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 bg-slate-100 rounded-2xl shrink-0" />
                  <div className="flex-1 pr-6 flex flex-col gap-2 mt-1">
                    <div className="h-3.5 bg-slate-100 rounded w-3/4" />
                    <div className="h-2 bg-slate-100 rounded w-1/3 mt-1" />
                  </div>
                </div>
                <div className="h-2.5 bg-slate-100 rounded w-full mt-3" />
                <div className="h-2.5 bg-slate-100 rounded w-4/5" />
                <div className="flex gap-1.5 mt-2">
                  <div className="h-4 w-14 bg-slate-100 rounded-full" />
                  <div className="h-4 w-14 bg-slate-100 rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-50 mt-5 pt-3.5">
                <div className="h-2.5 w-16 bg-slate-100 rounded" />
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-slate-100 rounded-lg" />
                  <div className="w-6 h-6 bg-slate-100 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredEscolas.length === 0 ? (
        <div className="bg-white border rounded-2xl p-20 text-center flex flex-col items-center gap-3 shadow-sm">
          <span className="text-3xl">🏫</span>
          <h3 className="text-sm font-bold text-slate-900">Nenhuma escola cadastrada</h3>
          <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed">
            Adicione as escolas do município para que os responsáveis possam selecioná-las ao solicitar transporte escolar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEscolas.map((escola) => {
            const countEmAnalise = escolasCounts[escola.id] || 0;

            return (
              <div
                key={escola.id}
                onClick={() => router.push(`/dashboard/admin/escolas/detalhes?escola=${encodeURIComponent(escola.nome)}&id=${escola.id}`)}
                className="group relative bg-white border border-slate-200 hover:border-slate-350 hover:-translate-y-0.5 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                {/* Badge por Escola (quantidade de alunos em análise) */}
                {countEmAnalise > 0 && (
                  <div 
                    className="absolute top-4 right-4 flex items-center justify-center bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full shadow-sm animate-pulse z-10" 
                    title={`${countEmAnalise} alunos com pendência de aprovação`}
                  >
                    {countEmAnalise}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {/* Ícone/Logo e Título da Escola */}
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-100 transition-colors shrink-0 overflow-hidden border border-slate-100">
                      {escola.logo_url ? (
                        <img src={escola.logo_url} alt={escola.nome} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={18} />
                      )}
                    </div>
                    <div className="flex-1 pr-6">
                      <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-amber-600 transition-colors">
                        {escola.nome}
                      </h3>
                      <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase block mt-1">
                        Arapongas — SEMED
                      </span>
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="flex items-start gap-1.5 text-slate-650 text-xs mt-1.5">
                    <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{escola.endereco}</span>
                  </div>

                  {/* Turnos */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {escola.turnos.map((turno) => (
                      <span
                        key={turno}
                        className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50"
                      >
                        <Clock size={8} />
                        {turno}
                      </span>
                    ))}
                  </div>

                  {/* Séries Atendidas */}
                  {escola.series && escola.series.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 border-t border-slate-100 pt-2">
                      {escola.series.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-55 text-slate-600 border border-slate-200/60"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer do Card / Ações */}
                <div className="flex items-center justify-between border-t border-slate-100 mt-5 pt-3.5">
                  <span className="text-[10px] font-bold text-amber-600 group-hover:underline">
                    Ver alunos →
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNome(escola.nome);
                        setEndereco(escola.endereco);
                        setLatitude(escola.latitude !== undefined && escola.latitude !== null ? String(escola.latitude) : '');
                        setLongitude(escola.longitude !== undefined && escola.longitude !== null ? String(escola.longitude) : '');
                        setTurnos(escola.turnos);
                        setTipo(escola.tipo || 'municipal');
                        setSelectedSeries(escola.series || []);
                        setLogoFile(null);
                        setLogoUrl(escola.logo_url || '');
                        setModalEditar(escola);
                      }}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-950 transition-colors border border-transparent hover:border-slate-200"
                      title="Editar Escola"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(escola.id);
                      }}
                      className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors border border-transparent hover:border-rose-100"
                      title="Excluir Escola"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: NOVA ESCOLA */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border flex flex-col animate-fadeIn">
            <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Nova Escola</h3>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5 uppercase">SEMED Arapongas</span>
              </div>
              <button onClick={() => setModalNovo(false)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={15} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-3">
              
              {/* Seletor de Logo da Escola */}
              <div className="flex flex-col items-center gap-2 mb-2">
                <div 
                  onClick={() => document.getElementById('school-logo-input')?.click()}
                  className="w-20 h-20 rounded-2xl bg-amber-50 border border-slate-200 overflow-hidden flex items-center justify-center cursor-pointer relative group transition-all duration-200 hover:border-amber-500 hover:scale-[1.02]"
                  title="Clique para alterar a logo da escola"
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo da Escola" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2 flex flex-col items-center gap-1">
                      <Building2 size={24} className="text-amber-500" />
                      <span className="text-[8px] text-slate-500 font-bold uppercase leading-none">Sem Logo</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white gap-1 select-none">
                    <span className="text-[8px] font-black uppercase tracking-wider text-amber-400">Alterar</span>
                  </div>
                </div>

                <input
                  type="file"
                  id="school-logo-input"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLogoFile(file);
                      setLogoUrl(URL.createObjectURL(file));
                    }
                  }}
                />
                <span className="text-[9px] text-slate-400 font-bold">Emblema recomendado (1:1)</span>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nome da Escola</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome oficial da escola"
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Endereço</label>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setIsMapModalOpen(true)}
                      className="text-[9px] font-bold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      <MapPin size={10} /> Pegar no Mapa
                    </button>
                    <button 
                      type="button" 
                      onClick={handleGeocode}
                      disabled={isGeocoding || !endereco.trim()}
                      className="text-[9px] font-bold text-amber-500 hover:text-amber-600 disabled:opacity-50 transition-colors flex items-center gap-1"
                    >
                      {isGeocoding ? (
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 border border-amber-500 border-t-transparent rounded-full animate-spin"></span>Buscando...</span>
                      ) : (
                        <span className="flex items-center gap-1"><MapPin size={10} /> Auto-preencher Coordenadas</span>
                      )}
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, Número - Bairro"
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Latitude</label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Ex: -23.4178"
                    className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Longitude</label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Ex: -51.4269"
                    className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Turnos Atendidos</label>
                <div className="flex flex-col gap-2 bg-slate-50 border p-3 rounded-2xl">
                  {['Manhã', 'Tarde', 'Noite'].map((turno) => (
                    <label key={turno} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={turnos.includes(turno)}
                        onChange={() => toggleTurno(turno)}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-xs font-bold text-slate-700">{turno}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Tipo de Escola</label>
                <select
                  value={tipo}
                  onChange={(e) => {
                    setTipo(e.target.value as 'municipal' | 'estadual');
                    setSelectedSeries([]);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-slate-900 transition-all cursor-pointer"
                >
                  <option value="municipal">Municipal (Prefeitura)</option>
                  <option value="estadual">Estadual</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">Séries Atendidas</label>
                <div className="flex flex-col gap-2 bg-slate-50 border p-3 rounded-2xl max-h-[160px] overflow-y-auto">
                  {(tipo === 'municipal' ? SERIES_MUNICIPAIS : SERIES_ESTADUAIS).map((serie) => (
                    <label key={serie} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedSeries.includes(serie)}
                        onChange={() => toggleSerieSelection(serie)}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-xs font-bold text-slate-700">{serie}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t bg-slate-50 flex gap-2 justify-end">
              <button
                disabled={loadingAction}
                onClick={() => setModalNovo(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold border text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={!nome.trim() || !endereco.trim() || turnos.length === 0 || selectedSeries.length === 0 || loadingAction}
                onClick={handleCreate}
                className={`py-2.5 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow ${
                  nome.trim() && endereco.trim() && turnos.length > 0 && selectedSeries.length > 0 && !loadingAction ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-450 border cursor-not-allowed'
                }`}
              >
                {loadingAction ? <div className="w-3.5 h-3.5 border-2 border-slate-550 border-t-transparent rounded-full animate-spin" /> : 'Salvar Escola'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR ESCOLA */}
      {modalEditar && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border flex flex-col animate-fadeIn">
            <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Editar Escola</h3>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5 uppercase">SEMED Arapongas</span>
              </div>
              <button onClick={() => setModalEditar(null)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={15} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-3">
              
              {/* Seletor de Logo da Escola */}
              <div className="flex flex-col items-center gap-2 mb-2">
                <div 
                  onClick={() => document.getElementById('school-logo-input-edit')?.click()}
                  className="w-20 h-20 rounded-2xl bg-amber-50 border border-slate-200 overflow-hidden flex items-center justify-center cursor-pointer relative group transition-all duration-200 hover:border-amber-500 hover:scale-[1.02]"
                  title="Clique para alterar a logo da escola"
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo da Escola" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2 flex flex-col items-center gap-1">
                      <Building2 size={24} className="text-amber-500" />
                      <span className="text-[8px] text-slate-500 font-bold uppercase leading-none">Sem Logo</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white gap-1 select-none">
                    <span className="text-[8px] font-black uppercase tracking-wider text-amber-400">Alterar</span>
                  </div>
                </div>

                <input
                  type="file"
                  id="school-logo-input-edit"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLogoFile(file);
                      setLogoUrl(URL.createObjectURL(file));
                    }
                  }}
                />
                <span className="text-[9px] text-slate-400 font-bold">Emblema recomendado (1:1)</span>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nome da Escola</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome oficial da escola"
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Endereço</label>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setIsMapModalOpen(true)}
                      className="text-[9px] font-bold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      <MapPin size={10} /> Pegar no Mapa
                    </button>
                    <button 
                      type="button" 
                      onClick={handleGeocode}
                      disabled={isGeocoding || !endereco.trim()}
                      className="text-[9px] font-bold text-amber-500 hover:text-amber-600 disabled:opacity-50 transition-colors flex items-center gap-1"
                    >
                      {isGeocoding ? (
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 border border-amber-500 border-t-transparent rounded-full animate-spin"></span>Buscando...</span>
                      ) : (
                        <span className="flex items-center gap-1"><MapPin size={10} /> Auto-preencher Coordenadas</span>
                      )}
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, Número - Bairro"
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 transition-all"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Latitude</label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Ex: -23.4178"
                    className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Longitude</label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Ex: -51.4269"
                    className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Turnos Atendidos</label>
                <div className="flex flex-col gap-2 bg-slate-50 border p-3 rounded-2xl">
                  {['Manhã', 'Tarde', 'Noite'].map((turno) => (
                    <label key={turno} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={turnos.includes(turno)}
                        onChange={() => toggleTurno(turno)}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-xs font-bold text-slate-700">{turno}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Tipo de Escola</label>
                <select
                  value={tipo}
                  onChange={(e) => {
                    setTipo(e.target.value as 'municipal' | 'estadual');
                    setSelectedSeries([]);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-slate-900 transition-all cursor-pointer"
                >
                  <option value="municipal">Municipal (Prefeitura)</option>
                  <option value="estadual">Estadual</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">Séries Atendidas</label>
                <div className="flex flex-col gap-2 bg-slate-50 border p-3 rounded-2xl max-h-[160px] overflow-y-auto">
                  {(tipo === 'municipal' ? SERIES_MUNICIPAIS : SERIES_ESTADUAIS).map((serie) => (
                    <label key={serie} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedSeries.includes(serie)}
                        onChange={() => toggleSerieSelection(serie)}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-xs font-bold text-slate-700">{serie}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t bg-slate-50 flex gap-2 justify-end">
              <button
                disabled={loadingAction}
                onClick={() => setModalEditar(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold border text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={!nome.trim() || !endereco.trim() || turnos.length === 0 || selectedSeries.length === 0 || loadingAction}
                onClick={handleUpdate}
                className={`py-2.5 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow ${
                  nome.trim() && endereco.trim() && turnos.length > 0 && selectedSeries.length > 0 && !loadingAction ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-450 border cursor-not-allowed'
                }`}
              >
                {loadingAction ? <div className="w-3.5 h-3.5 border-2 border-slate-550 border-t-transparent rounded-full animate-spin" /> : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      <MapPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        initialLat={latitude ? parseFloat(latitude.replace(',', '.')) : undefined}
        initialLng={longitude ? parseFloat(longitude.replace(',', '.')) : undefined}
        onConfirm={(lat, lng) => {
          setLatitude(lat.toString());
          setLongitude(lng.toString());
          setIsMapModalOpen(false);
        }}
      />
    </div>
  );
}
