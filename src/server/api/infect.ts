// src/server/api/infect.ts
// 感染API路由 - 对应《德道经》"民自化"

import { json } from '@solidjs/router';
import { VirusStrainService } from '../services/VirusStrainService';

// POST /api/infect - 感染用户
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { strainId, userId, latitude, longitude, sourceUserId } = body;
    
    if (!strainId || !userId || latitude === undefined || longitude === undefined) {
      return json({
        success: false,
        error: '缺少必要参数',
        message: '毒株ID、用户ID和位置信息不能为空'
      }, { status: 400 });
    }

    const virusStrainService = VirusStrainService.getInstance();
    const infectionRecord = await virusStrainService.infectUser(
      strainId,
      userId,
      latitude,
      longitude,
      sourceUserId
    );

    if (!infectionRecord) {
      return json({
        success: false,
        error: '感染失败',
        message: '不满足感染条件或毒株已失效'
      }, { status: 400 });
    }

    return json({
      success: true,
      data: infectionRecord,
      message: '感染成功'
    });
  } catch (error) {
    return json({
      success: false,
      error: '感染失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
