// src/cli/cli.ts
import { CommandFactory } from 'nest-commander';
import { CliModule } from './cli.module';

async function bootstrap(): Promise<void> {
  try {
    await CommandFactory.run(CliModule, ['warn', 'error']);
  } catch (error) {
    console.error('Failed to run command:', error);
    process.exit(1);
  }
}

void bootstrap();
