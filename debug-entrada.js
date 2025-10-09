async function debugValidacao() {
  console.log('=== DEBUG DETALHADO DA VALIDAÇÃO ===\n');

  // Simulação mais simples para debugar
  const testContent = `00|28000001|ESCOLA TESTE|1|||||||||||||||||||1||||||||||||||||||||||||||||||||||||
20|1|TURMA001|TURMA A|1|1|||||||||1||||||||||||||1||||||||||||||||||||||||||||||||||||||||`;

  console.log('📝 DADOS DE ENTRADA:');
  console.log(testContent);
  console.log('\n' + '='.repeat(80) + '\n');

  // Vamos testar a validação passo a passo
  const lines = testContent.split('\n');

  console.log(`📊 ESTRUTURA DOS DADOS:`);
  console.log(`   Total de linhas: ${lines.length}`);

  lines.forEach((line, index) => {
    const recordType = line.split('|')[0];
    console.log(`   Linha ${index + 1}: Tipo ${recordType} - "${line.substring(0, 50)}..."`);
  });

  console.log('\n' + '='.repeat(80) + '\n');

  // IMPORTANTE: Vamos verificar se há duplicação já na entrada
  const registro20Lines = lines.filter(line => line.startsWith('20|'));
  console.log(`🔍 VERIFICAÇÃO DE DUPLICAÇÃO NA ENTRADA:`);
  console.log(`   Linhas do registro 20 encontradas: ${registro20Lines.length}`);

  if (registro20Lines.length > 1) {
    console.log('   ❌ PROBLEMA: Há múltiplas linhas de registro 20 na entrada!');
    registro20Lines.forEach((line, index) => {
      console.log(`   ${index + 1}. "${line}"`);
    });
    return;
  } else if (registro20Lines.length === 1) {
    console.log('   ✅ OK: Apenas 1 linha do registro 20 na entrada');
    console.log(`   Conteúdo: "${registro20Lines[0]}"`);
  }

  console.log('\n🎯 CONCLUSÃO: O problema NÃO está na duplicação de dados de entrada.');
  console.log('   A duplicação deve estar no processamento interno da validação.\n');
}

// Executar debug
debugValidacao()
  .then(() => {
    console.log('✅ Debug concluído');
  })
  .catch(error => {
    console.error('❌ Erro no debug:', error);
  });
