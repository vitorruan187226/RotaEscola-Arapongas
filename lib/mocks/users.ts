export interface MockUser {
  cpf: string;
  senha: string;
  nome: string;
  tipo_usuario: 'Secretaria' | 'Responsável';
  detalhes: {
    cargo?: string;
    filho?: string;
    escola?: string;
  };
}

export const mockUsers: MockUser[] = [
  {
    cpf: '11111111111',
    senha: 'secretariasenha',
    nome: 'Maria Silva (Gestora)',
    tipo_usuario: 'Secretaria',
    detalhes: {
      cargo: 'Supervisora de Transportes',
    }
  },
  {
    cpf: '22222222222',
    senha: 'responsavelsenha',
    nome: 'José Santos (Responsável)',
    tipo_usuario: 'Responsável',
    detalhes: {
      filho: 'Pedro Henrique Silva',
      escola: 'Escola Municipal Codorna',
    }
  }
];
