// Type definitions for nest-commander
declare module 'nest-commander' {
  import { Type } from '@nestjs/common';

  export interface CommandOptions {
    name: string;
    description?: string;
    argsDescription?: Record<string, string>;
    arguments?: string;
    options?: { flags: string; description?: string; defaultValue?: string | boolean | string[] }[];
    subCommands?: Type<CommandRunner>[];
  }

  export function Command(options: CommandOptions): ClassDecorator;

  export abstract class CommandRunner {
    constructor();
    abstract run(
      passedParams: string[],
      options?: Record<string, any>
    ): Promise<void> | void;
  }

  export class CommandFactory {
    static async run(
      module: Type<any>,
      options?: string[]
    ): Promise<void>;
  }
}
