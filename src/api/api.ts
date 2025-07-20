import { FeatureRequestApiClient } from "./nswag-api-client";

class Api {
  public featureRequests: FeatureRequestApiClient;

  constructor() {
    this.featureRequests = new FeatureRequestApiClient();
  }
}

export const API = new Api();
