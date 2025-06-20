export const REPORT_CATEGORIES = [
  'Iluminação Pública',
  'Buracos na Via',
  'Limpeza Urbana',
  'Transporte Público',
  'Segurança',
  'Infraestrutura',
  'Meio Ambiente',
  'Ruído',
  'Acessibilidade',
  'Sinalização'
] as const;

export type ReportCategory = typeof REPORT_CATEGORIES[number];

export const CATEGORY_DESCRIPTIONS = {
  'Iluminação Pública': 'Problemas com iluminação de ruas e praças',
  'Buracos na Via': 'Buracos, crateras e problemas no asfalto',
  'Limpeza Urbana': 'Coleta de lixo, limpeza de vias e praças',
  'Transporte Público': 'Ônibus, pontos de ônibus, acessibilidade',
  'Segurança': 'Policiamento, vigilância, segurança pública',
  'Infraestrutura': 'Calçadas, pontes, redes de água e esgoto',
  'Meio Ambiente': 'Áreas verdes, poluição, preservação',
  'Ruído': 'Poluição sonora, barulho excessivo',
  'Acessibilidade': 'Rampas, passarelas, acesso para PCD',
  'Sinalização': 'Placas, semáforos, sinalização viária'
} as const;
