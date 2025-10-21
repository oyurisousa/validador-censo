# Guia de Integração - API de Validação

## 🚀 Quick Start

### 1. Validação em Tempo Real (Formulário)

```typescript
// React Component Example
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

interface ValidationError {
  fieldName: string;
  fieldDescription: string;
  errorMessage: string;
  fieldPosition: number;
}

function CensoForm() {
  const [line, setLine] = useState('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Validar enquanto usuário digita (com debounce)
  const validateLine = useCallback(
    debounce(async (lineContent: string, recordType: string) => {
      if (!lineContent.trim()) {
        setErrors([]);
        return;
      }

      setIsValidating(true);

      try {
        const response = await fetch('http://localhost:3000/validation/validate-line', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recordType,
            line: lineContent,
            version: '2025'
          })
        });

        const result = await response.json();
        setErrors(result.errors || []);
      } catch (error) {
        console.error('Erro na validação:', error);
      } finally {
        setIsValidating(false);
      }
    }, 500), // Aguarda 500ms após usuário parar de digitar
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLine(value);
    validateLine(value, '30'); // Tipo 30 = Pessoa Física
  };

  return (
    <div>
      <textarea
        value={line}
        onChange={handleChange}
        placeholder="Digite a linha do registro..."
        rows={5}
        style={{ width: '100%' }}
      />

      {isValidating && <p>Validando...</p>}

      {errors.length > 0 && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <h4>Erros encontrados:</h4>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>
                <strong>{error.fieldDescription}:</strong> {error.errorMessage}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isValidating && errors.length === 0 && line && (
        <p style={{ color: 'green' }}>✓ Linha válida!</p>
      )}
    </div>
  );
}

export default CensoForm;
```

---

### 2. Validação Completa de Arquivo (Antes de Submeter)

```typescript
// React Component Example
import { useState } from 'react';

function FileValidator() {
  const [content, setContent] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const validateFile = async () => {
    if (!content.trim()) {
      alert('Digite o conteúdo do arquivo');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Converter conteúdo em array de linhas
      const lines = content.split('\n').filter(line => line.trim().length > 0);

      const response = await fetch('http://localhost:3000/validation/validate-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines, // Agora envia array de strings
          version: '2025'
        })
      });

      const data = await response.json();
      setResult(data);

      if (data.isValid) {
        alert('✓ Arquivo válido! Pode enviar ao INEP.');
      }
    } catch (error) {
      console.error('Erro na validação:', error);
      alert('Erro ao validar arquivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Validar Arquivo Completo</h2>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Cole o conteúdo completo do arquivo aqui (uma linha por registro)..."
        rows={15}
        style={{ width: '100%' }}
      />

      <button
        onClick={validateFile}
        disabled={loading}
        style={{ marginTop: '10px', padding: '10px 20px' }}
      >
        {loading ? 'Validando...' : 'Validar Arquivo'}
      </button>

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc' }}>
          <h3>Resultado da Validação</h3>

          <div style={{ marginBottom: '10px' }}>
            <strong>Status:</strong> {result.isValid ? '✓ Válido' : '✗ Inválido'}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Total de Registros:</strong> {result.totalRecords}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Processados:</strong> {result.processedRecords}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Tempo de Processamento:</strong> {result.processingTime}ms
          </div>

          {result.errors && result.errors.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ color: 'red' }}>Erros ({result.errors.length}):</h4>
              <ul>
                {result.errors.map((error: any, index: number) => (
                  <li key={index}>
                    <strong>Linha {error.lineNumber}:</strong> {error.fieldDescription} - {error.errorMessage}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.warnings && result.warnings.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ color: 'orange' }}>Avisos ({result.warnings.length}):</h4>
              <ul>
                {result.warnings.map((warning: any, index: number) => (
                  <li key={index}>
                    <strong>Linha {warning.lineNumber}:</strong> {warning.fieldDescription} - {warning.errorMessage}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FileValidator;
```

---

### 3. Upload de Arquivo

```typescript
// React Component Example
import { useState } from 'react';

function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const uploadAndValidate = async () => {
    if (!file) {
      alert('Selecione um arquivo');
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('version', '2025');

    try {
      const response = await fetch('http://localhost:3000/validation/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

      if (data.isValid) {
        alert('✓ Arquivo válido!');
      } else {
        alert(`✗ Arquivo com ${data.errors.length} erro(s)`);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload do arquivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload e Validação de Arquivo</h2>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          accept=".txt"
          onChange={handleFileChange}
        />
      </div>

      {file && (
        <div style={{ marginBottom: '10px' }}>
          <strong>Arquivo selecionado:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
        </div>
      )}

      <button
        onClick={uploadAndValidate}
        disabled={!file || loading}
        style={{ padding: '10px 20px' }}
      >
        {loading ? 'Enviando...' : 'Validar Arquivo'}
      </button>

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc' }}>
          <h3>Resultado</h3>

          <div style={{
            padding: '10px',
            marginBottom: '10px',
            backgroundColor: result.isValid ? '#d4edda' : '#f8d7da',
            color: result.isValid ? '#155724' : '#721c24',
            borderRadius: '5px'
          }}>
            {result.isValid ? '✓ Arquivo Válido' : `✗ Arquivo Inválido (${result.errors.length} erro(s))`}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '5px', fontWeight: 'bold' }}>Nome do Arquivo:</td>
                <td style={{ padding: '5px' }}>{result.fileMetadata.fileName}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px', fontWeight: 'bold' }}>Tamanho:</td>
                <td style={{ padding: '5px' }}>{(result.fileMetadata.fileSize / 1024).toFixed(2)} KB</td>
              </tr>
              <tr>
                <td style={{ padding: '5px', fontWeight: 'bold' }}>Total de Linhas:</td>
                <td style={{ padding: '5px' }}>{result.fileMetadata.totalLines}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px', fontWeight: 'bold' }}>Registros Processados:</td>
                <td style={{ padding: '5px' }}>{result.processedRecords}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px', fontWeight: 'bold' }}>Tempo de Processamento:</td>
                <td style={{ padding: '5px' }}>{result.processingTime}ms</td>
              </tr>
            </tbody>
          </table>

          {result.errors && result.errors.length > 0 && (
            <details style={{ marginTop: '20px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: 'red' }}>
                Erros ({result.errors.length})
              </summary>
              <ul style={{ maxHeight: '300px', overflow: 'auto' }}>
                {result.errors.map((error: any, index: number) => (
                  <li key={index} style={{ marginBottom: '10px' }}>
                    <div><strong>Linha:</strong> {error.lineNumber}</div>
                    <div><strong>Campo:</strong> {error.fieldDescription}</div>
                    <div><strong>Erro:</strong> {error.errorMessage}</div>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {result.warnings && result.warnings.length > 0 && (
            <details style={{ marginTop: '20px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: 'orange' }}>
                Avisos ({result.warnings.length})
              </summary>
              <ul style={{ maxHeight: '300px', overflow: 'auto' }}>
                {result.warnings.map((warning: any, index: number) => (
                  <li key={index} style={{ marginBottom: '10px' }}>
                    <div><strong>Linha:</strong> {warning.lineNumber}</div>
                    <div><strong>Campo:</strong> {warning.fieldDescription}</div>
                    <div><strong>Aviso:</strong> {warning.errorMessage}</div>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

export default FileUploader;
```

---

## 🔧 Configuração do Cliente HTTP

### Axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Validar linha
export async function validateLine(recordType: string, line: string) {
  const response = await api.post('/validation/validate-line', {
    recordType,
    line,
    version: '2025',
  });
  return response.data;
}

// Validar arquivo
export async function validateFile(content: string) {
  const response = await api.post('/validation/validate-file', {
    content,
    version: '2025',
  });
  return response.data;
}

// Upload de arquivo
export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('version', '2025');

  const response = await api.post('/validation/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}
```

---

## 🎨 Componente Completo (React + TypeScript)

```typescript
import React, { useState, useCallback } from 'react';
import { debounce } from 'lodash';

type TabType = 'line' | 'file' | 'upload';

interface ValidationError {
  lineNumber: number;
  fieldName: string;
  fieldDescription: string;
  errorMessage: string;
  fieldPosition: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  totalRecords?: number;
  processedRecords?: number;
  processingTime?: number;
  fileMetadata?: {
    fileName: string;
    fileSize: number;
    totalLines: number;
    encoding: string;
    uploadDate: string;
  };
}

function CensoValidator() {
  const [activeTab, setActiveTab] = useState<TabType>('line');

  // State para validate-line
  const [line, setLine] = useState('');
  const [recordType, setRecordType] = useState('30');
  const [lineResult, setLineResult] = useState<ValidationResult | null>(null);
  const [lineValidating, setLineValidating] = useState(false);

  // State para validate-file
  const [fileContent, setFileContent] = useState('');
  const [fileResult, setFileResult] = useState<ValidationResult | null>(null);
  const [fileValidating, setFileValidating] = useState(false);

  // State para upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<ValidationResult | null>(null);
  const [uploading, setUploading] = useState(false);

  // Validar linha (com debounce)
  const validateLineFn = useCallback(
    debounce(async (lineContent: string, type: string) => {
      if (!lineContent.trim()) {
        setLineResult(null);
        return;
      }

      setLineValidating(true);

      try {
        const response = await fetch('http://localhost:3000/validation/validate-line', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recordType: type,
            line: lineContent,
            version: '2025'
          })
        });

        const data = await response.json();
        setLineResult(data);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLineValidating(false);
      }
    }, 500),
    []
  );

  const handleLineChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLine(value);
    validateLineFn(value, recordType);
  };

  const handleRecordTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    setRecordType(type);
    if (line.trim()) {
      validateLineFn(line, type);
    }
  };

  // Validar arquivo completo
  const handleValidateFile = async () => {
    if (!fileContent.trim()) {
      alert('Digite o conteúdo do arquivo');
      return;
    }

    setFileValidating(true);
    setFileResult(null);

    try {
      const response = await fetch('http://localhost:3000/validation/validate-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: fileContent,
          version: '2025'
        })
      });

      const data = await response.json();
      setFileResult(data);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao validar arquivo');
    } finally {
      setFileValidating(false);
    }
  };

  // Upload e validar
  const handleUpload = async () => {
    if (!uploadFile) {
      alert('Selecione um arquivo');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('version', '2025');

    try {
      const response = await fetch('http://localhost:3000/validation/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setUploadResult(data);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro no upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Validador do Censo Escolar 2025</h1>

      {/* Tabs */}
      <div style={{ marginBottom: '20px', borderBottom: '2px solid #ccc' }}>
        <button
          onClick={() => setActiveTab('line')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: activeTab === 'line' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'line' ? 'white' : 'black',
            cursor: 'pointer'
          }}
        >
          Validar Linha
        </button>
        <button
          onClick={() => setActiveTab('file')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: activeTab === 'file' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'file' ? 'white' : 'black',
            cursor: 'pointer'
          }}
        >
          Validar Arquivo
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: activeTab === 'upload' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'upload' ? 'white' : 'black',
            cursor: 'pointer'
          }}
        >
          Upload
        </button>
      </div>

      {/* Tab Content: Validar Linha */}
      {activeTab === 'line' && (
        <div>
          <h2>Validação em Tempo Real (Sem Contexto)</h2>

          <div style={{ marginBottom: '10px' }}>
            <label>Tipo de Registro: </label>
            <select value={recordType} onChange={handleRecordTypeChange}>
              <option value="00">00 - Identificação da Escola</option>
              <option value="10">10 - Caracterização da Escola</option>
              <option value="20">20 - Turmas</option>
              <option value="30">30 - Pessoa Física</option>
              <option value="40">40 - Vínculo Gestor</option>
              <option value="50">50 - Vínculo Profissional</option>
              <option value="60">60 - Matrícula</option>
            </select>
          </div>

          <textarea
            value={line}
            onChange={handleLineChange}
            placeholder="Digite a linha do registro..."
            rows={5}
            style={{ width: '100%', fontFamily: 'monospace' }}
          />

          {lineValidating && <p>⏳ Validando...</p>}

          {lineResult && !lineValidating && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              border: '1px solid #ccc',
              backgroundColor: lineResult.errors.length === 0 ? '#d4edda' : '#f8d7da'
            }}>
              <h3>{lineResult.errors.length === 0 ? '✓ Linha Válida' : '✗ Erros Encontrados'}</h3>

              {lineResult.errors.length > 0 && (
                <ul>
                  {lineResult.errors.map((error, index) => (
                    <li key={index}>
                      <strong>{error.fieldDescription}:</strong> {error.errorMessage}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Validar Arquivo */}
      {activeTab === 'file' && (
        <div>
          <h2>Validação Completa de Arquivo (Com Contexto)</h2>

          <textarea
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            placeholder="Cole o conteúdo completo do arquivo aqui..."
            rows={15}
            style={{ width: '100%', fontFamily: 'monospace' }}
          />

          <button
            onClick={handleValidateFile}
            disabled={fileValidating}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {fileValidating ? '⏳ Validando...' : 'Validar Arquivo'}
          </button>

          {fileResult && (
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc' }}>
              <h3>{fileResult.isValid ? '✓ Arquivo Válido' : `✗ Arquivo com ${fileResult.errors.length} Erro(s)`}</h3>

              <p><strong>Total de Registros:</strong> {fileResult.totalRecords}</p>
              <p><strong>Processados:</strong> {fileResult.processedRecords}</p>
              <p><strong>Tempo:</strong> {fileResult.processingTime}ms</p>

              {fileResult.errors.length > 0 && (
                <details>
                  <summary style={{ cursor: 'pointer', color: 'red' }}>
                    Ver Erros ({fileResult.errors.length})
                  </summary>
                  <ul>
                    {fileResult.errors.map((error, index) => (
                      <li key={index}>
                        Linha {error.lineNumber}: {error.fieldDescription} - {error.errorMessage}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Upload */}
      {activeTab === 'upload' && (
        <div>
          <h2>Upload de Arquivo (Com Contexto)</h2>

          <input
            type="file"
            accept=".txt"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
          />

          {uploadFile && (
            <p><strong>Arquivo:</strong> {uploadFile.name} ({(uploadFile.size / 1024).toFixed(2)} KB)</p>
          )}

          <button
            onClick={handleUpload}
            disabled={!uploadFile || uploading}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {uploading ? '⏳ Enviando...' : 'Validar Arquivo'}
          </button>

          {uploadResult && (
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc' }}>
              <h3>{uploadResult.isValid ? '✓ Arquivo Válido' : `✗ ${uploadResult.errors.length} Erro(s)`}</h3>

              <p><strong>Arquivo:</strong> {uploadResult.fileMetadata?.fileName}</p>
              <p><strong>Tamanho:</strong> {((uploadResult.fileMetadata?.fileSize || 0) / 1024).toFixed(2)} KB</p>
              <p><strong>Linhas:</strong> {uploadResult.fileMetadata?.totalLines}</p>
              <p><strong>Processados:</strong> {uploadResult.processedRecords}</p>
              <p><strong>Tempo:</strong> {uploadResult.processingTime}ms</p>

              {uploadResult.errors.length > 0 && (
                <details>
                  <summary style={{ cursor: 'pointer', color: 'red' }}>
                    Ver Erros ({uploadResult.errors.length})
                  </summary>
                  <ul style={{ maxHeight: '400px', overflow: 'auto' }}>
                    {uploadResult.errors.map((error, index) => (
                      <li key={index}>
                        Linha {error.lineNumber}: {error.fieldDescription} - {error.errorMessage}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CensoValidator;
```

---

## 🧪 Testes

### Jest + React Testing Library

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CensoValidator from './CensoValidator';

global.fetch = jest.fn();

describe('CensoValidator', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  test('valida linha em tempo real', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        isValid: false,
        errors: [{
          fieldDescription: 'CPF',
          errorMessage: 'CPF inválido'
        }]
      })
    });

    render(<CensoValidator />);

    const textarea = screen.getByPlaceholderText(/digite a linha/i);
    fireEvent.change(textarea, {
      target: { value: '30|12345678|DIR001|invalid_cpf|...' }
    });

    await waitFor(() => {
      expect(screen.getByText(/CPF inválido/i)).toBeInTheDocument();
    });
  });

  test('valida arquivo completo', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        isValid: true,
        totalRecords: 3,
        processedRecords: 3,
        errors: []
      })
    });

    render(<CensoValidator />);

    fireEvent.click(screen.getByText(/validar arquivo/i));

    const textarea = screen.getByPlaceholderText(/cole o conteúdo/i);
    fireEvent.change(textarea, {
      target: { value: 'linha1\nlinha2\nlinha3' }
    });

    const button = screen.getByRole('button', { name: /validar arquivo/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/arquivo válido/i)).toBeInTheDocument();
    });
  });
});
```

---

## 📊 Performance

### Benchmark Simples

```typescript
async function benchmark() {
  const line =
    '30|12345678|DIR001|123456789012|12345678901|JOÃO|15/05/1980|1|MARIA||1|1||1|76||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||';

  console.time('validate-line');
  for (let i = 0; i < 100; i++) {
    await fetch('http://localhost:3000/validation/validate-line', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recordType: '30',
        line,
        version: '2025',
      }),
    });
  }
  console.timeEnd('validate-line');
  // Esperado: ~5-10s (50-100ms por request)
}
```

---

## 🔒 Tratamento de Erros

```typescript
async function safeValidation(line: string, recordType: string) {
  try {
    const response = await fetch(
      'http://localhost:3000/validation/validate-line',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordType, line, version: '2025' }),
      },
    );

    if (!response.ok) {
      if (response.status === 400) {
        const error = await response.json();
        return { error: 'Requisição inválida: ' + error.message };
      }
      if (response.status === 429) {
        return { error: 'Limite de requisições excedido. Aguarde um momento.' };
      }
      return { error: 'Erro no servidor: ' + response.statusText };
    }

    return await response.json();
  } catch (error) {
    console.error('Erro de rede:', error);
    return { error: 'Erro de conexão com o servidor' };
  }
}
```

---

Pronto! Agora você tem um guia completo de integração com exemplos práticos para todos os endpoints! 🎉
