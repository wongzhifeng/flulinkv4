// src/lib/auth/password.ts
// 密码安全处理服务 - 基于《德道经》"修之于身，其德乃真"哲学

import bcrypt from 'bcryptjs';
import { z } from 'zod';

// 密码配置 - 对应《德道经》"道常无为而无不为"
const SALT_ROUNDS = 12; // bcrypt盐轮数
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

// 密码强度验证模式 - 对应"知人者智"
const PASSWORD_PATTERNS = {
  // 至少包含一个大写字母
  uppercase: /[A-Z]/,
  // 至少包含一个小写字母
  lowercase: /[a-z]/,
  // 至少包含一个数字
  digit: /\d/,
  // 至少包含一个特殊字符
  special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

// 密码验证Schema - 对应"自知者明"
export const passwordSchema = z.string()
  .min(MIN_PASSWORD_LENGTH, `密码长度至少${MIN_PASSWORD_LENGTH}位`)
  .max(MAX_PASSWORD_LENGTH, `密码长度不能超过${MAX_PASSWORD_LENGTH}位`)
  .refine((password) => PASSWORD_PATTERNS.uppercase.test(password), {
    message: '密码必须包含至少一个大写字母'
  })
  .refine((password) => PASSWORD_PATTERNS.lowercase.test(password), {
    message: '密码必须包含至少一个小写字母'
  })
  .refine((password) => PASSWORD_PATTERNS.digit.test(password), {
    message: '密码必须包含至少一个数字'
  })
  .refine((password) => PASSWORD_PATTERNS.special.test(password), {
    message: '密码必须包含至少一个特殊字符'
  });

// 密码强度等级 - 对应"道生一，一生二，二生三"
export enum PasswordStrength {
  WEAK = 'weak',
  MEDIUM = 'medium',
  STRONG = 'strong',
  VERY_STRONG = 'very_strong'
}

// 评估密码强度 - 对应"知人者智"
export function evaluatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  
  // 长度评分
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // 字符类型评分
  if (PASSWORD_PATTERNS.uppercase.test(password)) score += 1;
  if (PASSWORD_PATTERNS.lowercase.test(password)) score += 1;
  if (PASSWORD_PATTERNS.digit.test(password)) score += 1;
  if (PASSWORD_PATTERNS.special.test(password)) score += 1;
  
  // 复杂度评分
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.6) score += 1;
  
  // 根据分数确定强度等级
  if (score <= 3) return PasswordStrength.WEAK;
  if (score <= 5) return PasswordStrength.MEDIUM;
  if (score <= 7) return PasswordStrength.STRONG;
  return PasswordStrength.VERY_STRONG;
}

// 验证密码强度 - 对应"自知者明"
export function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    passwordSchema.parse(password);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => e.message));
    }
    return { isValid: false, errors };
  }
}

// 哈希密码 - 对应"无为而无不为"
export async function hashPassword(password: string): Promise<string> {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    console.log('✅ 密码哈希成功');
    return hashedPassword;
  } catch (error) {
    console.error('❌ 密码哈希失败:', error);
    throw new Error('密码加密失败');
  }
}

// 验证密码 - 对应"知人者智"
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log(isValid ? '✅ 密码验证成功' : '❌ 密码验证失败');
    return isValid;
  } catch (error) {
    console.error('❌ 密码验证失败:', error);
    return false;
  }
}

// 生成随机密码 - 对应"道生一，一生二"
export function generateRandomPassword(length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // 确保包含各种字符类型
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
  
  // 填充剩余长度
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // 打乱字符顺序
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// 密码重置令牌生成 - 对应"无为而治"
export function generatePasswordResetToken(): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  
  for (let i = 0; i < 32; i++) {
    token += charset[Math.floor(Math.random() * charset.length)];
  }
  
  return token;
}

// 密码历史检查 - 对应"知人者智"
export function checkPasswordHistory(newPassword: string, passwordHistory: string[]): boolean {
  // 检查新密码是否与历史密码相同
  for (const oldPassword of passwordHistory) {
    if (newPassword === oldPassword) {
      return false; // 不能使用历史密码
    }
  }
  return true;
}

// 密码安全建议 - 对应"自知者明"
export function getPasswordSecurityTips(): string[] {
  return [
    '使用至少8位字符的密码',
    '包含大写字母、小写字母、数字和特殊字符',
    '避免使用常见词汇或个人信息',
    '定期更换密码',
    '不要在多个账户使用相同密码',
    '使用密码管理器存储密码',
  ];
}
