import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { httpClient } from '../utils/httpClient.js';
import { AppError } from '../errors/AppError.js';
import { env } from '../config/env.js';
import type { ResolveDownloadResult } from '../types/api.types.js';

const execFileAsync = promisify(execFile);

export class MasstamilanClient {
  buildUrl(path: string, query?: Record<string, string | number | undefined>): string {
    const pathname = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(pathname, `${env.baseUrl}/`);

    if (query && typeof query === 'object') {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  isCloudflareChallenge(payload: unknown): boolean {
    if (typeof payload !== 'string') return false;
    const probe = payload.toLowerCase();
    return probe.includes('just a moment') || probe.includes('__cf_chl_opt');
  }

  async fetchViaCurl(url: string, accept: string = 'text/html'): Promise<string> {
    const args = [
      '-L',
      url,
      '-A',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      '-H',
      `Accept: ${accept}`,
      '-H',
      'Accept-Language: en-US,en;q=0.9',
      '-H',
      `Referer: ${env.baseUrl}/`,
      '--compressed',
      '--max-time',
      String(Math.max(5, Math.floor(env.requestTimeoutMs / 1000))),
    ];

    const commands = process.platform === 'win32' ? ['curl.exe', 'curl'] : ['curl'];
    let lastError: Error | null = null;

    for (const cmd of commands) {
      try {
        const { stdout } = await execFileAsync(cmd, args, {
          maxBuffer: 10 * 1024 * 1024,
        });
        return stdout;
      } catch (error) {
        lastError = error as Error;
      }
    }

    throw lastError ?? new Error('curl execution failed');
  }

  async fetchHtml(
    path: string,
    query?: Record<string, string | number | undefined>,
  ): Promise<string> {
    try {
      const response = await httpClient.get<string>(path, {
        params: query,
        responseType: 'text',
      });

      if (this.isCloudflareChallenge(response.data)) {
        const url = this.buildUrl(path, query);
        const html = await this.fetchViaCurl(
          url,
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        );

        if (this.isCloudflareChallenge(html)) {
          throw new AppError('Source blocked by anti-bot challenge', 503, { path });
        }

        return html;
      }

      return response.data;
    } catch (error) {
      if (error instanceof AppError) throw error;

      const axiosError = error as { response?: { status?: number }; message?: string };
      const status = axiosError.response?.status;

      if (status === 403 || status === 503) {
        try {
          const url = this.buildUrl(path, query);
          const html = await this.fetchViaCurl(
            url,
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          );

          if (this.isCloudflareChallenge(html)) {
            throw new AppError('Source blocked by anti-bot challenge', 503, { path });
          }

          return html;
        } catch (curlError) {
          if (curlError instanceof AppError) throw curlError;
          throw new AppError('Failed to fetch HTML from source', 502, {
            path,
            message: (curlError as Error).message,
            status: status ?? 0,
          });
        }
      }

      throw new AppError('Failed to fetch HTML from source', 502, {
        path,
        message: (error as Error).message,
        status: status ?? 0,
      });
    }
  }

  async fetchJson(
    path: string,
    query?: Record<string, string | number | undefined>,
  ): Promise<unknown> {
    try {
      const response = await httpClient.get(path, {
        params: query,
        headers: {
          Accept: 'application/json, text/plain, */*',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      return response.data;
    } catch (error) {
      const axiosError = error as { response?: { status?: number }; message?: string };
      const status = axiosError.response?.status;

      if (status === 403 || status === 503) {
        try {
          const url = this.buildUrl(path, query);
          const body = await this.fetchViaCurl(url, 'application/json, text/plain, */*');
          return JSON.parse(body) as unknown;
        } catch (curlError) {
          throw new AppError('Failed to fetch JSON from source', 502, {
            path,
            message: (curlError as Error).message,
            status: status ?? 0,
          });
        }
      }

      throw new AppError('Failed to fetch JSON from source', 502, {
        path,
        message: (error as Error).message,
        status: status ?? 0,
      });
    }
  }

  async resolveDownloadPath(pathOrUrl: string): Promise<ResolveDownloadResult> {
    const isAbsolute = /^https?:\/\//i.test(pathOrUrl);
    const requestUrl = isAbsolute
      ? pathOrUrl
      : pathOrUrl.startsWith('/')
        ? pathOrUrl
        : `/${pathOrUrl}`;

    try {
      const response = await httpClient.get(requestUrl, {
        maxRedirects: 0,
        validateStatus: (status: number) => status >= 200 && status < 400,
      });

      const location = (response.headers['location'] as string) ?? null;
      if ((response.status >= 400 || !location) && requestUrl) {
        const curlResolved = await this.resolveDownloadViaCurl(
          isAbsolute ? requestUrl : this.buildUrl(requestUrl),
        );
        if (curlResolved.location) return curlResolved;
      }
      return {
        location,
        status: response.status,
      };
    } catch (error) {
      const axiosError = error as {
        response?: { headers?: Record<string, string>; status?: number };
        message?: string;
      };
      if (axiosError.response) {
        const fallback = await this.resolveDownloadViaCurl(
          isAbsolute ? requestUrl : this.buildUrl(requestUrl),
        );
        if (fallback.location) return fallback;
        return {
          location: axiosError.response.headers?.['location'] ?? null,
          status: axiosError.response.status ?? 0,
        };
      }

      throw new AppError('Failed to resolve downloader link', 502, {
        pathOrUrl,
        message: (error as Error).message,
      });
    }
  }

  private async resolveDownloadViaCurl(url: string): Promise<ResolveDownloadResult> {
    const outTarget = process.platform === 'win32' ? 'NUL' : '/dev/null';
    const args = [
      '-L',
      url,
      '-A',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      '-H',
      'Accept: */*',
      '-H',
      `Referer: ${env.baseUrl}/`,
      '--compressed',
      '--max-time',
      String(Math.max(5, Math.floor(env.requestTimeoutMs / 1000))),
      '-o',
      outTarget,
      '-w',
      '%{url_effective}|%{http_code}',
    ];

    const commands = process.platform === 'win32' ? ['curl.exe', 'curl'] : ['curl'];
    for (const cmd of commands) {
      try {
        const { stdout } = await execFileAsync(cmd, args, { maxBuffer: 1024 * 1024 });
        const [effectiveUrl, codeRaw] = stdout.trim().split('|');
        const status = Number(codeRaw ?? '0');
        if (effectiveUrl && /^https?:\/\//i.test(effectiveUrl)) {
          return { location: effectiveUrl, status };
        }
      } catch {
        // try next available curl binary
      }
    }

    return { location: null, status: 0 };
  }
}
