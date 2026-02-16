import type { APIRequestContext, APIResponse } from '@playwright/test';

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface ApiResponseWrapper<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export abstract class BaseApiClient {
  protected readonly requestContext: APIRequestContext;
  protected readonly config: ApiConfig;

  constructor(requestContext: APIRequestContext, config: ApiConfig) {
    this.requestContext = requestContext;
    this.config = config;
  }

  protected async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<ApiResponseWrapper<T>> {
    const url = this.buildUrl(endpoint, params);
    const response = await this.requestContext.get(url, {
      headers: this.config.headers,
      timeout: this.config.timeout,
    });
    return this.wrapResponse<T>(response);
  }

  protected async post<T, B = Record<string, unknown>>(
    endpoint: string,
    body: B
  ): Promise<ApiResponseWrapper<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const response = await this.requestContext.post(url, {
      data: body,
      headers: this.config.headers,
      timeout: this.config.timeout,
    });
    return this.wrapResponse<T>(response);
  }

  protected async put<T, B = Record<string, unknown>>(
    endpoint: string,
    body: B
  ): Promise<ApiResponseWrapper<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const response = await this.requestContext.put(url, {
      data: body,
      headers: this.config.headers,
      timeout: this.config.timeout,
    });
    return this.wrapResponse<T>(response);
  }

  protected async delete<T>(endpoint: string): Promise<ApiResponseWrapper<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const response = await this.requestContext.delete(url, {
      headers: this.config.headers,
      timeout: this.config.timeout,
    });
    return this.wrapResponse<T>(response);
  }

  protected setHeader(key: string, value: string): void {
    this.config.headers[key] = value;
  }

  protected setAuthToken(token: string): void {
    this.setHeader('Authorization', `Bearer ${token}`);
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): string {
    const baseUrl = `${this.config.baseUrl}${endpoint}`;
    if (!params) return baseUrl;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });

    const queryString = searchParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  private async wrapResponse<T>(
    response: APIResponse
  ): Promise<ApiResponseWrapper<T>> {
    const body = (await response.json().catch(() => ({}))) as T;
    return {
      data: body,
      status: response.status(),
      headers: response.headers(),
    };
  }
}
