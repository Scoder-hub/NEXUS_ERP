import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, '用户名至少3个字符').max(20, '用户名最多20个字符'),
  password: z.string().min(6, '密码至少6个字符').max(32, '密码最多32个字符'),
  rememberMe: z.boolean(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, '请输入当前密码'),
  newPassword: z.string()
    .min(6, '新密码至少6个字符')
    .max(32, '新密码最多32个字符')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, '密码需包含字母和数字'),
  confirmPassword: z.string().min(1, '请确认新密码'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

export const unlockSchema = z.object({
  pin: z.string().length(4, 'PIN码为4位数字').optional(),
  password: z.string().min(1, '请输入密码').optional(),
}).refine((data) => data.pin || data.password, {
  message: '请输入PIN码或密码',
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UnlockInput = z.infer<typeof unlockSchema>;
