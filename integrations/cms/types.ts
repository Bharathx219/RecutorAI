export interface WixDataItem {
  _id: string;
  _createdDate?: Date | string;
  _updatedDate?: Date | string;
}

export interface WixDataQueryResult<T = WixDataItem> {
  items: T[];
  totalCount: number;
  hasNext: boolean;
}
