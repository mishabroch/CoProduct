import type { AxiosRequestConfig } from "axios";


export class BaseApiClient {
  protected baseApiClient = '';

  protected transformOptions(options: AxiosRequestConfig) {
    options.headers = {
      ...options.headers,
      // Authorization: `Bearer ${keycloak.token}`,
    };

    return Promise.resolve(options);
  }
}
