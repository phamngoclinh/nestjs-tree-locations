import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
  private readonly logLevel: string[];

  constructor() {
    super();
    this.logLevel = (process.env.LOG_LEVEL || 'log').split(','); // Đặt mức log mặc định là 'log'
  }

  log(message: any) {
    if (['log', 'debug', 'verbose'].filter(x => this.logLevel.includes(x))) {
      super.log(message);
    }
  }

  error(message: string, trace: string) {
    if (['error', 'log', 'debug', 'verbose'].filter(x => this.logLevel.includes(x))) {
      super.error(message, trace);
    }
  }

  warn(message: string) {
    if (['warn', 'log', 'debug', 'verbose'].filter(x => this.logLevel.includes(x))) {
      super.warn(message);
    }
  }

  debug(message: string) {
    if (['debug', 'verbose'].filter(x => this.logLevel.includes(x))) {
      super.debug(message);
    }
  }

  verbose(message: string) {
    if (this.logLevel.includes('verbose')) {
      super.verbose(message);
    }
  }
}
