import { makeAutoObservable, runInAction } from "mobx";

import type {
  FeatureRequestResponseDto,
  CreateFeatureRequestDto,
  UpdateFeatureRequestDto,
} from "../api/nswag-api-client";
import { API } from "../api";

class FeatureRequestStore {
  public featureRequests: FeatureRequestResponseDto[] = [];

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true });
  }

  public async getFeatureRequests() {
    try {
      const result = await API.featureRequests.findAll();

      runInAction(() => {
        this.featureRequests = result;
      });
    } catch (error) {
      console.error(error);
    }
  }

  public async getFeatureRequestById(
    id: string
  ): Promise<FeatureRequestResponseDto | null> {
    try {
      const result = await API.featureRequests.findOne(id);
      return result;
    } catch (error) {
      console.error("❌ Store: Error getting feature request by ID:", error);
      return null;
    }
  }

  public async createFeatureRequest(featureRequest: CreateFeatureRequestDto) {
    try {
      const result = await API.featureRequests.create(featureRequest);

      runInAction(() => {
        this.featureRequests.push(result);
      });
    } catch (error) {
      console.error(error);
    }
  }

  public async updateFeatureRequest(
    id: string,
    updateData: UpdateFeatureRequestDto
  ) {
    try {
      const result = await API.featureRequests.update(id, updateData);

      runInAction(() => {
        const index = this.featureRequests.findIndex(
          (fr) => fr.id.toString() === id
        );
        if (index !== -1) {
          this.featureRequests[index] = result;
        }
      });
    } catch (error) {
      console.error("❌ Store: Error updating feature request:", error);
      throw error;
    }
  }

  public async deleteFeatureRequest(id: string) {
    try {
      await API.featureRequests.remove(id);

      runInAction(() => {
        const index = this.featureRequests.findIndex(
          (fr) => fr.id.toString() === id
        );
        if (index !== -1) {
          this.featureRequests.splice(index, 1);
        }
      });
    } catch (error) {
      console.error("❌ Store: Error deleting feature request:", error);
      throw error;
    }
  }
}

export default new FeatureRequestStore();
