/**
 * Script de teste para validar o comportamento de early stopping
 * do método validateSingleLine
 */

const http = require('http');

// Teste 1: Tipo de registro inválido no parâmetro
async function test1_invalidRecordTypeParameter() {
  console.log('\n=== TESTE 1: Tipo de registro inválido no parâmetro ===');

  const data = JSON.stringify({
    recordType: '99', // Tipo inválido
    line: '00|12345678|1|01/02/2025|20/12/2025|Escola Teste',
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/validation/validate-line',
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
        const result = JSON.parse(responseData);
        console.log('Status:', res.statusCode);
        console.log('Erros:', result.errors?.length || 0);
        console.log('Primeiro erro:', result.errors?.[0]);
        console.log('✅ Deveria ter apenas 1 erro sobre tipo inválido');
        resolve(result);
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Teste 2: Tipo de registro na linha diferente do solicitado
async function test2_recordTypeMismatch() {
  console.log('\n=== TESTE 2: Tipo de registro na linha diferente do solicitado ===');

  const data = JSON.stringify({
    recordType: '00', // Esperado: School Identification
    line: '20|12345678|TURMA01|001|TURMA A|1||||||1', // Enviado: Classes (20)
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/validation/validate-line',
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
        const result = JSON.parse(responseData);
        console.log('Status:', res.statusCode);
        console.log('Erros:', result.errors?.length || 0);
        console.log('Primeiro erro:', result.errors?.[0]);
        console.log('✅ Deveria ter apenas 1 erro sobre mismatch de tipo (esperado 00, recebido 20)');
        console.log('✅ NÃO deveria ter erros sobre campos individuais');
        resolve(result);
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Teste 3: Quantidade incorreta de campos
async function test3_fieldCountMismatch() {
  console.log('\n=== TESTE 3: Quantidade incorreta de campos ===');

  const data = JSON.stringify({
    recordType: '00', // Esperado: 56 campos
    line: '00|12345678|1', // Enviado: apenas 3 campos
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/validation/validate-line',
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
        const result = JSON.parse(responseData);
        console.log('Status:', res.statusCode);
        console.log('Erros:', result.errors?.length || 0);
        console.log('Primeiro erro:', result.errors?.[0]);
        console.log('✅ Deveria ter apenas 1 erro sobre quantidade de campos (esperado 56, recebido 3)');
        console.log('✅ NÃO deveria ter erros sobre campos individuais');
        resolve(result);
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Teste 4: Validação normal (tudo correto)
async function test4_normalValidation() {
  console.log('\n=== TESTE 4: Validação normal com tipo e quantidade corretos ===');

  // Criar uma linha com 56 campos (tipo 00)
  const fields = new Array(56).fill('');
  fields[0] = '00'; // tipo_registro
  fields[1] = '12345678'; // codigo_inep
  fields[2] = '1'; // situacao_funcionamento
  const line = fields.join('|');

  const data = JSON.stringify({
    recordType: '00',
    line: line,
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/validation/validate-line',
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
        const result = JSON.parse(responseData);
        console.log('Status:', res.statusCode);
        console.log('Erros:', result.errors?.length || 0);
        console.log('Warnings:', result.warnings?.length || 0);
        console.log('✅ Agora PODE ter erros de validação de campos individuais (datas, etc)');
        if (result.errors?.length > 0) {
          console.log('Exemplos de erros:', result.errors.slice(0, 3).map(e => e.ruleName));
        }
        resolve(result);
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Executar todos os testes
async function runAllTests() {
  console.log('🧪 Iniciando testes de Early Stopping para validateSingleLine\n');
  console.log('⚠️ Certifique-se de que o servidor está rodando em http://localhost:3000\n');

  try {
    await test1_invalidRecordTypeParameter();
    await new Promise(resolve => setTimeout(resolve, 500));

    await test2_recordTypeMismatch();
    await new Promise(resolve => setTimeout(resolve, 500));

    await test3_fieldCountMismatch();
    await new Promise(resolve => setTimeout(resolve, 500));

    await test4_normalValidation();

    console.log('\n✅ Todos os testes concluídos!');
    console.log('\n📝 Resumo do comportamento esperado:');
    console.log('1. Tipo inválido → 1 erro');
    console.log('2. Mismatch de tipo → 1 erro (não valida campos)');
    console.log('3. Quantidade de campos errada → 1 erro (não valida campos)');
    console.log('4. Estrutura OK → valida campos normalmente');

  } catch (error) {
    console.error('\n❌ Erro ao executar testes:', error.message);
    console.error('Certifique-se de que o servidor está rodando: npm run start:dev');
  }
}

runAllTests();
