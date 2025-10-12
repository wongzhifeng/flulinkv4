// src/server/api/strains.ts
// 毒株API路由 - 基于《德道经》"无为而治"理念

import { json } from '@solidjs/router';
import { VirusStrainService } from '../services/VirusStrainService';
import { GeographicPropagationService } from '../services/GeographicPropagationService';

// GET /api/strains - 获取所有活跃毒株
export async function GET() {
  try {
    const virusStrainService = VirusStrainService.getInstance();
    const strains = await virusStrainService.getAllActiveStrains();
    
    return json({
      success: true,
      data: strains,
      count: strains.length,
      message: '获取毒株成功'
    });
  } catch (error) {
    console.error('❌ 获取毒株失败:', error);
    return json({
      success: false,
      error: '获取毒株失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

// POST /api/strains - 创建新毒株
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, author, tags, susceptibleTags, type, isSuperFlu } = body;
    
    if (!content || !author) {
      return json({
        success: false,
        error: '缺少必要参数',
        message: '内容和作者信息不能为空'
      }, { status: 400 });
    }

    const virusStrainService = VirusStrainService.getInstance();
    const strain = await virusStrainService.createVirusStrain(
      content,
      author,
      tags || [],
      susceptibleTags || [],
      type || 'life',
      isSuperFlu || false
    );

    return json({
      success: true,
      data: strain,
      message: '毒株创建成功'
    });
  } catch (error) {
    return json({
      success: false,
      error: '创建毒株失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
