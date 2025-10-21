/**
 * Teste de Validação de Campos Vazios vs "0" - Registro 60 (Matrícula)
 * 
 * Este teste verifica que o sistema diferencia corretamente:
 * - Campos vazios (não preenchidos): ''
 * - Campos preenchidos com "0": '0' (Não)
 * - Campos preenchidos com "1": '1' (Sim)
 * 
 * Baseado na correção conceitual documentada em:
 * - docs/correcao-conceito-campos-vazios.md
 * - docs/auditoria-completa-campos-vazios.md
 */

const { StudentEnrollmentRule } = require('../src/validation/rules/record-rules/student-enrollment.rule');

// Mock dos contextos
const mockSchoolContext = {
  schoolCode: '12345678',
  persons: [{ personCode: 'P001' }],
  classes: [{ classCode: 'T001' }],
};

const mockClassContext = {
  teachingMediation: 1, // Presencial
  stage: 25, // Ensino Médio
  isRegular: true,
  specializedEducationalService: true, // Oferece AEE
  differentiatedLocation: 0,
};

const mockPersonContext = {
  inepId: '123456789012',
  residenceCountry: 76, // Brasil
};

const rule = new StudentEnrollmentRule();

console.log('🧪 TESTE: Diferença entre campos vazios e "0" - Registro 60 (Matrícula)\n');
console.log('='.repeat(80) + '\n');

// ===========================
// CENÁRIO 1: Todos os campos AEE vazios (não preenchidos)
// ===========================
console.log('📋 CENÁRIO 1: Campos de AEE vazios (turma com AEE)');
console.log('-'.repeat(80));

const parts1 = [
  '60',            // 0: record_type
  '12345678',      // 1: school_code
  'P001',          // 2: person_code
  '123456789012',  // 3: inep_id
  'T001',          // 4: class_code
  '',              // 5: inep_class_code (não deve ser preenchido)
  '',              // 6: enrollment_code (não deve ser preenchido)
  '',              // 7: multi_class
  '',              // 8: cognitive_functions - VAZIO
  '',              // 9: autonomous_life - VAZIO
  '',              // 10: curriculum_enrichment - VAZIO
  '',              // 11: accessible_computing - VAZIO
  '',              // 12: libras_teaching - VAZIO
  '',              // 13: portuguese_second_language - VAZIO
  '',              // 14: soroban_techniques - VAZIO
  '',              // 15: braille_system - VAZIO
  '',              // 16: orientation_mobility - VAZIO
  '',              // 17: alternative_communication - VAZIO
  '',              // 18: optical_resources - VAZIO
  '',              // 19: schooling_other_space
  '0',             // 20: public_transport
];

const errors1 = rule.validateWithContext(
  parts1,
  mockSchoolContext,
  mockClassContext,
  mockPersonContext,
  1
);

const aeeErrors1 = errors1.filter(e =>
  e.fieldName === 'specialized_education_services' ||
  (e.fieldName && (e.fieldName.includes('cognitive') ||
    e.fieldName.includes('autonomous') ||
    e.fieldName.includes('curriculum') ||
    e.fieldName.includes('computing') ||
    e.fieldName.includes('libras') ||
    e.fieldName.includes('portuguese') ||
    e.fieldName.includes('soroban') ||
    e.fieldName.includes('braille') ||
    e.fieldName.includes('orientation') ||
    e.fieldName.includes('communication') ||
    e.fieldName.includes('optical')))
);

console.log(`Campos 9-19 (AEE): ${parts1.slice(8, 19).map(v => v === '' ? '[VAZIO]' : v).join(', ')}`);
console.log(`Erros de AEE encontrados: ${aeeErrors1.length}`);
if (aeeErrors1.length > 0) {
  console.log('  ✅ Erros de obrigatoriedade (correto - campos são obrigatórios quando AEE = Sim)');
  console.log(`     Total: ${aeeErrors1.length} campos não preenchidos`);
} else {
  console.log('  ❌ Deveria ter erros de obrigatoriedade');
}
console.log();

// ===========================
// CENÁRIO 2: Todos os campos AEE preenchidos com "0"
// ===========================
console.log('📋 CENÁRIO 2: Campos de AEE explicitamente "0" (turma com AEE)');
console.log('-'.repeat(80));

const parts2 = [
  '60',            // 0: record_type
  '12345678',      // 1: school_code
  'P001',          // 2: person_code
  '123456789012',  // 3: inep_id
  'T001',          // 4: class_code
  '',              // 5: inep_class_code
  '',              // 6: enrollment_code
  '',              // 7: multi_class
  '0',             // 8: cognitive_functions - ZERO EXPLÍCITO
  '0',             // 9: autonomous_life - ZERO EXPLÍCITO
  '0',             // 10: curriculum_enrichment - ZERO EXPLÍCITO
  '0',             // 11: accessible_computing - ZERO EXPLÍCITO
  '0',             // 12: libras_teaching - ZERO EXPLÍCITO
  '0',             // 13: portuguese_second_language - ZERO EXPLÍCITO
  '0',             // 14: soroban_techniques - ZERO EXPLÍCITO
  '0',             // 15: braille_system - ZERO EXPLÍCITO
  '0',             // 16: orientation_mobility - ZERO EXPLÍCITO
  '0',             // 17: alternative_communication - ZERO EXPLÍCITO
  '0',             // 18: optical_resources - ZERO EXPLÍCITO
  '',              // 19: schooling_other_space
  '0',             // 20: public_transport
];

const errors2 = rule.validateWithContext(
  parts2,
  mockSchoolContext,
  mockClassContext,
  mockPersonContext,
  2
);

console.log('DEBUG - Todos os erros:', errors2.map(e => e.fieldName));

const aeeErrors2 = errors2.filter(e =>
  e.fieldName === 'specialized_education_services'
);

console.log(`Campos 9-19 (AEE): ${parts2.slice(8, 19).join(', ')}`);
console.log(`Erros de validação "todos 0": ${aeeErrors2.length}`);
if (aeeErrors2.length > 0) {
  aeeErrors2.forEach(err => {
    console.log(`  ✅ ${err.field}: ${err.message}`);
  });
  console.log('  ✅ Erro correto (todos preenchidos explicitamente com "0")');
} else {
  console.log('  ❌ ERRO: Deveria ter detectado que todos são "0"');
}
console.log();

// ===========================
// CENÁRIO 3: Mix de vazios e "0"
// ===========================
console.log('📋 CENÁRIO 3: Mix de campos vazios e "0" (turma com AEE)');
console.log('-'.repeat(80));

const parts3 = [
  '60',            // 0: record_type
  '12345678',      // 1: school_code
  'P001',          // 2: person_code
  '123456789012',  // 3: inep_id
  'T001',          // 4: class_code
  '',              // 5: inep_class_code
  '',              // 6: enrollment_code
  '',              // 7: multi_class
  '',              // 8: cognitive_functions - VAZIO
  '0',             // 9: autonomous_life - ZERO
  '',              // 10: curriculum_enrichment - VAZIO
  '1',             // 11: accessible_computing - UM (Sim)
  '',              // 12: libras_teaching - VAZIO
  '0',             // 13: portuguese_second_language - ZERO
  '',              // 14: soroban_techniques - VAZIO
  '',              // 15: braille_system - VAZIO
  '',              // 16: orientation_mobility - VAZIO
  '',              // 17: alternative_communication - VAZIO
  '',              // 18: optical_resources - VAZIO
  '',              // 19: schooling_other_space
  '0',             // 20: public_transport
];

const errors3 = rule.validateWithContext(
  parts3,
  mockSchoolContext,
  mockClassContext,
  mockPersonContext,
  3
);

const aeeErrors3 = errors3.filter(e =>
  e.field === 'specialized_education_services'
);

console.log(`Campos 9-19 (AEE): ${parts3.slice(8, 19).map(v => v === '' ? '[VAZIO]' : v).join(', ')}`);
console.log(`Campos preenchidos: ${parts3.slice(8, 19).filter(v => v !== '').join(', ')}`);
console.log(`Erros de validação "todos 0": ${aeeErrors3.length}`);
if (aeeErrors3.length === 0) {
  console.log('  ✅ Sem erro (correto - tem pelo menos um "1", vazios são ignorados)');
} else {
  aeeErrors3.forEach(err => {
    console.log(`  ❌ ${err.field}: ${err.message}`);
  });
  console.log('  ❌ ERRO: Não deveria ter erro pois tem um "1"');
}
console.log();

// ===========================
// CENÁRIO 4: Validação de Transporte - Campos vazios
// ===========================
console.log('📋 CENÁRIO 4: Transporte - Campos de veículos vazios');
console.log('-'.repeat(80));

const parts4 = [
  '60',            // 0: record_type
  '12345678',      // 1: school_code
  'P001',          // 2: person_code
  '123456789012',  // 3: inep_id
  'T001',          // 4: class_code
  '',              // 5: inep_class_code
  '',              // 6: enrollment_code
  '',              // 7: multi_class
  '1',             // 8: cognitive_functions
  '0',             // 9: autonomous_life
  '0',             // 10: curriculum_enrichment
  '0',             // 11: accessible_computing
  '0',             // 12: libras_teaching
  '0',             // 13: portuguese_second_language
  '0',             // 14: soroban_techniques
  '0',             // 15: braille_system
  '0',             // 16: orientation_mobility
  '0',             // 17: alternative_communication
  '0',             // 18: optical_resources
  '',              // 19: schooling_other_space
  '1',             // 20: public_transport (Usa transporte)
  '2',             // 21: transport_authority (Municipal)
  '',              // 22: vehicle_bicycle - VAZIO
  '',              // 23: vehicle_microbus - VAZIO
  '',              // 24: vehicle_bus - VAZIO
  '',              // 25: vehicle_animal_traction - VAZIO
  '',              // 26: vehicle_van - VAZIO
  '',              // 27: vehicle_other_road - VAZIO
  '',              // 28: vehicle_water_5 - VAZIO
  '',              // 29: vehicle_water_15 - VAZIO
  '',              // 30: vehicle_water_35 - VAZIO
  '',              // 31: vehicle_water_above - VAZIO
];

const errors4 = rule.validateWithContext(
  parts4,
  mockSchoolContext,
  mockClassContext,
  mockPersonContext,
  4
);

const vehicleErrors4 = errors4.filter(e =>
  e.field === 'vehicle_types' || (e.field && e.field.includes('vehicle_'))
);

console.log(`Campos 23-32 (Veículos): ${parts4.slice(22, 32).map(v => v === '' ? '[VAZIO]' : v).join(', ')}`);
console.log(`Erros de veículos encontrados: ${vehicleErrors4.length}`);
if (vehicleErrors4.length > 0) {
  vehicleErrors4.forEach(err => {
    console.log(`  ⚠️ ${err.field}: ${err.message}`);
  });
  console.log('  ✅ Esperado: Campos obrigatórios não preenchidos');
} else {
  console.log('  ❌ Deveria ter erros de campos obrigatórios');
}
console.log();

// ===========================
// CENÁRIO 5: Transporte - Todos os veículos com "0"
// ===========================
console.log('📋 CENÁRIO 5: Transporte - Todos os veículos explicitamente "0"');
console.log('-'.repeat(80));

const parts5 = [
  '60',            // 0: record_type
  '12345678',      // 1: school_code
  'P001',          // 2: person_code
  '123456789012',  // 3: inep_id
  'T001',          // 4: class_code
  '',              // 5: inep_class_code
  '',              // 6: enrollment_code
  '',              // 7: multi_class
  '1',             // 8: cognitive_functions
  '0',             // 9: autonomous_life
  '0',             // 10: curriculum_enrichment
  '0',             // 11: accessible_computing
  '0',             // 12: libras_teaching
  '0',             // 13: portuguese_second_language
  '0',             // 14: soroban_techniques
  '0',             // 15: braille_system
  '0',             // 16: orientation_mobility
  '0',             // 17: alternative_communication
  '0',             // 18: optical_resources
  '',              // 19: schooling_other_space
  '1',             // 20: public_transport
  '2',             // 21: transport_authority
  '0',             // 22: vehicle_bicycle - ZERO
  '0',             // 23: vehicle_microbus - ZERO
  '0',             // 24: vehicle_bus - ZERO
  '0',             // 25: vehicle_animal_traction - ZERO
  '0',             // 26: vehicle_van - ZERO
  '0',             // 27: vehicle_other_road - ZERO
  '0',             // 28: vehicle_water_5 - ZERO
  '0',             // 29: vehicle_water_15 - ZERO
  '0',             // 30: vehicle_water_35 - ZERO
  '0',             // 31: vehicle_water_above - ZERO
];

const errors5 = rule.validateWithContext(
  parts5,
  mockSchoolContext,
  mockClassContext,
  mockPersonContext,
  5
);

const vehicleErrors5 = errors5.filter(e =>
  e.field === 'vehicle_types'
);

console.log(`Campos 23-32 (Veículos): ${parts5.slice(22, 32).join(', ')}`);
console.log(`Erros "todos 0": ${vehicleErrors5.length}`);
if (vehicleErrors5.length > 0) {
  vehicleErrors5.forEach(err => {
    console.log(`  ✅ ${err.field}: ${err.message}`);
  });
  console.log('  ✅ Erro correto (todos preenchidos explicitamente com "0")');
} else {
  console.log('  ❌ ERRO: Deveria detectar que todos são "0"');
}
console.log();

// ===========================
// RESUMO
// ===========================
console.log('='.repeat(80));
console.log('📊 RESUMO DA VALIDAÇÃO\n');

const cenarios = [
  { nome: 'Cenário 1 (AEE vazios)', esperado: 'Com erro obrigat.', obtido: aeeErrors1.length > 0 ? '✅ Com erro' : '❌ Sem erro' },
  { nome: 'Cenário 2 (AEE todos "0")', esperado: 'Com erro', obtido: aeeErrors2.length > 0 ? '✅ Com erro' : '❌ Sem erro' },
  { nome: 'Cenário 3 (AEE mix)', esperado: 'Sem erro', obtido: aeeErrors3.length === 0 ? '✅ Sem erro' : '❌ Com erro' },
  { nome: 'Cenário 4 (Veículos vazios)', esperado: 'Com erro obrigat.', obtido: vehicleErrors4.length > 0 ? '✅ Com erro' : '❌ Sem erro' },
  { nome: 'Cenário 5 (Veículos "0")', esperado: 'Com erro', obtido: vehicleErrors5.length > 0 ? '✅ Com erro' : '❌ Sem erro' },
];

cenarios.forEach(c => {
  const status = c.obtido.includes('✅') ? '✅' : '❌';
  console.log(`${status} ${c.nome}: Esperado "${c.esperado}" → ${c.obtido}`);
});

console.log('\n' + '='.repeat(80));
console.log('🎯 Conceito Validado:');
console.log('   - Campo VAZIO ("") ≠ Campo com ZERO ("0")');
console.log('   - Validações "todos 0" só consideram campos EXPLICITAMENTE preenchidos');
console.log('   - Campos vazios são IGNORADOS nessas validações');
console.log('='.repeat(80));
