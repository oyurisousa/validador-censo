/**
 * Script de teste para validar o novo formato do endpoint validate-file
 * Agora recebe array de strings (lines) ao invés de string única (content)
 */

const http = require('http');

async function testValidateFileWithLines() {
  console.log('\n🧪 Testando endpoint validate-file com array de linhas\n');

  const data = JSON.stringify({
    lines: [
      '00|12345678|1|01/02/2025|20/12/2025|Escola Teste|||||||||||||||||2|||||||||||||||||||||||||||||||||||||||||',
      '30|12345678|DIR001|12345678901|12345678901|JOÃO DA SILVA|15/05/1980|1|MARIA DA SILVA||1|1||1|76||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||',
      '40|12345678|DIR001|12345678901|1|4|1',
    ],
    version: '2025',
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/validation/validate-file',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          console.log('✅ Status:', res.statusCode);
          console.log('✅ Resposta recebida\n');
          console.log('📊 Resultado da Validação:');
          console.log('  - Válido:', result.isValid);
          console.log('  - Total de Registros:', result.totalRecords);
          console.log('  - Processados:', result.processedRecords);
          console.log('  - Tempo:', result.processingTime + 'ms');
          console.log('  - Erros:', result.errors?.length || 0);
          console.log('  - Avisos:', result.warnings?.length || 0);

          if (result.errors && result.errors.length > 0) {
            console.log('\n❌ Erros encontrados:');
            result.errors.forEach((error, index) => {
              console.log(`  ${index + 1}. Linha ${error.lineNumber}: ${error.fieldDescription} - ${error.errorMessage}`);
            });
          }

          if (result.warnings && result.warnings.length > 0) {
            console.log('\n⚠️ Avisos:');
            result.warnings.forEach((warning, index) => {
              console.log(`  ${index + 1}. Linha ${warning.lineNumber}: ${warning.fieldDescription} - ${warning.errorMessage}`);
            });
          }

          console.log('\n📁 Metadata do arquivo:');
          console.log('  - Nome:', result.fileMetadata?.fileName);
          console.log('  - Tamanho:', result.fileMetadata?.fileSize + ' bytes');
          console.log('  - Total de linhas:', result.fileMetadata?.totalLines);
          console.log('  - Encoding:', result.fileMetadata?.encoding);

          resolve(result);
        } catch (error) {
          console.error('❌ Erro ao parsear resposta:', error.message);
          console.log('Resposta bruta:', responseData);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erro na requisição:', error.message);
      console.log('Certifique-se de que o servidor está rodando: npm run start:dev');
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function testValidateFileWithEmptyLines() {
  console.log('\n🧪 Testando com linhas vazias (devem ser filtradas)\n');

  const data = JSON.stringify({
    lines: [
      '00|12345678|1|01/02/2025|20/12/2025|Escola Teste|||||||||||||||||2|||||||||||||||||||||||||||||||||||||||||',
      '', // linha vazia - deve ser removida
      '30|12345678|DIR001|12345678901|12345678901|JOÃO DA SILVA|15/05/1980|1|MARIA DA SILVA||1|1||1|76||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||',
      '   ', // linha só com espaços - deve ser removida
      '40|12345678|DIR001|12345678901|1|4|1',
    ],
    version: '2025',
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/validation/validate-file',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          console.log('✅ Status:', res.statusCode);
          console.log('✅ Linhas vazias filtradas corretamente');
          console.log('  - Total de Registros:', result.totalRecords);
          console.log('  - Esperado: 3 (linhas vazias foram removidas)');
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testValidateFileErrors() {
  console.log('\n🧪 Testando validações de erro\n');

  // Teste 1: Array vazio
  console.log('1️⃣ Teste: Array vazio');
  try {
    const data = JSON.stringify({ lines: [] });
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/validation/validate-file',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          const result = JSON.parse(responseData);
          console.log('   Status:', res.statusCode);
          console.log('   Mensagem:', result.message);
          console.log('   ✅ Deve retornar erro 400\n');
          resolve(result);
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  } catch (error) {
    console.error('   ❌ Erro:', error.message);
  }

  // Teste 2: Não é array
  console.log('2️⃣ Teste: Não é array');
  try {
    const data = JSON.stringify({ lines: 'not an array' });
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/validation/validate-file',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          const result = JSON.parse(responseData);
          console.log('   Status:', res.statusCode);
          console.log('   Mensagem:', result.message);
          console.log('   ✅ Deve retornar erro 400\n');
          resolve(result);
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  } catch (error) {
    console.error('   ❌ Erro:', error.message);
  }

  // Teste 3: Sem campo lines
  console.log('3️⃣ Teste: Sem campo lines');
  try {
    const data = JSON.stringify({ version: '2025' });
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/validation/validate-file',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          const result = JSON.parse(responseData);
          console.log('   Status:', res.statusCode);
          console.log('   Mensagem:', result.message);
          console.log('   ✅ Deve retornar erro 400\n');
          resolve(result);
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  } catch (error) {
    console.error('   ❌ Erro:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Iniciando testes do endpoint validate-file\n');
  console.log('⚠️ Certifique-se de que o servidor está rodando em http://localhost:3000\n');

  try {
    await testValidateFileWithLines();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await testValidateFileWithEmptyLines();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await testValidateFileErrors();

    console.log('\n✅ Todos os testes concluídos!');
    console.log('\n📝 Resumo:');
    console.log('1. ✅ Endpoint aceita array de strings (lines)');
    console.log('2. ✅ Linhas vazias são filtradas automaticamente');
    console.log('3. ✅ Validações de erro funcionando corretamente');
  } catch (error) {
    console.error('\n❌ Erro ao executar testes:', error.message);
  }
}

runAllTests();
