import axios, { AxiosInstance, AxiosResponse, 
    InternalAxiosRequestConfig, AxiosError } from "axios";


//API Types
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

//Axios singleton
class ApiService {
    private api: AxiosInstance;
    private static instance: ApiService;

    private constructor() {
      this.api = axios.create({
        baseURL: '/api/v1',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      //Request interceptor to add JWT to header
      this.api.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const token = localStorage.getItem('token');
            if(token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error: AxiosError) => {
            return Promise.reject(error);
        }
      );

      //Response Interceptor check for 401 -> remove JWT -> redirect to login
      this.api.interceptors.response.use(
        (response: AxiosResponse) => response,
        (error: AxiosError) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            return Promise.reject(this.handleError(error))
        }
      );
    }

    //Standardize errors -> Use backend error controller
    private handleError(error: AxiosError): ApiError {
        if (error.response?.data) {
            return error.response?.data as ApiError;
        }
        //fallback
        return {
            status: 500,
            message: 'An unexpeceted error has occured'
        };
    }

    //Static method to access ApiService Singleton
    public static getInstance(): ApiService {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }

    //Authentication Endpoints
    public async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
        localStorage.setItem('token', response.data.token);
        return response.data;
    }

    public logout(): void {
        localStorage.removeItem('token');
    }

    //Category Endpoints
    public async getCategories(): Promise<Category[]> {
        const response: AxiosResponse<Category[]> = await this.api.get('/categories');
        return response.data;
    }

    public async createCategory(name: string): Promise<Category> {
        const response: AxiosResponse<Category> = await this.api.post('/categories', {name});
        return response.data;
    }

    public async updateCategory(id: string, name: string): Promise<Category> {
        const response: AxiosResponse<Category> = await this.api.put(`/categories/${id}`, {id, name});
        return response.data;
    }

    public async deleteCategory(id: string): Promise<void> {
        await this.api.delete(`/categories/${id}`);
    }

    //Tags Endpoints
    public async getTags(): Promise<Tag[]> {
        const response: AxiosResponse<Tag[]> = await this.api.get('/tags');
        return response.data;
    }

    public async createTags(name: string): Promise<Tag[]> {
        const response: AxiosResponse<Tag[]> = await this.api.post('/tags', {name});
        return response.data;
    }

    public async deleteTag(id: string): Promise<void> {
        await this.api.delete(`/tags/${id}`);
    }

    //Post Endpoints
    public async getPosts(params: {
        categoryId?: string;
        tagId?: string;
    }): Promise<Post[]> {
        const response: AxiosResponse<Post[]> = await this.api.get('/posts', {params});
        return response.data;
    }

    public async getPost(id: string): Promise<Post> {
        const response: AxiosResponse<Post> = await this.api.get(`/posts/${id}`);
        return response.data;
    }

    public async createPost(post: CreatePostRequest): Promise<Post> {
        const response: AxiosResponse<Post> = await this.api.post('/posts', post);
        return response.data;
    }

    public async updatePost(id: string, post: UpdatePostRequest): Promise<Post> {
        const response: AxiosResponse<Post> = await this.api.put(`/posts/${id}`, post);
        return response.data;
    }

    public async deletePost(id: string): Promise<void> {
        await this.api.delete(`/posts/${id}`);
    }
}

