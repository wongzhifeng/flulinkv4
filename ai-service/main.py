# FluLink v4.0 AI 服务实现

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import chromadb
import numpy as np
from typing import List, Dict, Any
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 初始化 FastAPI 应用
app = FastAPI(
    title="FluLink AI Service",
    description="FluLink v4.0 AI 智能服务",
    version="4.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局变量
embedding_model = None
chroma_client = None
user_interests_collection = None
content_similarity_collection = None
cluster_compatibility_collection = None

# 数据模型
class TextEmbeddingRequest(BaseModel):
    text: str

class TextEmbeddingResponse(BaseModel):
    vector: List[float]
    dimension: int

class SimilarityRequest(BaseModel):
    seed_vector: List[float]
    user_pool: List[Dict[str, Any]]
    limit: int = 10
    min_similarity: float = 0.6

class SimilarityResponse(BaseModel):
    similar_users: List[Dict[str, Any]]

class ContentAnalysisRequest(BaseModel):
    content: str

class ContentAnalysisResponse(BaseModel):
    sentiment: str
    topics: List[str]
    keywords: List[str]
    readability: float
    engagement_potential: float

class PropagationRequest(BaseModel):
    star_seed: Dict[str, Any]
    target_users: List[Dict[str, Any]]

class PropagationResponse(BaseModel):
    optimal_path: Dict[str, Any]

# 初始化函数
async def initialize_ai_service():
    """初始化 AI 服务"""
    global embedding_model, chroma_client
    global user_interests_collection, content_similarity_collection, cluster_compatibility_collection
    
    try:
        # 初始化嵌入模型
        logger.info("正在加载嵌入模型...")
        embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info("嵌入模型加载完成")
        
        # 初始化 ChromaDB
        logger.info("正在初始化 ChromaDB...")
        chroma_client = chromadb.Client()
        
        # 创建集合
        try:
            user_interests_collection = chroma_client.create_collection(
                name="user_interests",
                metadata={"description": "用户兴趣向量存储"}
            )
        except:
            user_interests_collection = chroma_client.get_collection("user_interests")
        
        try:
            content_similarity_collection = chroma_client.create_collection(
                name="content_similarity",
                metadata={"description": "内容相似度向量存储"}
            )
        except:
            content_similarity_collection = chroma_client.get_collection("content_similarity")
        
        try:
            cluster_compatibility_collection = chroma_client.create_collection(
                name="cluster_compatibility",
                metadata={"description": "星团兼容性向量存储"}
            )
        except:
            cluster_compatibility_collection = chroma_client.get_collection("cluster_compatibility")
        
        logger.info("ChromaDB 初始化完成")
        
    except Exception as e:
        logger.error(f"AI 服务初始化失败: {e}")
        raise e

# 启动事件
@app.on_event("startup")
async def startup_event():
    await initialize_ai_service()

# 健康检查
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "FluLink AI Service",
        "version": "4.0.0",
        "model_loaded": embedding_model is not None,
        "chromadb_ready": chroma_client is not None
    }

# 文本向量化
@app.post("/api/ai/embed-text", response_model=TextEmbeddingResponse)
async def embed_text(request: TextEmbeddingRequest):
    """文本向量化服务"""
    try:
        if not embedding_model:
            raise HTTPException(status_code=503, detail="嵌入模型未加载")
        
        vector = embedding_model.encode(request.text)
        
        return TextEmbeddingResponse(
            vector=vector.tolist(),
            dimension=len(vector)
        )
    except Exception as e:
        logger.error(f"文本向量化失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 寻找相似用户
@app.post("/api/ai/find-similar-users", response_model=SimilarityResponse)
async def find_similar_users(request: SimilarityRequest):
    """寻找相似用户"""
    try:
        if not user_interests_collection:
            raise HTTPException(status_code=503, detail="用户兴趣集合未初始化")
        
        # 使用 ChromaDB 搜索相似用户
        results = user_interests_collection.query(
            query_embeddings=[request.seed_vector],
            n_results=request.limit
        )
        
        similar_users = []
        for i, (user_id, distance) in enumerate(zip(results['ids'][0], results['distances'][0])):
            if distance < (1 - request.min_similarity):  # 转换距离为相似度
                similar_users.append({
                    "id": user_id,
                    "similarity": 1 - distance,
                    "metadata": results['metadatas'][0][i] if results['metadatas'] else {}
                })
        
        return SimilarityResponse(similar_users=similar_users)
    except Exception as e:
        logger.error(f"寻找相似用户失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 内容分析
@app.post("/api/ai/analyze-content", response_model=ContentAnalysisResponse)
async def analyze_content(request: ContentAnalysisRequest):
    """分析内容特征"""
    try:
        content = request.content
        
        # 简单的情感分析（实际应该使用更复杂的模型）
        positive_words = ['好', '棒', '喜欢', '爱', '开心', '快乐', '美丽', '优秀']
        negative_words = ['坏', '差', '讨厌', '恨', '难过', '痛苦', '丑陋', '糟糕']
        
        positive_count = sum(1 for word in positive_words if word in content)
        negative_count = sum(1 for word in negative_words if word in content)
        
        if positive_count > negative_count:
            sentiment = 'positive'
        elif negative_count > positive_count:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        # 简单的话题提取
        topics = []
        topic_keywords = {
            '生活': ['生活', '日常', '今天', '昨天', '明天'],
            '科技': ['科技', '技术', 'AI', '人工智能', '编程'],
            '艺术': ['艺术', '音乐', '绘画', '创作', '设计'],
            '旅行': ['旅行', '旅游', '风景', '景点', '度假'],
            '美食': ['美食', '食物', '餐厅', '烹饪', '味道']
        }
        
        for topic, keywords in topic_keywords.items():
            if any(keyword in content for keyword in keywords):
                topics.append(topic)
        
        # 关键词提取（简单版本）
        keywords = [word for word in content.split() if len(word) > 1][:5]
        
        # 可读性评分（简单版本）
        readability = min(100, max(0, 100 - len(content) * 0.1))
        
        # 参与度潜力（基于内容长度和情感）
        engagement_potential = min(100, max(0, 
            readability * 0.5 + 
            (positive_count * 10) + 
            (len(topics) * 15)
        ))
        
        return ContentAnalysisResponse(
            sentiment=sentiment,
            topics=topics,
            keywords=keywords,
            readability=readability,
            engagement_potential=engagement_potential
        )
    except Exception as e:
        logger.error(f"内容分析失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 提取光谱标签
@app.post("/api/ai/extract-tags")
async def extract_tags(request: ContentAnalysisRequest):
    """提取光谱标签"""
    try:
        content = request.content
        
        # 基于内容分析提取标签
        analysis = await analyze_content(request)
        
        # 组合话题和关键词作为标签
        tags = analysis.topics + analysis.keywords[:3]
        
        # 去重并限制数量
        tags = list(set(tags))[:5]
        
        return {"tags": tags}
    except Exception as e:
        logger.error(f"标签提取失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 优化传播路径
@app.post("/api/ai/optimize-propagation", response_model=PropagationResponse)
async def optimize_propagation(request: PropagationRequest):
    """优化传播路径"""
    try:
        star_seed = request.star_seed
        target_users = request.target_users
        
        # 简单的传播路径优化算法
        optimal_path = {
            "seed_id": star_seed.get("id", "unknown"),
            "first_targets": target_users[:5],  # 前5个目标用户
            "propagation_sequence": [],
            "estimated_reach": len(target_users),
            "confidence": 0.8
        }
        
        # 生成传播序列
        for i, user in enumerate(target_users[:10]):
            optimal_path["propagation_sequence"].append({
                "user_id": user.get("id", f"user_{i}"),
                "timestamp": f"2025-01-13T{10+i:02d}:00:00Z",
                "expected_resonance": 80 - i * 5,
                "geographic_weight": 0.6,
                "semantic_weight": 0.4
            })
        
        return PropagationResponse(optimal_path=optimal_path)
    except Exception as e:
        logger.error(f"传播路径优化失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 预测传播潜力
@app.post("/api/ai/predict-potential")
async def predict_potential(request: Dict[str, Any]):
    """预测传播潜力"""
    try:
        star_seed = request.get("star_seed", {})
        content = star_seed.get("content", "")
        
        # 基于内容分析预测潜力
        analysis_request = ContentAnalysisRequest(content=content)
        analysis = await analyze_content(analysis_request)
        
        # 计算潜力得分
        potential_score = min(100, max(0,
            analysis.engagement_potential * 0.6 +
            analysis.readability * 0.3 +
            len(analysis.topics) * 5
        ))
        
        return {"potential_score": potential_score}
    except Exception as e:
        logger.error(f"传播潜力预测失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 向量数据库操作
@app.post("/api/vector/user-interests")
async def add_user_interest_vector(user_id: str, vector: List[float]):
    """添加用户兴趣向量"""
    try:
        if not user_interests_collection:
            raise HTTPException(status_code=503, detail="用户兴趣集合未初始化")
        
        user_interests_collection.add(
            ids=[user_id],
            embeddings=[vector],
            metadatas=[{"user_id": user_id, "created_at": "2025-01-13T00:00:00Z"}]
        )
        
        return {"status": "success", "message": "用户兴趣向量添加成功"}
    except Exception as e:
        logger.error(f"添加用户兴趣向量失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/vector/content-similarity")
async def add_content_vector(content_id: str, vector: List[float]):
    """添加内容向量"""
    try:
        if not content_similarity_collection:
            raise HTTPException(status_code=503, detail="内容相似度集合未初始化")
        
        content_similarity_collection.add(
            ids=[content_id],
            embeddings=[vector],
            metadatas=[{"content_id": content_id, "created_at": "2025-01-13T00:00:00Z"}]
        )
        
        return {"status": "success", "message": "内容向量添加成功"}
    except Exception as e:
        logger.error(f"添加内容向量失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/vector/cluster-compatibility")
async def add_cluster_vector(cluster_id: str, vector: List[float]):
    """添加星团向量"""
    try:
        if not cluster_compatibility_collection:
            raise HTTPException(status_code=503, detail="星团兼容性集合未初始化")
        
        cluster_compatibility_collection.add(
            ids=[cluster_id],
            embeddings=[vector],
            metadatas=[{"cluster_id": cluster_id, "created_at": "2025-01-13T00:00:00Z"}]
        )
        
        return {"status": "success", "message": "星团向量添加成功"}
    except Exception as e:
        logger.error(f"添加星团向量失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
