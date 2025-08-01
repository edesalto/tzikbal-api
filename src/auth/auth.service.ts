import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../users/schemas/user.schema';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { GoogleProfileJson } from './strategies/google-profile.interface';
import { SafeUser } from './safe-user.interface';
import { AUTH_PROVIDERS } from '../common/enums/provides.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) throw new ConflictException('User already exists');
    const hash = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({
      ...dto,
      password: hash,
      provider: AUTH_PROVIDERS.LOCAL,
    });
    await user.save();
    if (!user) {
      throw new UnauthorizedException('User registration failed');
    }

    return this.convertToSafeUser(user);
  }

  async login(dto: { email: string; password: string }) {
    const user = (await this.userModel
      .findOne({ email: dto.email })
      .lean()) as User | null;
    if (!user || !user.password)
      throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    // remove user password from the response
    const payload = { sub: user._id, email: user.email };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return {
      access_token: this.jwtService.sign(payload),
      user: safeUser,
    };
  }

  async registerGoogleUser(userGoogle: GoogleProfileJson) {
    const user = await this.userModel
      .findOne({ email: userGoogle.email })
      .lean();

    if (!user) {
      // If user does not exist, create a new user
      const newUser = new this.userModel({
        ...userGoogle,
        provider: AUTH_PROVIDERS.GOOGLE,
      });
      return this.convertToSafeUser(newUser);
    }
    return this.convertToSafeUser(user);
  }

  async getProfile(email: string): Promise<SafeUser> {
    const user = await this.userModel.findOne({ email }).lean();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.convertToSafeUser(user);
  }

  /**
   * Converts a User document to a SafeUser object, omitting sensitive fields like password.
   * @param user - The User document from the database.
   * @returns A SafeUser object containing only non-sensitive user information.
   */
  private convertToSafeUser(user: User): SafeUser {
    return {
      email: user.email,
      name: user.name,
      picture: user.picture, // Assuming picture is used as avatar
      provider: user.provider,
      id: user._id as string, // Convert ObjectId to string
    };
  }
}
