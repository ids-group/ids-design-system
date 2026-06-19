export interface LoginRequest {
  email: string;
  password: string;
}

export interface JwtResult {
  token: string;
  refreshToken: string;
  expiresOn: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  publicId: string;
  token: string;
  password: string;
  passwordConfirmation: string;
}

export interface ActivateAccountRequest {
  userPublicId: string;
  token: string;
  password: string;
  passwordConfirmation: string;
}

export interface CurrentUserDto {
  isAuthenticated?: boolean;
  publicId: string;
  email: string;
  roles?: string[];
  fullName?: string;
  firstName?: string;
  lastName?: string;
  avatarDownloadPath?: string;
  phoneNumber?: string;
}

export interface CurrentUser {
  publicId: string;
  email: string;
  roles: string[];
  fullName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}
