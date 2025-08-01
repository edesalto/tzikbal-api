export class UserDto {
  userId: string;
  name: string;
  email: string;
  password: string;
  preferences: {
    lang: string;
    theme: 'dark' | 'light' | 'auto';
  };
  phone?: string;
  picture?: string;
  roles?: string[];
  status: boolean = true;
  version?: number;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
}
