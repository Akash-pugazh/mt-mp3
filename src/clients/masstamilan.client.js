const { promisify } = require('util');
const { execFile } = require('child_process');
const { httpClient } = require('../utils/httpClient');
const { AppError } = require('../errors/AppError');
const { env } = require('../config/env');

const execFileAsync = promisify(execFile);

class MasstamilanClient {
  buildUrl(path, query = undefined) {
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

  isCloudflareChallenge(payload) {
    if (typeof payload !== 'string') return false;
    const probe = payload.toLowerCase();
    return probe.includes('just a moment') || probe.includes('__cf_chl_opt');
  }

  async fetchViaCurl(url, accept = 'text/html') {
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
    let lastError = null;

    for (const cmd of commands) {
      try {
        const { stdout } = await execFileAsync(cmd, args, {
          maxBuffer: 10 * 1024 * 1024,
        });
        return stdout;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('curl execution failed');
  }

  async fetchHtml(path, query = undefined) {
    try {
      const response = await httpClient.get(path, {
        params: query,
        responseType: 'text',
      });

      if (this.isCloudflareChallenge(response.data)) {
        const url = this.buildUrl(path, query);
        const html = await this.fetchViaCurl(url, 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');

        if (this.isCloudflareChallenge(html)) {
          throw new AppError('Source blocked by anti-bot challenge', 503, { path });
        }

        return html;
      }

      return response.data;
    } catch (error) {
      const status = error.response?.status;

      if (status === 403 || status === 503) {
        try {
          const url = this.buildUrl(path, query);
          const html = await this.fetchViaCurl(url, 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');

          if (this.isCloudflareChallenge(html)) {
            throw new AppError('Source blocked by anti-bot challenge', 503, { path });
          }

          return html;
        } catch (curlError) {
          throw new AppError('Failed to fetch HTML from source', 502, {
            path,
            message: curlError.message,
            status,
          });
        }
      }

      throw new AppError('Failed to fetch HTML from source', 502, {
        path,
        message: error.message,
        status,
      });
    }
  }

  async fetchJson(path, query = undefined) {
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
      const status = error.response?.status;

      if (status === 403 || status === 503) {
        try {
          const url = this.buildUrl(path, query);
          const body = await this.fetchViaCurl(url, 'application/json, text/plain, */*');
          return JSON.parse(body);
        } catch (curlError) {
          throw new AppError('Failed to fetch JSON from source', 502, {
            path,
            message: curlError.message,
            status,
          });
        }
      }

      throw new AppError('Failed to fetch JSON from source', 502, {
        path,
        message: error.message,
        status,
      });
    }
  }

  async resolveDownloadPath(pathOrUrl) {
    const isAbsolute = /^https?:\/\//i.test(pathOrUrl);
    const requestUrl = isAbsolute ? pathOrUrl : pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;

    try {
      const response = await httpClient.get(requestUrl, {
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
      });

      const location = response.headers.location || null;
      return {
        location,
        status: response.status,
      };
    } catch (error) {
      if (error.response) {
        return {
          location: error.response.headers?.location || null,
          status: error.response.status,
        };
      }

      throw new AppError('Failed to resolve downloader link', 502, {
        pathOrUrl,
        message: error.message,
      });
    }
  }
}

module.exports = { MasstamilanClient };
