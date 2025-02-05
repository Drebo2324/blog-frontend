
export interface Category {
    id: string;
    name: string;
    postCount?: number;
}
  
export interface Tag {
    id: string;
    name: string;
    postCount?: number;
}

export enum PostStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED'
}
  
export interface Post {
    id: string;
    title: string;
    content: string;
    author?: {
      id: string;
      name: string;
    };
    category: Category;
    tags: Tag[];
    readingTime?: number;
    createdAt: string;
    updatedAt: string;
    status?: PostStatus;
}
  
export interface CreatePostRequest {
    title: string;
    content: string;
    categoryId: string;
    tagIds: string[];
    status: PostStatus;
}
  
export interface UpdatePostRequest extends CreatePostRequest {
    id: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}
  
export interface AuthResponse {
    token: string;
    expiresIn: number;
}

export interface ApiError {
    status: number;
    message: string;
    errors?: Array<{
      field: string;
      message: string;
    }>;
}