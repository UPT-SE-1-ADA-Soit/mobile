export type User = {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  location?: string;
  rating?: number;
  totalSales?: number;
  joinedAt?: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
};

export type ProductCondition = 'new' | 'like-new' | 'good' | 'fair';

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: Category;
  seller: User;
  location: string;
  condition?: ProductCondition;
  createdAt: string;
  isLiked: boolean;
  views: number;
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
};

export type Conversation = {
  id: string;
  product: Product;
  buyer: User;
  seller: User;
  lastMessage: Message;
  messages: Message[];
  unreadCount: number;
};
