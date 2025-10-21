import 'ts-node/register';
import { StudentEnrollmentRule } from '../src/validation/rules/record-rules/student-enrollment.rule';

const rule = new StudentEnrollmentRule();

const parts60 =
  '60|22026533|1797296||143012||||0|0|0|0|0|0|0|0|0|0|0|1|0|||||||||||'.split(
    '|',
  );
const parts20 =
  '20|22026533|143012||0ZBT|1||||||||1|0|0|||||||0|0|301|1||1|0|0|0|0|0||||||||||0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|1|0'.split(
    '|',
  );

const classContext = {
  classCode: '143012',
  teachingMediation: '1',
  isRegular: '1',
  stage: '3',
  specializedEducationalService: '0',
  differentiatedLocation: '0',
};

const personContext = {
  personCode: '1797296',
  inepId: '',
  residenceCountry: '76',
};

const errors = rule.validateWithContext(
  parts60,
  { schoolCode: '22026533', classes: [], persons: [] },
  classContext as any,
  personContext as any,
  421,
);

console.log('validation errors:', errors);
