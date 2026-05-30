export type ApiAuthResponse = {
  token: string;
  userId: number;
  email: string;
  name: string;
  location: string | null;
  avatarUrl: string | null;
};

export type ApiValidateResponse = {
  userId: number;
  email: string;
  name: string;
  location: string | null;
  avatarUrl: string | null;
};

export type ApiUserProfile = {
  userId: number;
  name: string;
  location: string | null;
  avatarUrl: string | null;
};

export type ApiCategory = {
  id: number;
  name: string;
};

export type ApiProductSummary = {
  id: number;
  name: string;
  categoryId: number;
  price: string;
  attributeIds: number[];
  inStock: boolean;
  thumbnailUrl: string | null;
  region: string;
};

export type ApiProductAttribute = {
  attributeId: number;
  attributeName: string;
  valueId: number;
  valueName: string;
};

export type ApiProductDetail = {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: string;
  description: string | null;
  addedDate: string;
  region: string;
  attributes: ApiProductAttribute[];
  inStock: boolean;
  sellerId: number | null;
  imageUrls: string[];
};

export type ApiOrder = {
  id: number;
  userId: number;
  productId: number;
  productName: string;
  orderedAt: string;
};
