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

// Accessibility-focused category configuration with icons and colors
export const CATEGORY_CONFIG = {
  'Iluminação Pública': {
    icon: '💡',
    emoji: '🔦',
    color: '#f59e0b', // amber
    bgColor: '#fef3c7', // amber-100
    description: 'Problemas com iluminação de ruas e praças',
    examples: ['Poste queimado', 'Rua escura', 'Luz piscando'],
    priority: 'alta'
  },
  'Buracos na Via': {
    icon: '🕳️',
    emoji: '🚧',
    color: '#dc2626', // red
    bgColor: '#fecaca', // red-200
    description: 'Buracos, crateras e problemas no asfalto',
    examples: ['Buraco grande', 'Asfalto quebrado', 'Via danificada'],
    priority: 'crítica'
  },
  'Limpeza Urbana': {
    icon: '🗑️',
    emoji: '🧹',
    color: '#059669', // emerald
    bgColor: '#d1fae5', // emerald-100
    description: 'Coleta de lixo, limpeza de vias e praças',
    examples: ['Lixo acumulado', 'Coleta atrasada', 'Via suja'],
    priority: 'média'
  },
  'Transporte Público': {
    icon: '🚌',
    emoji: '🚍',
    color: '#2563eb', // blue
    bgColor: '#dbeafe', // blue-100
    description: 'Ônibus, pontos de ônibus, acessibilidade',
    examples: ['Ponto quebrado', 'Ônibus atrasado', 'Acesso difícil'],
    priority: 'alta'
  },
  'Segurança': {
    icon: '🚨',
    emoji: '👮',
    color: '#7c2d12', // red-800
    bgColor: '#fed7d7', // red-100
    description: 'Policiamento, vigilância, segurança pública',
    examples: ['Falta policiamento', 'Local perigoso', 'Iluminação segurança'],
    priority: 'crítica'
  },
  'Infraestrutura': {
    icon: '🏗️',
    emoji: '⚙️',
    color: '#374151', // gray-700
    bgColor: '#f3f4f6', // gray-100
    description: 'Calçadas, pontes, redes de água e esgoto',
    examples: ['Calçada quebrada', 'Esgoto vazando', 'Ponte danificada'],
    priority: 'alta'
  },
  'Meio Ambiente': {
    icon: '🌳',
    emoji: '🌿',
    color: '#065f46', // emerald-800
    bgColor: '#ecfdf5', // emerald-50
    description: 'Áreas verdes, poluição, preservação',
    examples: ['Árvore caída', 'Poluição ar', 'Área verde abandonada'],
    priority: 'média'
  },
  'Ruído': {
    icon: '🔊',
    emoji: '🔇',
    color: '#7c2d12', // red-800
    bgColor: '#fef2f2', // red-50
    description: 'Poluição sonora, barulho excessivo',
    examples: ['Som alto', 'Obras barulhentas', 'Trânsito ruidoso'],
    priority: 'média'
  },
  'Acessibilidade': {
    icon: '♿',
    emoji: '🦽',
    color: '#1d4ed8', // blue-700
    bgColor: '#eff6ff', // blue-50
    description: 'Rampas, passarelas, acesso para pessoas com deficiência',
    examples: ['Rampa quebrada', 'Calçada irregular', 'Falta acesso PCD'],
    priority: 'alta'
  },
  'Sinalização': {
    icon: '🚦',
    emoji: '⚠️',
    color: '#ea580c', // orange-600
    bgColor: '#fff7ed', // orange-50
    description: 'Placas, semáforos, sinalização viária',
    examples: ['Semáforo quebrado', 'Placa caída', 'Falta sinalização'],
    priority: 'alta'
  }
} as const;
