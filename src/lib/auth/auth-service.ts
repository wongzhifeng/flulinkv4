// src/lib/auth/auth-service.ts
// 用户认证服务 - 基于《德道经》"修之于身，其德乃真"哲学

import { z } from 'zod';
import { hashPassword, verifyPassword, validatePasswordStrength } from './password';
import { generateTokenPair, verifyAccessToken, addToBlacklist } from './jwt';
import { db, tursoClient } from '../database';
import { users } from '../../shared/schema';

// 用户注册Schema - 对应《德道经》"道生一"
export const registerSchema = z.object({
  username: z.string()
    .min(3, '用户名至少3个字符')
    .max(20, '用户名不能超过20个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  email: z.string()
    .email('请输入有效的邮箱地址')
    .max(100, '邮箱地址不能超过100个字符'),
  password: z.string()
    .min(8, '密码至少8个字符')
    .max(128, '密码不能超过128个字符'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

// 用户登录Schema - 对应"一生二"
export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
});

// 用户信息更新Schema - 对应"二生三"
export const updateProfileSchema = z.object({
  username: z.string()
    .min(3, '用户名至少3个字符')
    .max(20, '用户名不能超过20个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')
    .optional(),
  avatarUrl: z.string().url('请输入有效的头像URL').optional(),
  locationLat: z.number().min(-90).max(90).optional(),
  locationLng: z.number().min(-180).max(180).optional(),
  locationAddress: z.string().max(200).optional(),
});

// 用户注册 - 对应"修之于身，其德乃真"
export async function registerUser(userData: z.infer<typeof registerSchema>) {
  try {
    // 验证输入数据
    const validatedData = registerSchema.parse(userData);
    
    // 验证密码强度
    const passwordValidation = validatePasswordStrength(validatedData.password);
    if (!passwordValidation.isValid) {
      throw new Error(`密码不符合要求: ${passwordValidation.errors.join(', ')}`);
    }
    
    // 检查用户是否已存在
    const existingUser = await checkUserExists(validatedData.email, validatedData.username);
    if (existingUser.exists) {
      throw new Error(existingUser.reason);
    }
    
    // 哈希密码
    const hashedPassword = await hashPassword(validatedData.password);
    
    // 生成用户ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 创建用户记录
    const newUser = {
      id: userId,
      username: validatedData.username,
      email: validatedData.email,
      password_hash: hashedPassword,
      user_type: 'free' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // 保存到数据库
    if (tursoClient) {
      await tursoClient.execute(`
        INSERT INTO users (id, username, email, password_hash, user_type, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        newUser.id,
        newUser.username,
        newUser.email,
        newUser.password_hash,
        newUser.user_type,
        newUser.created_at,
        newUser.updated_at,
      ]);
    }
    
    // 生成令牌对
    const tokens = generateTokenPair(userId, validatedData.email, 'free');
    
    console.log('✅ 用户注册成功:', userId);
    
    return {
      success: true,
      user: {
        id: userId,
        username: validatedData.username,
        email: validatedData.email,
        userType: 'free',
        createdAt: newUser.created_at,
      },
      tokens,
    };
  } catch (error) {
    console.error('❌ 用户注册失败:', error);
    throw error;
  }
}

// 用户登录 - 对应"知人者智"
export async function loginUser(loginData: z.infer<typeof loginSchema>) {
  try {
    // 验证输入数据
    const validatedData = loginSchema.parse(loginData);
    
    // 查找用户
    const user = await findUserByEmail(validatedData.email);
    if (!user) {
      throw new Error('用户不存在或密码错误');
    }
    
    // 验证密码
    const isPasswordValid = await verifyPassword(validatedData.password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('用户不存在或密码错误');
    }
    
    // 生成令牌对
    const tokens = generateTokenPair(user.id, user.email, user.user_type);
    
    // 更新最后登录时间
    if (tursoClient) {
      await tursoClient.execute(`
        UPDATE users SET updated_at = ? WHERE id = ?
      `, [new Date().toISOString(), user.id]);
    }
    
    console.log('✅ 用户登录成功:', user.id);
    
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.user_type,
        createdAt: user.created_at,
      },
      tokens,
    };
  } catch (error) {
    console.error('❌ 用户登录失败:', error);
    throw error;
  }
}

// 用户登出 - 对应"无为而无不为"
export async function logoutUser(token: string) {
  try {
    // 将令牌加入黑名单
    addToBlacklist(token);
    
    console.log('✅ 用户登出成功');
    
    return {
      success: true,
      message: '登出成功',
    };
  } catch (error) {
    console.error('❌ 用户登出失败:', error);
    throw error;
  }
}

// 获取用户信息 - 对应"自知者明"
export async function getUserProfile(userId: string) {
  try {
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.user_type,
        avatarUrl: user.avatar_url,
        locationLat: user.location_lat,
        locationLng: user.location_lng,
        locationAddress: user.location_address,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    };
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error);
    throw error;
  }
}

// 更新用户信息 - 对应"无为而治"
export async function updateUserProfile(userId: string, updateData: z.infer<typeof updateProfileSchema>) {
  try {
    // 验证输入数据
    const validatedData = updateProfileSchema.parse(updateData);
    
    // 检查用户是否存在
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    
    // 构建更新SQL
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (validatedData.username !== undefined) {
      updateFields.push('username = ?');
      updateValues.push(validatedData.username);
    }
    if (validatedData.avatarUrl !== undefined) {
      updateFields.push('avatar_url = ?');
      updateValues.push(validatedData.avatarUrl);
    }
    if (validatedData.locationLat !== undefined) {
      updateFields.push('location_lat = ?');
      updateValues.push(validatedData.locationLat);
    }
    if (validatedData.locationLng !== undefined) {
      updateFields.push('location_lng = ?');
      updateValues.push(validatedData.locationLng);
    }
    if (validatedData.locationAddress !== undefined) {
      updateFields.push('location_address = ?');
      updateValues.push(validatedData.locationAddress);
    }
    
    if (updateFields.length === 0) {
      throw new Error('没有需要更新的字段');
    }
    
    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString());
    updateValues.push(userId);
    
    // 执行更新
    if (tursoClient) {
      await tursoClient.execute(`
        UPDATE users SET ${updateFields.join(', ')} WHERE id = ?
      `, updateValues);
    }
    
    console.log('✅ 用户信息更新成功:', userId);
    
    return {
      success: true,
      message: '用户信息更新成功',
    };
  } catch (error) {
    console.error('❌ 用户信息更新失败:', error);
    throw error;
  }
}

// 检查用户是否存在 - 对应"知人者智"
async function checkUserExists(email: string, username: string) {
  try {
    if (tursoClient) {
      // 检查邮箱
      const emailResult = await tursoClient.execute(`
        SELECT id FROM users WHERE email = ?
      `, [email]);
      
      if (emailResult.rows.length > 0) {
        return { exists: true, reason: '邮箱已被注册' };
      }
      
      // 检查用户名
      const usernameResult = await tursoClient.execute(`
        SELECT id FROM users WHERE username = ?
      `, [username]);
      
      if (usernameResult.rows.length > 0) {
        return { exists: true, reason: '用户名已被使用' };
      }
    }
    
    return { exists: false, reason: '' };
  } catch (error) {
    console.error('❌ 检查用户存在性失败:', error);
    throw error;
  }
}

// 根据邮箱查找用户 - 对应"自知者明"
async function findUserByEmail(email: string) {
  try {
    if (tursoClient) {
      const result = await tursoClient.execute(`
        SELECT * FROM users WHERE email = ?
      `, [email]);
      
      if (result.rows.length > 0) {
        return result.rows[0] as any;
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ 根据邮箱查找用户失败:', error);
    throw error;
  }
}

// 根据ID查找用户 - 对应"知人者智"
async function findUserById(userId: string) {
  try {
    if (tursoClient) {
      const result = await tursoClient.execute(`
        SELECT * FROM users WHERE id = ?
      `, [userId]);
      
      if (result.rows.length > 0) {
        return result.rows[0] as any;
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ 根据ID查找用户失败:', error);
    throw error;
  }
}

// 验证用户令牌 - 对应"无为而治"
export function validateUserToken(token: string) {
  try {
    const payload = verifyAccessToken(token);
    if (!payload) {
      return null;
    }
    
    return {
      userId: payload.userId,
      email: payload.email,
      userType: payload.userType,
      sessionId: payload.sessionId,
    };
  } catch (error) {
    console.error('❌ 验证用户令牌失败:', error);
    return null;
  }
}
