import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { RegisterUserDto, UpdateUserDto, UserResponseDto } from '../dtos/user.dto';

const userService = new UserService();

export class UserController {
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      let token = req.headers.authorization?.split(' ')[1];

      // Fallback: Check cookies if header is missing (e.g., direct call without gateway transformation)
      if (!token && req.cookies) {
        token = req.cookies.accessToken;
      }

      const user = await userService.getUserById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async register(req: Request, res: Response) {
    try {
      // Validate with DTO
      const parsedBody = RegisterUserDto.parse(req.body);
      const user = await userService.register(parsedBody);
      res.status(201).json(UserResponseDto(user));
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const identifier = req.body.username || req.body.email;
      const result: any = await userService.login(identifier, req.body.password);
      
      // Set HttpOnly Cookie
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      res.json({ user: UserResponseDto(result.user), success: true });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie('accessToken');
    res.json({ success: true });
  }

  async verify(req: any, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const user = await userService.getUserById(req.user.id);
      res.json({ user: UserResponseDto(user) });
    } catch (error: any) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const parsedBody = UpdateUserDto.parse(req.body);
      const user = await userService.updateProfile(req.params.id, parsedBody);
      res.json(UserResponseDto(user));
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      await userService.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async addAddress(req: Request, res: Response) {
    try {
      const address = await userService.addAddress(req.params.id, req.body);
      res.status(201).json(address);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAddresses(req: Request, res: Response) {
    try {
      const addresses = await userService.getAddresses(req.params.id);
      res.json(addresses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
