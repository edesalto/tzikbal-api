import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Local Register
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: { email: string; password: string }) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: Request) {
    const user = req.user as { userId: string; email: string };
    return this.authService.getProfile(user.email);
  }

  @Get('debug-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Debug JWT token (temporary)' })
  debugToken(@Req() req: Request) {
    console.log('Request user:', req.user);
    console.log('Request headers:', req.headers);
    return { user: req.user, message: 'JWT is working' };
  }

  @Get('test-no-guard')
  @ApiOperation({ summary: 'Test endpoint without guard' })
  testNoGuard() {
    return { message: 'This endpoint works without guard' };
  }

  @Get('verify-token')
  @ApiOperation({ summary: 'Manually verify JWT token (temporary)' })
  verifyToken(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return { error: 'No authorization header' };
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      // Using the same JWT service that the auth module uses
      const decoded = this.authService['jwtService'].verify(token);
      return { success: true, decoded, message: 'Token is valid' };
    } catch (error) {
      return { error: 'Token verification failed', details: error.message };
    }
  }

  // Google OAuth2 Login
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth2 login' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth2' })
  async googleAuth() {
    // Initiates the Google OAuth2 login flow
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth2 callback' })
  @ApiResponse({ status: 200, description: 'Google login successful' })
  @ApiResponse({ status: 400, description: 'No user information found' })
  googleAuthRedirect(@Req() req: Request) {
    // req.user contains the user info from Google
    // Here you can handle the user data, e.g., create a session or return a JWT
    if (!req.user) {
      throw new Error('No user information found in request');
    }
    return req.user;
  }
}
