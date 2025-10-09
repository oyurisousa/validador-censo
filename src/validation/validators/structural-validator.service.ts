import { Injectable } from '@nestjs/common';
import { ValidationError } from '../../common/interfaces/validation.interface';
import { StructuralRulesManagerService } from '../rules/structural-rules-manager.service';

/**
 * Serviço de validação estrutural
 * Coordena as validações estruturais do arquivo usando o gerenciador de regras
 */
@Injectable()
export class StructuralValidatorService {
  constructor(
    private readonly structuralRulesManager: StructuralRulesManagerService,
  ) {}

  /**
   * Valida a estrutura geral do arquivo
   */
  validateStructure(
    records: string[],
    fileContent?: string,
  ): ValidationError[] {
    return this.structuralRulesManager.validateStructure(records, fileContent);
  }

  /**
   * Validar caracteres não permitidos nos campos
   */
  validateCharacters(content: string): ValidationError[] {
    return this.structuralRulesManager.validateCharactersAndEncoding(content);
  }

  /**
   * Validar codificação de caracteres (ISO-8859-1)
   */
  validateEncoding(content: string): ValidationError[] {
    return this.structuralRulesManager.validateCharactersAndEncoding(content);
  }
}
