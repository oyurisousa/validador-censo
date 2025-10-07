import { Module } from '@nestjs/common';
import { TxtFileParserService } from './parsers/txt-file-parser.service';

@Module({
  providers: [TxtFileParserService],
  exports: [TxtFileParserService],
})
export class FileProcessingModule {}
