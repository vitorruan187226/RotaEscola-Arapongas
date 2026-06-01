export interface AlunoMock {
  id: string;
  nome: string;
  escola: string;
  escolaId?: string;
  serie: string;
  statusCarteirinha: 'Em análise' | 'Aprovado' | 'Pendente';
  enviadoEm: string;
  rotaId?: string;
}

export const ALUNOS_MOCK_GLOBAL: AlunoMock[] = [
  { id: 'aluno-mock-1', nome: 'Mariana Costa Souza', escola: 'Colégio Estadual Julia Wanderley', escolaId: 'b73e2840-7288-4682-9642-17cb25e36002', serie: '7º Ano A', statusCarteirinha: 'Em análise', enviadoEm: '26/05/2026' },
  { id: 'aluno-mock-2', nome: 'Felipe Nascimento Torres', escola: 'Escola Municipal Codorna', escolaId: 'b73e2840-7288-4682-9642-17cb25e36003', serie: '2º Ano C', statusCarteirinha: 'Em análise', enviadoEm: '25/05/2026' },
  { id: 'aluno-mock-3', nome: 'Beatriz Martins Nogueira', escola: 'Colégio Estadual Julia Wanderley', escolaId: 'b73e2840-7288-4682-9642-17cb25e36002', serie: '7º Ano A', statusCarteirinha: 'Em análise', enviadoEm: '24/05/2026' },
  { id: 'aluno-mock-4', nome: 'Thiago Martins Nogueira', escola: 'Escola Municipal Dorcelina Folador', escolaId: 'b73e2840-7288-4682-9642-17cb25e36001', serie: '4º Ano B', statusCarteirinha: 'Aprovado', enviadoEm: '22/05/2026', rotaId: 'RT-04' },
  { id: 'aluno-mock-5', nome: 'Pedro Henrique Silva', escola: 'Escola Municipal Codorna', escolaId: 'b73e2840-7288-4682-9642-17cb25e36003', serie: '2º Ano C', statusCarteirinha: 'Pendente', enviadoEm: '21/05/2026' },
  { id: 'aluno-mock-6', nome: 'Sophia Moraes Dias', escola: 'Colégio Estadual Julia Wanderley', escolaId: 'b73e2840-7288-4682-9642-17cb25e36002', serie: '6º Ano B', statusCarteirinha: 'Pendente', enviadoEm: '20/05/2026' }
];
