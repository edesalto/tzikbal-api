export interface SafeUser {
  email: string;
  name: string;
  picture?: string;
  provider: string;
  id: string;
  accessToken?: string; // Optional, used for OAuth flows
  roles?: string[]; // Optional, if you want to include user roles
  // Add other fields as needed, but avoid sensitive information
}
