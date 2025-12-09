import { logger, LogLevel } from './logger';

export interface RequestMetrics {
  path: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: string;
}

export interface SystemMetrics {
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageDuration: number;
  };
  errors: {
    total: number;
    byCode: Record<string, number>;
  };
}

class Monitor {
  private requestMetrics: RequestMetrics[] = [];
  private errorCounts: Record<string, number> = {};
  private startTime: number = Date.now();
  private maxMetrics = 1000;

  recordRequest(metrics: RequestMetrics): void {
    this.requestMetrics.push(metrics);
    
    if (this.requestMetrics.length > this.maxMetrics) {
      this.requestMetrics.shift();
    }

    if (metrics.statusCode >= 400) {
      const errorKey = `${metrics.statusCode}`;
      this.errorCounts[errorKey] = (this.errorCounts[errorKey] || 0) + 1;
      logger.warn('Request failed', {
        path: metrics.path,
        statusCode: metrics.statusCode,
        duration: metrics.duration
      });
    } else {
      logger.debug('Request completed', {
        path: metrics.path,
        statusCode: metrics.statusCode,
        duration: metrics.duration
      });
    }
  }

  getSystemMetrics(): SystemMetrics {
    const successful = this.requestMetrics.filter(m => m.statusCode < 400).length;
    const failed = this.requestMetrics.filter(m => m.statusCode >= 400).length;
    const durations = this.requestMetrics.map(m => m.duration);
    const avgDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;

    return {
      uptime: Date.now() - this.startTime,
      memory: {
        used: usedMemory,
        total: totalMemory,
        percentage: (usedMemory / totalMemory) * 100
      },
      requests: {
        total: this.requestMetrics.length,
        successful,
        failed,
        averageDuration: Math.round(avgDuration)
      },
      errors: {
        total: failed,
        byCode: { ...this.errorCounts }
      }
    };
  }

  getRecentRequests(limit: number = 50): RequestMetrics[] {
    return this.requestMetrics.slice(-limit).reverse();
  }

  reset(): void {
    this.requestMetrics = [];
    this.errorCounts = {};
    this.startTime = Date.now();
    logger.info('Monitor reset');
  }
}

export const monitor = new Monitor();

