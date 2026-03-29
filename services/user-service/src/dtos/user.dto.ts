import { z } from 'zod';

// DTO cho Đăng ký (Register)
export const RegisterUserDto = z.object({
  username: z.string().min(3, 'Username phải có ít nhất 3 ký tự'),
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  full_name: z.string().optional(),
});

// DTO cho Đăng nhập (Login)
export const LoginUserDto = z.object({
  username: z.string().optional(),
  email: z.string().email('Email không đúng định dạng').optional(),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
}).refine(data => data.username || data.email, {
  message: 'Bạn phải cung cấp username hoặc email',
  path: ['username'],
});

// DTO cho Cập nhật Profile
export const UpdateUserDto = z.object({
  full_name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url('Link website không đúng định dạng').optional().or(z.literal('')),
});

// DTO cho Phản hồi (Response) - Giúp lọc các trường nhạy cảm
export const UserResponseDto = (user: any) => {
  const { password_hash, ...safeUser } = user;
  return safeUser;
};

export type RegisterUserType = z.infer<typeof RegisterUserDto>;
export type LoginUserType = z.infer<typeof LoginUserDto>;
export type UpdateUserType = z.infer<typeof UpdateUserDto>;
