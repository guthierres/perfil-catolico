export const getDisplayName = (name: string, civilStatus: string | null): string => {
  if (civilStatus === 'padre' && name && !name.toLowerCase().startsWith('pe.')) {
    return `Pe. ${name}`;
  }
  return name;
};

export const getCivilStatusLabel = (status: string | null): string => {
  const labels: Record<string, string> = {
    solteiro: 'Solteiro(a)',
    casado: 'Casado(a)',
    namorando: 'Namorando',
    religioso: 'Religioso(a)',
    seminarista: 'Seminarista',
    diacono: 'Diácono',
    padre: 'Padre',
  };
  return status ? labels[status] || status : '';
};

export const getSacramentLabel = (sacrament: string): string => {
  const labels: Record<string, string> = {
    batismo: 'Batismo',
    confissao: 'Confissão',
    eucaristia: 'Eucaristia',
    crisma: 'Crisma',
    matrimonio: 'Matrimônio',
    ordem: 'Ordem',
    uncao: 'Unção dos Enfermos',
  };
  return labels[sacrament] || sacrament;
};
