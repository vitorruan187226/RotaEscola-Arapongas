export interface Aluno {
  id: string;
  nome: string;
  documento: string;
  escola: string;
  serie: string;
  rotaId?: string;
}

export interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  capacidade: number;
  motoristaId?: string;
}

export interface Rota {
  id: string;
  nome: string;
  turno: 'Matutino' | 'Vespertino' | 'Noturno';
  veiculoId?: string;
}

export interface Carteirinha {
  id: string;
  alunoId: string;
  qrCodeHash: string;
  ativa: boolean;
}
