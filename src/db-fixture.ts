import Dexie, { Table } from "dexie";

export interface NostrKey {
  publicKey: string;
  secretKey?: string;
  label?: string;
  lightningAddress?: string;
  follow?: boolean;
  ignore?: boolean;
}

export interface Classifier {
  "id": string,
  "thresholdSuppressOdds"?: string
  "model": string
}

export interface Feed {
    "id": string,
    "checked": boolean,
    "trainLabels": string[]
}

export interface CorsProxy {
  "id": string,
  "checked": boolean
}
export interface NostrRelay {
  "id": string,
  "checked": boolean
}
export interface TrainLabel {
  "id": string,
  "checked": boolean
}

export interface ProcessedPost {
  "id": string,
  "processedPosts": string[]
}

export class DbFixture extends Dexie {
  nostrkeys!: Table<NostrKey>;
  feeds!: Table<Feed>;
  corsproxies!: Table<CorsProxy>;
  trainlabels!: Table<TrainLabel>;
  classifiers!: Table<Classifier>;
  processedposts!: Table<ProcessedPost>;
  nostrrelays!: Table<NostrRelay>;
  constructor() {
    super("db-fixture");
    this.version(1).stores({
      nostrkeys: "&publicKey",
      feeds: "&id, checked, *trainLabels",
      corsproxies: "&id",
      trainlabels: "&id",
      classifiers: "&id",
      processedposts: "&id",
      nostrrelays: "&id"
    });
  }
}
