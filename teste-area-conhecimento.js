// Teste para verificar se a área do conhecimento "5" (Ciências) é válida
const knowledgeAreas = {
  '1': 'Química',
  '2': 'Física',
  '3': 'Matemática',
  '4': 'Biologia',
  '5': 'Ciências',
  '6': 'Língua/Literatura Portuguesa',
  '7': 'Língua/Literatura estrangeira - Inglês',
  '8': 'Língua/Literatura estrangeira - Espanhol',
  '9': 'Língua/Literatura estrangeira - outra',
  '10': 'Arte (Educação Artística, Teatro, Dança, Música, Artes Plásticas e outras)',
  '11': 'Educação Física',
  '12': 'História',
  '13': 'Geografia',
  '14': 'Filosofia',
  '16': 'Informática/Computação',
  '17': 'Áreas do conhecimento profissionalizantes',
  '23': 'Libras',
  '25': 'Áreas do conhecimento pedagógicas',
  '26': 'Ensino religioso',
  '27': 'Língua indígena',
  '28': 'Estudos Sociais',
  '29': 'Sociologia',
  '30': 'Língua/Literatura estrangeira - Francês',
  '31': 'Língua Portuguesa como Segunda Língua',
  '32': 'Estágio curricular supervisionado',
  '33': 'Projeto de vida',
  '99': 'Outras áreas do conhecimento',
};

console.log('=== TESTE DE VALIDAÇÃO DA ÁREA DO CONHECIMENTO ===\n');

const testArea = '5';
console.log(`Testando código: "${testArea}"`);
console.log(`Existe na lista: ${knowledgeAreas[testArea] ? 'SIM' : 'NÃO'}`);

if (knowledgeAreas[testArea]) {
  console.log(`Descrição: "${knowledgeAreas[testArea]}"`);
  console.log('✅ RESULTADO: Código válido - não deveria gerar erro');
} else {
  console.log('❌ RESULTADO: Código inválido - geraria erro');
}

console.log('\n=== VERIFICAÇÃO GERAL ===');
console.log(`Total de códigos válidos: ${Object.keys(knowledgeAreas).length}`);
console.log('Códigos disponíveis:', Object.keys(knowledgeAreas).sort((a, b) => parseInt(a) - parseInt(b)).join(', '));
