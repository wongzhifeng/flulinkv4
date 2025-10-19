# FluLink v4.0 AI 服务实现 - 优化版
# 基于《德道经》"无为而治"哲学，实现智能化的模型管理和降级策略

import os
import asyncio
import time
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import chromadb
import numpy as np
from typing import List, Dict, Any
import logging
from contextlib import asynccontextmanager

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 全局变量
embedding_model: Optional[SentenceTransformer] = None
chroma_client: Optional[chromadb.Client] = None
user_interests_collection: Optional[Any] = None
content_similarity_collection: Optional[Any] = None
cluster_compatibility_collection: Optional[Any] = None

# 模型状态管理
model_status = {
    "embedding_model": {
        "loaded": False,
        "loading": False,
        "load_time": None,
        "error": None
    },
    "chromadb": {
        "initialized": False,
        "initializing": False,
        "init_time": None,
        "error": None
    }
}

# 降级策略配置
FALLBACK_CONFIG = {
    "model_load_timeout": 30,  # 模型加载超时时间（秒）
    "request_timeout": 10,      # 请求处理超时时间（秒）
    "enable_fallback": True,    # 是否启用降级策略
    "fallback_vector_dim": 384  # 降级向量维度
}

# 数据模型
class TextEmbeddingRequest(BaseModel):
    text: str

class TextEmbeddingResponse(BaseModel):
    vector: List[float]
    dimension: int
    model_used: str  # 标识使用的模型（primary/fallback）

class SimilarityRequest(BaseModel):
    seed_vector: List[float]
    user_pool: List[Dict[str, Any]]
    limit: int = 10
    min_similarity: float = 0.6

class SimilarityResponse(BaseModel):
    similar_users: List[Dict[str, Any]]
    model_used: str

class ContentAnalysisRequest(BaseModel):
    content: str

class ContentAnalysisResponse(BaseModel):
    sentiment: str
    topics: List[str]
    keywords: List[str]
    readability: float
    engagement_potential: float
    model_used: str

class PropagationRequest(BaseModel):
    star_seed: Dict[str, Any]
    target_users: List[Dict[str, Any]]

class PropagationResponse(BaseModel):
    optimal_path: Dict[str, Any]
    model_used: str

# 降级向量生成器
class FallbackVectorGenerator:
    """基于规则的降级向量生成器"""
    
    @staticmethod
    def generate_fallback_vector(text: str, dimension: int = 384) -> List[float]:
        """生成降级向量"""
        # 基于文本特征的简单向量生成
        vector = np.zeros(dimension)
        
        # 基于文本长度的特征
        text_length = len(text)
        vector[0] = min(text_length / 1000, 1.0)  # 归一化长度
        
        # 基于字符频率的特征
        char_freq = {}
        for char in text.lower():
            char_freq[char] = char_freq.get(char, 0) + 1
        
        # 填充前几个维度
        for i, (char, freq) in enumerate(list(char_freq.items())[:10]):
            if i + 1 < dimension:
                vector[i + 1] = min(freq / len(text), 1.0)
        
        # 基于关键词的简单特征
        keywords = ['好', '棒', '喜欢', '爱', '开心', '快乐', '美丽', '优秀']
        for i, keyword in enumerate(keywords):
            if keyword in text and i + 11 < dimension:
                vector[i + 11] = 1.0
        
        # 添加随机噪声以增加多样性
        noise = np.random.normal(0, 0.1, dimension)
        vector = vector + noise
        
        # 归一化
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm
        
        return vector.tolist()

# 异步模型加载器
class AsyncModelLoader:
    """异步模型加载器，支持超时和降级"""
    
    @staticmethod
    async def load_embedding_model(timeout: int = 30) -> Optional[SentenceTransformer]:
        """异步加载嵌入模型"""
        try:
            logger.info("开始异步加载嵌入模型...")
            start_time = time.time()
            
            # 使用 asyncio.wait_for 实现超时
            model = await asyncio.wait_for(
                asyncio.get_event_loop().run_in_executor(
                    None, 
                    lambda: SentenceTransformer('all-MiniLM-L6-v2')
                ),
                timeout=timeout
            )
            
            load_time = time.time() - start_time
            logger.info(f"嵌入模型加载完成，耗时: {load_time:.2f}秒")
            
            return model
            
        except asyncio.TimeoutError:
            logger.error(f"嵌入模型加载超时 ({timeout}秒)")
            return None
        except Exception as e:
            logger.error(f"嵌入模型加载失败: {e}")
            return None

    @staticmethod
    async def initialize_chromadb(timeout: int = 15) -> Optional[chromadb.Client]:
        """异步初始化 ChromaDB"""
        try:
            logger.info("开始异步初始化 ChromaDB...")
            start_time = time.time()
            
            client = await asyncio.wait_for(
                asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: chromadb.Client()
                ),
                timeout=timeout
            )
            
            init_time = time.time() - start_time
            logger.info(f"ChromaDB 初始化完成，耗时: {init_time:.2f}秒")
            
            return client
            
        except asyncio.TimeoutError:
            logger.error(f"ChromaDB 初始化超时 ({timeout}秒)")
            return None
        except Exception as e:
            logger.error(f"ChromaDB 初始化失败: {e}")
            return None

# 应用生命周期管理
@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时异步加载模型
    logger.info("FluLink AI 服务启动中...")
    
    # 并行加载模型和数据库
    tasks = [
        AsyncModelLoader.load_embedding_model(FALLBACK_CONFIG["model_load_timeout"]),
        AsyncModelLoader.initialize_chromadb(15)
    ]
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # 处理加载结果
    global embedding_model, chroma_client
    global user_interests_collection, content_similarity_collection, cluster_compatibility_collection
    
    if isinstance(results[0], SentenceTransformer):
        embedding_model = results[0]
        model_status["embedding_model"]["loaded"] = True
        model_status["embedding_model"]["load_time"] = time.time()
        logger.info("✅ 嵌入模型加载成功")
    else:
        model_status["embedding_model"]["error"] = str(results[0])
        logger.warning("⚠️ 嵌入模型加载失败，将使用降级策略")
    
    if isinstance(results[1], chromadb.Client):
        chroma_client = results[1]
        model_status["chromadb"]["initialized"] = True
        model_status["chromadb"]["init_time"] = time.time()
        
        # 初始化集合
        try:
            user_interests_collection = chroma_client.get_or_create_collection("user_interests")
            content_similarity_collection = chroma_client.get_or_create_collection("content_similarity")
            cluster_compatibility_collection = chroma_client.get_or_create_collection("cluster_compatibility")
            logger.info("✅ ChromaDB 集合初始化成功")
        except Exception as e:
            logger.error(f"ChromaDB 集合初始化失败: {e}")
    else:
        model_status["chromadb"]["error"] = str(results[1])
        logger.warning("⚠️ ChromaDB 初始化失败，将使用降级策略")
    
    logger.info("FluLink AI 服务启动完成")
    
    yield
    
    # 关闭时清理资源
    logger.info("FluLink AI 服务关闭中...")
    if chroma_client:
        try:
            chroma_client.delete_collection("user_interests")
            chroma_client.delete_collection("content_similarity")
            chroma_client.delete_collection("cluster_compatibility")
        except:
            pass
    logger.info("FluLink AI 服务已关闭")

# 初始化 FastAPI 应用
app = FastAPI(
    title="FluLink AI Service",
    description="FluLink v4.0 AI 智能服务 - 优化版",
    version="4.0.0",
    lifespan=lifespan
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 健康检查
@app.get("/health")
async def health_check():
    """增强的健康检查"""
    return {
        "status": "healthy",
        "service": "FluLink AI Service",
        "version": "4.0.0",
        "model_status": model_status,
        "fallback_enabled": FALLBACK_CONFIG["enable_fallback"],
        "timestamp": time.time()
    }

# 文本向量化 - 支持降级
@app.post("/api/ai/embed-text", response_model=TextEmbeddingResponse)
async def embed_text(request: TextEmbeddingRequest):
    """文本向量化服务 - 支持降级策略"""
    try:
        # 尝试使用主模型
        if embedding_model and model_status["embedding_model"]["loaded"]:
            try:
                vector = await asyncio.wait_for(
                    asyncio.get_event_loop().run_in_executor(
                        None,
                        lambda: embedding_model.encode(request.text)
                    ),
                    timeout=FALLBACK_CONFIG["request_timeout"]
                )
                
                return TextEmbeddingResponse(
                    vector=vector.tolist(),
                    dimension=len(vector),
                    model_used="primary"
                )
            except asyncio.TimeoutError:
                logger.warning("主模型处理超时，使用降级策略")
            except Exception as e:
                logger.warning(f"主模型处理失败: {e}，使用降级策略")
        
        # 降级策略
        if FALLBACK_CONFIG["enable_fallback"]:
            logger.info("使用降级向量生成器")
            fallback_vector = FallbackVectorGenerator.generate_fallback_vector(
                request.text, 
                FALLBACK_CONFIG["fallback_vector_dim"]
            )
            
            return TextEmbeddingResponse(
                vector=fallback_vector,
                dimension=len(fallback_vector),
                model_used="fallback"
            )
        else:
            raise HTTPException(status_code=503, detail="模型未加载且降级策略未启用")
            
    except Exception as e:
        logger.error(f"文本向量化失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 寻找相似用户 - 支持降级
@app.post("/api/ai/find-similar-users", response_model=SimilarityResponse)
async def find_similar_users(request: SimilarityRequest):
    """寻找相似用户 - 支持降级策略"""
    try:
        # 尝试使用 ChromaDB
        if user_interests_collection and model_status["chromadb"]["initialized"]:
            try:
                results = await asyncio.wait_for(
                    asyncio.get_event_loop().run_in_executor(
                        None,
                        lambda: user_interests_collection.query(
                            query_embeddings=[request.seed_vector],
                            n_results=request.limit
                        )
                    ),
                    timeout=FALLBACK_CONFIG["request_timeout"]
                )
                
                similar_users = []
                for i, (user_id, distance) in enumerate(zip(results['ids'][0], results['distances'][0])):
                    if distance < (1 - request.min_similarity):
                        similar_users.append({
                            "id": user_id,
                            "similarity": 1 - distance,
                            "metadata": results['metadatas'][0][i] if results['metadatas'] else {}
                        })
                
                return SimilarityResponse(
                    similar_users=similar_users,
                    model_used="primary"
                )
            except asyncio.TimeoutError:
                logger.warning("ChromaDB 查询超时，使用降级策略")
            except Exception as e:
                logger.warning(f"ChromaDB 查询失败: {e}，使用降级策略")
        
        # 降级策略 - 基于余弦相似度的简单计算
        if FALLBACK_CONFIG["enable_fallback"]:
            logger.info("使用降级相似度计算")
            similar_users = []
            
            for user_data in request.user_pool[:request.limit]:
                if "interest_vector" in user_data and user_data["interest_vector"]:
                    # 计算余弦相似度
                    similarity = np.dot(request.seed_vector, user_data["interest_vector"]) / (
                        np.linalg.norm(request.seed_vector) * np.linalg.norm(user_data["interest_vector"])
                    )
                    
                    if similarity >= request.min_similarity:
                        similar_users.append({
                            "id": user_data.get("id", "unknown"),
                            "similarity": float(similarity),
                            "metadata": {}
                        })
            
            return SimilarityResponse(
                similar_users=similar_users,
                model_used="fallback"
            )
        else:
            raise HTTPException(status_code=503, detail="数据库未初始化且降级策略未启用")
            
    except Exception as e:
        logger.error(f"寻找相似用户失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 内容分析 - 支持降级
@app.post("/api/ai/analyze-content", response_model=ContentAnalysisResponse)
async def analyze_content(request: ContentAnalysisRequest):
    """分析内容特征 - 支持降级策略"""
    try:
        content = request.content
        
        # 简单的情感分析（降级策略）
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
            engagement_potential=engagement_potential,
            model_used="fallback"  # 当前实现都是降级策略
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
        analysis_request = ContentAnalysisRequest(content=content)
        analysis = await analyze_content(analysis_request)
        
        # 组合话题和关键词作为标签
        tags = analysis.topics + analysis.keywords[:3]
        
        # 去重并限制数量
        tags = list(set(tags))[:5]
        
        return {"tags": tags, "model_used": "fallback"}
        
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
        
        return PropagationResponse(
            optimal_path=optimal_path,
            model_used="fallback"
        )
        
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
        
        return {
            "potential_score": potential_score,
            "model_used": "fallback"
        }
        
    except Exception as e:
        logger.error(f"传播潜力预测失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 模型状态查询
@app.get("/api/ai/model-status")
async def get_model_status():
    """获取模型状态"""
    return {
        "model_status": model_status,
        "fallback_config": FALLBACK_CONFIG,
        "timestamp": time.time()
    }

# 手动重新加载模型
@app.post("/api/ai/reload-models")
async def reload_models(background_tasks: BackgroundTasks):
    """手动重新加载模型"""
    async def reload_task():
        global embedding_model, chroma_client
        global user_interests_collection, content_similarity_collection, cluster_compatibility_collection
        
        logger.info("开始重新加载模型...")
        
        # 重新加载嵌入模型
        model_status["embedding_model"]["loading"] = True
        model_status["embedding_model"]["loaded"] = False
        model_status["embedding_model"]["error"] = None
        
        new_model = await AsyncModelLoader.load_embedding_model(FALLBACK_CONFIG["model_load_timeout"])
        if new_model:
            embedding_model = new_model
            model_status["embedding_model"]["loaded"] = True
            model_status["embedding_model"]["load_time"] = time.time()
            logger.info("✅ 嵌入模型重新加载成功")
        else:
            model_status["embedding_model"]["error"] = "加载超时"
            logger.warning("⚠️ 嵌入模型重新加载失败")
        
        model_status["embedding_model"]["loading"] = False
        
        # 重新初始化 ChromaDB
        model_status["chromadb"]["initializing"] = True
        model_status["chromadb"]["initialized"] = False
        model_status["chromadb"]["error"] = None
        
        new_client = await AsyncModelLoader.initialize_chromadb(15)
        if new_client:
            chroma_client = new_client
            model_status["chromadb"]["initialized"] = True
            model_status["chromadb"]["init_time"] = time.time()
            
            # 重新初始化集合
            try:
                user_interests_collection = chroma_client.get_or_create_collection("user_interests")
                content_similarity_collection = chroma_client.get_or_create_collection("content_similarity")
                cluster_compatibility_collection = chroma_client.get_or_create_collection("cluster_compatibility")
                logger.info("✅ ChromaDB 重新初始化成功")
            except Exception as e:
                logger.error(f"ChromaDB 集合重新初始化失败: {e}")
        else:
            model_status["chromadb"]["error"] = "初始化超时"
            logger.warning("⚠️ ChromaDB 重新初始化失败")
        
        model_status["chromadb"]["initializing"] = False
        logger.info("模型重新加载完成")
    
    background_tasks.add_task(reload_task)
    return {"message": "模型重新加载任务已启动"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
