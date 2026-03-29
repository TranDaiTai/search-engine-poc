import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterUserType, UpdateUserType } from '../dtos/user.dto';

const userRepository = new UserRepository();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class UserService {
  async getAllUsers() {
    return userRepository.findAll();
  }

  async getUserById(id: string) {
    return userRepository.findById(id);
  }

  async register(data: RegisterUserType) {
    const { username, email, password, full_name } = data;
    
    // Check if user exists
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error('Email already exists');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    return userRepository.create({
      username,
      email,
      passwordHash,
      fullName: full_name,
    });
  }

  async login(identifier: string, pass: string) {
    let user = await userRepository.findByEmail(identifier);
    if (!user) {
      user = await userRepository.findByUsername(identifier);
    }
    
    if (!user) throw new Error('Cửa hàng không có hội viên này bạn ơi!');

    const valid = await bcrypt.compare(pass, user.passwordHash);
    if (!valid) throw new Error('Thông tin đăng nhập không chính xác.');

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role?.name },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { user, token, accessToken: token };
  }

  async updateProfile(id: string, data: UpdateUserType) {
    return userRepository.update(id, data);
  }

  async deleteUser(id: string) {
    return userRepository.delete(id);
  }

  async addAddress(userId: string, data: any) {
    return userRepository.addAddress(userId, data);
  }

  async getAddresses(userId: string) {
    return userRepository.getAddresses(userId);
  }
}
