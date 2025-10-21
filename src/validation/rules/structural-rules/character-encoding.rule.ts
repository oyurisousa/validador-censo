import { Injectable } from '@nestjs/common';
import {
  BaseStructuralRule,
  StructuralValidationContext,
} from '../base-structural.rule';
import { ValidationError } from '../../../common/interfaces/validation.interface';
import { ValidationSeverity } from '../../../common/enums/record-types.enum';

/**
 * Regra para validação de caracteres e codificação do arquivo
 * Valida caracteres permitidos e codificação ISO-8859-1
 */
@Injectable()
export class CharacterEncodingRule extends BaseStructuralRule {
  constructor() {
    super('character_encoding', 'Validação de caracteres e codificação');
  }

  validate(context: StructuralValidationContext): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validar caracteres não permitidos
    const characterErrors = this.validateCharacters(context.records);
    errors.push(...characterErrors);

    // Validar codificação se o conteúdo do arquivo estiver disponível
    if (context.fileContent) {
      const encodingErrors = this.validateEncoding(context.fileContent);
      errors.push(...encodingErrors);
    }

    return errors;
  }

  /**
   * Valida caracteres não permitidos nos campos
   */
  private validateCharacters(records: string[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (let i = 0; i < records.length; i++) {
      const lineNumber = i + 1;
      const line = records[i];

      if (!line.trim()) continue;

      const parts = line.split('|');
      const recordType = parts[0] || '';

      if (recordType === '99') continue;

      // Verificar caracteres não permitidos
      const invalidCharsPattern = /[a-z\u00C0-\u00FF]/; // minúsculas e acentos

      for (let fieldIndex = 0; fieldIndex < parts.length; fieldIndex++) {
        const fieldValue = parts[fieldIndex];

        if (fieldValue && invalidCharsPattern.test(fieldValue)) {
          const invalidChars = fieldValue.match(invalidCharsPattern)?.[0] || '';

          errors.push(
            this.createError(
              lineNumber,
              recordType,
              `field_${fieldIndex}`,
              fieldIndex,
              fieldValue,
              'invalid_characters',
              `O campo contém caractere(s) não permitido(s): "${invalidChars}". Apenas letras maiúsculas, números e caracteres especiais são permitidos.`,
              ValidationSeverity.ERROR,
            ),
          );
        }
      }

      // Verificar caracteres de controle não permitidos (exceto separadores)
      const controlCharsPattern = /[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/;
      if (controlCharsPattern.test(line)) {
        errors.push(
          this.createError(
            lineNumber,
            recordType,
            'control_characters',
            -1,
            line.substring(0, 50),
            'invalid_control_chars',
            'A linha contém caracteres de controle não permitidos.',
            ValidationSeverity.ERROR,
          ),
        );
      }
    }

    return errors;
  }

  /**
   * Valida codificação de caracteres (ISO-8859-1)
   */
  private validateEncoding(content: string): ValidationError[] {
    const errors: ValidationError[] = [];

    try {
      // Verificar se há caracteres que não são compatíveis com ISO-8859-1
      for (let i = 0; i < content.length; i++) {
        const charCode = content.charCodeAt(i);

        // ISO-8859-1 permite apenas caracteres de 0x00 a 0xFF
        if (charCode > 255) {
          const char = content.charAt(i);

          // Encontrar a linha onde o caractere está
          const beforeChar = content.substring(0, i);
          const lineNumber = (beforeChar.match(/\n/g) || []).length + 1;

          errors.push(
            this.createError(
              lineNumber,
              'FILE',
              'encoding',
              i,
              char,
              'invalid_encoding',
              `Para a geração do arquivo deve ser utilizado o padrão ISO-8859-1 de codificação de caracteres. Caractere inválido: "${char}" (Unicode: U+${charCode.toString(16).toUpperCase().padStart(4, '0')})`,
              ValidationSeverity.ERROR,
            ),
          );
        }
      }

      // Verificar BOM (Byte Order Mark) que não deve estar presente em ISO-8859-1
      if (
        content.charCodeAt(0) === 0xfeff ||
        content.charCodeAt(0) === 0xfffe
      ) {
        errors.push(
          this.createError(
            1,
            'FILE',
            'bom',
            0,
            'BOM',
            'unexpected_bom',
            'Arquivo contém BOM (Byte Order Mark) que não é compatível com codificação ISO-8859-1.',
            ValidationSeverity.ERROR,
          ),
        );
      }

      // Verificar se o arquivo não está vazio
      if (content.trim().length === 0) {
        errors.push(
          this.createError(
            0,
            'FILE',
            'empty_file',
            0,
            '',
            'empty_content',
            'Arquivo está vazio ou contém apenas espaços em branco.',
            ValidationSeverity.ERROR,
          ),
        );
      }
    } catch (error) {
      errors.push(
        this.createError(
          0,
          'FILE',
          'encoding',
          0,
          '',
          'encoding_error',
          `Erro ao validar codificação do arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          ValidationSeverity.ERROR,
        ),
      );
    }

    return errors;
  }

  /**
   * Valida terminadores de linha
   */
  validateLineEndings(content: string): ValidationError[] {
    const errors: ValidationError[] = [];

    // Verificar se há mistura de terminadores de linha (CRLF vs LF)
    const hasCRLF = content.includes('\r\n');
    const hasLFOnly = content.includes('\n') && !content.includes('\r\n');

    if (hasCRLF && hasLFOnly) {
      errors.push(
        this.createError(
          0,
          'FILE',
          'line_endings',
          0,
          'mixed',
          'mixed_line_endings',
          'Arquivo contém mistura de terminadores de linha (CRLF e LF). Use apenas um tipo.',
          ValidationSeverity.WARNING,
        ),
      );
    }

    return errors;
  }
}
