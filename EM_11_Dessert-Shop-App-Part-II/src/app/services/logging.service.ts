import { Injectable } from '@angular/core';

type LogLevel = 'info' | 'warn' | 'error';

// Central place to record app activity/errors, so components and services don't call console.* directly.
@Injectable({ providedIn: 'root' })
export class LoggingService {
  info(message: string, meta?: unknown): void {
    this.write('info', message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.write('warn', message, meta);
  }

  error(message: string, meta?: unknown): void {
    this.write('error', message, meta);
  }

  private write(level: LogLevel, message: string, meta?: unknown): void {
    const entry = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
    if (meta === undefined) {
      console[level](entry);
    } else {
      console[level](entry, meta);
    }
  }
}
