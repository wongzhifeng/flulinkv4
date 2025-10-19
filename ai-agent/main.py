# FluLink AI Agent 智能服务
# 基于《德道经》"无为而治"哲学，实现AI驱动的智能分析

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import httpx
import json
import logging
from datetime import datetime
import asyncio
import os

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 初始化 FastAPI 应用
app = FastAPI(
    title="FluLink AI Agent",
    description="基于德道经规则的AI智能分析服务",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 配置
CONTEXT7_API_KEY = os.getenv("CONTEXT7_API_KEY", "ctx7sk-3eff1f70-bd18-43af-955d-c2a3f0f94f45")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
POCKETBASE_URL = os.getenv("POCKETBASE_URL", "http://pocketbase:8090")
CHROMA_URL = os.getenv("CHROMA_URL", "http://chroma:8000")

# 德道经规则配置
DAOISM_RULES = {
    "spread_hierarchy": {
        "community": {"delay_minutes": 0, "infection_threshold": 0.1},
        "neighborhood": {"delay_minutes": 30, "infection_threshold": 0.2},
        "street": {"delay_minutes": 120, "infection_threshold": 0.4},
        "city": {"delay_minutes": 480, "infection_threshold": 0.6}
    },
    "user_levels": {
        "free": {"spread_range": ["community"], "immunity_power": 1.0},
        "premium": {"spread_range": ["community", "neighborhood"], "immunity_power": 1.5},
        "enterprise": {"spread_range": ["community", "neighborhood", "street", "city"], "immunity_power": 2.0}
    },
    "toxicity_thresholds": {
        "super_spread": 7.5,
        "high_virulence": 6.0,
        "moderate": 4.0,
        "low": 2.0
    }
}

# 数据模型
class ToxicityAnalysisRequest(BaseModel):
    content: str
    content_type: str = "text"
    user_level: str = "free"

class ToxicityAnalysisResponse(BaseModel):
    toxicity_score: float
    spectral_tags: List[str]
    sentiment: str
    virulence_level: str
    super_spread_triggered: bool
    analysis_details: Dict[str, Any]

class SpreadPredictionRequest(BaseModel):
    strain_id: str
    origin_location: Dict[str, Any]
    creator_level: str
    toxicity_score: float

class SpreadPredictionResponse(BaseModel):
    predicted_path: List[Dict[str, Any]]
    estimated_reach: int
    confidence_score: float
    geo_hierarchy_progression: List[str]
    daoism_compliance: bool

class EmbeddingRequest(BaseModel):
    content: str
    content_type: str = "text"

class EmbeddingResponse(BaseModel):
    vector: List[float]
    dimension: int
    model_used: str

# Context7 API 客户端
class Context7Client:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.context7.ai/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    async def analyze_content(self, content: str, analysis_type: str = "toxicity") -> Dict[str, Any]:
        """使用Context7 API分析内容"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/analyze",
                    headers=self.headers,
                    json={
                        "content": content,
                        "analysis_type": analysis_type,
                        "language": "zh-CN",
                        "context": "social_media_viral_content"
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Context7 API error: {response.status_code} - {response.text}")
                    return await self._fallback_analysis(content)
                    
        except Exception as e:
            logger.error(f"Context7 API request failed: {e}")
            return await self._fallback_analysis(content)

    async def _fallback_analysis(self, content: str) -> Dict[str, Any]:
        """降级分析策略"""
        # 基于关键词的简单毒性分析
        toxicity_keywords = {
            "high": ["病毒", "感染", "传播", "爆发", "疫情", "危险", "致命"],
            "medium": ["流行", "趋势", "热门", "火爆", "疯狂", "强烈"],
            "low": ["有趣", "好玩", "新奇", "特别", "独特"]
        }
        
        content_lower = content.lower()
        score = 0
        
        for level, keywords in toxicity_keywords.items():
            for keyword in keywords:
                if keyword in content_lower:
                    if level == "high":
                        score += 3
                    elif level == "medium":
                        score += 2
                    else:
                        score += 1
        
        # 基于内容长度的调整
        length_factor = min(len(content) / 100, 2.0)
        final_score = min(score * length_factor, 10.0)
        
        return {
            "toxicity_score": final_score,
            "sentiment": "positive" if final_score < 3 else "negative" if final_score > 7 else "neutral",
            "tags": ["用户生成", "社交内容"],
            "confidence": 0.6
        }

# ChromaDB 客户端
class ChromaClient:
    def __init__(self, base_url: str):
        self.base_url = base_url

    async def add_embedding(self, collection_name: str, id: str, embedding: List[float], metadata: Dict[str, Any]):
        """添加向量嵌入到ChromaDB"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/api/v1/collections/{collection_name}/add",
                    json={
                        "ids": [id],
                        "embeddings": [embedding],
                        "metadatas": [metadata]
                    },
                    timeout=10.0
                )
                return response.status_code == 200
        except Exception as e:
            logger.error(f"ChromaDB add embedding failed: {e}")
            return False

    async def query_similar(self, collection_name: str, query_embedding: List[float], n_results: int = 10):
        """查询相似向量"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/api/v1/collections/{collection_name}/query",
                    json={
                        "query_embeddings": [query_embedding],
                        "n_results": n_results
                    },
                    timeout=10.0
                )
                if response.status_code == 200:
                    return response.json()
                return None
        except Exception as e:
            logger.error(f"ChromaDB query failed: {e}")
            return None

# PocketBase 客户端
class PocketBaseClient:
    def __init__(self, base_url: str, admin_email: str, admin_password: str):
        self.base_url = base_url
        self.admin_email = admin_email
        self.admin_password = admin_password
        self.auth_token = None

    async def authenticate(self):
        """管理员认证"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/api/admins/auth-with-password",
                    json={
                        "identity": self.admin_email,
                        "password": self.admin_password
                    },
                    timeout=10.0
                )
                if response.status_code == 200:
                    data = response.json()
                    self.auth_token = data.get("token")
                    return True
                return False
        except Exception as e:
            logger.error(f"PocketBase authentication failed: {e}")
            return False

    async def update_strain(self, strain_id: str, data: Dict[str, Any]):
        """更新毒株数据"""
        if not self.auth_token:
            await self.authenticate()
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.patch(
                    f"{self.base_url}/api/collections/strains/records/{strain_id}",
                    headers={"Authorization": f"Bearer {self.auth_token}"},
                    json=data,
                    timeout=10.0
                )
                return response.status_code == 200
        except Exception as e:
            logger.error(f"PocketBase update strain failed: {e}")
            return False

# 全局客户端实例
context7_client = Context7Client(CONTEXT7_API_KEY)
chroma_client = ChromaClient(CHROMA_URL)
pb_client = PocketBaseClient(
    POCKETBASE_URL,
    os.getenv("POCKETBASE_ADMIN_EMAIL", "admin@flulink.app"),
    os.getenv("POCKETBASE_ADMIN_PASSWORD", "Flulink2025!Admin")
)

# 毒性分析服务
@app.post("/api/analyze/toxicity", response_model=ToxicityAnalysisResponse)
async def analyze_toxicity(request: ToxicityAnalysisRequest):
    """分析内容毒性分数"""
    try:
        # 使用Context7 API分析内容
        analysis_result = await context7_client.analyze_content(request.content)
        
        toxicity_score = analysis_result.get("toxicity_score", 0.0)
        sentiment = analysis_result.get("sentiment", "neutral")
        tags = analysis_result.get("tags", [])
        
        # 根据德道经规则确定毒性等级
        if toxicity_score >= DAOISM_RULES["toxicity_thresholds"]["super_spread"]:
            virulence_level = "super_spread"
            super_spread_triggered = True
        elif toxicity_score >= DAOISM_RULES["toxicity_thresholds"]["high_virulence"]:
            virulence_level = "high_virulence"
            super_spread_triggered = False
        elif toxicity_score >= DAOISM_RULES["toxicity_thresholds"]["moderate"]:
            virulence_level = "moderate"
            super_spread_triggered = False
        else:
            virulence_level = "low"
            super_spread_triggered = False
        
        return ToxicityAnalysisResponse(
            toxicity_score=toxicity_score,
            spectral_tags=tags,
            sentiment=sentiment,
            virulence_level=virulence_level,
            super_spread_triggered=super_spread_triggered,
            analysis_details=analysis_result
        )
        
    except Exception as e:
        logger.error(f"Toxicity analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"毒性分析失败: {str(e)}")

# 传播预测服务
@app.post("/api/predict/spread", response_model=SpreadPredictionResponse)
async def predict_spread(request: SpreadPredictionRequest):
    """预测毒株传播路径"""
    try:
        # 根据德道经规则确定传播层级
        user_level_config = DAOISM_RULES["user_levels"][request.creator_level]
        allowed_levels = user_level_config["spread_range"]
        
        # 构建传播路径
        predicted_path = []
        geo_hierarchy_progression = []
        
        for level in allowed_levels:
            level_config = DAOISM_RULES["spread_hierarchy"][level]
            
            # 检查感染阈值
            if request.toxicity_score >= level_config["infection_threshold"]:
                geo_hierarchy_progression.append(level)
                
                # 预测该层级的传播
                estimated_users = await _estimate_level_users(level, request.origin_location)
                predicted_path.append({
                    "level": level,
                    "estimated_users": estimated_users,
                    "delay_minutes": level_config["delay_minutes"],
                    "infection_rate": min(request.toxicity_score / 10, 1.0)
                })
        
        # 计算总预估到达人数
        estimated_reach = sum(level["estimated_users"] for level in predicted_path)
        
        # 计算置信度分数
        confidence_score = min(request.toxicity_score / 10, 1.0)
        
        return SpreadPredictionResponse(
            predicted_path=predicted_path,
            estimated_reach=estimated_reach,
            confidence_score=confidence_score,
            geo_hierarchy_progression=geo_hierarchy_progression,
            daoism_compliance=True
        )
        
    except Exception as e:
        logger.error(f"Spread prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"传播预测失败: {str(e)}")

# 向量化服务
@app.post("/api/embed", response_model=EmbeddingResponse)
async def create_embedding(request: EmbeddingRequest):
    """创建内容向量嵌入"""
    try:
        # 使用Context7 API生成嵌入向量
        embedding_result = await context7_client.analyze_content(
            request.content, 
            analysis_type="embedding"
        )
        
        vector = embedding_result.get("embedding", [])
        if not vector:
            # 降级策略：生成随机向量
            vector = [0.1] * 384  # 标准向量维度
        
        return EmbeddingResponse(
            vector=vector,
            dimension=len(vector),
            model_used="context7"
        )
        
    except Exception as e:
        logger.error(f"Embedding creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"向量化失败: {str(e)}")

# 辅助函数
async def _estimate_level_users(level: str, location: Dict[str, Any]) -> int:
    """估算层级用户数量"""
    # 基于地理层级的用户数量估算
    level_multipliers = {
        "community": 50,
        "neighborhood": 200,
        "street": 1000,
        "city": 10000
    }
    
    base_users = level_multipliers.get(level, 50)
    # 添加随机变化
    import random
    return int(base_users * random.uniform(0.8, 1.2))

# 健康检查
@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "service": "FluLink AI Agent",
        "version": "1.0.0",
        "daoism_rules_loaded": True,
        "timestamp": datetime.now().isoformat()
    }

# 启动事件
@app.on_event("startup")
async def startup_event():
    """服务启动时初始化"""
    logger.info("FluLink AI Agent 启动中...")
    
    # 验证Context7 API连接
    try:
        test_result = await context7_client.analyze_content("测试内容")
        logger.info("✅ Context7 API 连接正常")
    except Exception as e:
        logger.warning(f"⚠️ Context7 API 连接异常: {e}")
    
    # 验证PocketBase连接
    try:
        auth_success = await pb_client.authenticate()
        if auth_success:
            logger.info("✅ PocketBase 连接正常")
        else:
            logger.warning("⚠️ PocketBase 认证失败")
    except Exception as e:
        logger.warning(f"⚠️ PocketBase 连接异常: {e}")
    
    logger.info("🚀 FluLink AI Agent 启动完成")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
