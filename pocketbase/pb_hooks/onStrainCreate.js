// FluLink PocketBase 实时钩子
// 基于《德道经》"无为而治"哲学，实现数据驱动的智能分析

// 毒株创建时触发AI分析
onRecordAfterCreateRequest((e) => {
    if (e.record.collection().name === "strains") {
        console.log("新毒株创建，触发AI分析:", e.record.id);
        
        // 异步调用AI Agent进行毒性分析
        $app.dao().runInTransaction((txDao) => {
            // 更新毒株状态为分析中
            e.record.set("status", "analyzing");
            txDao.saveRecord(e.record);
        });
        
        // 调用AI Agent API
        fetch("http://ai-agent:8000/api/analyze/toxicity", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content: e.record.get("content"),
                content_type: e.record.get("content_type"),
                user_level: "free" // 默认用户等级
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("AI分析结果:", data);
            
            // 更新毒株的AI分析结果
            $app.dao().runInTransaction((txDao) => {
                const strain = txDao.findRecordById("strains", e.record.id);
                if (strain) {
                    strain.set("toxicity_score", data.toxicity_score);
                    strain.set("spectral_tags", JSON.stringify(data.spectral_tags));
                    strain.set("status", "active");
                    strain.set("ai_generated_metadata", JSON.stringify(data.analysis_details));
                    txDao.saveRecord(strain);
                }
            });
            
            // 如果触发超级传播，进行传播预测
            if (data.super_spread_triggered) {
                console.log("检测到超级传播，开始传播预测");
                
                fetch("http://ai-agent:8000/api/predict/spread", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        strain_id: e.record.id,
                        origin_location: e.record.get("location") || {},
                        creator_level: "free",
                        toxicity_score: data.toxicity_score
                    })
                })
                .then(response => response.json())
                .then(spreadData => {
                    console.log("传播预测结果:", spreadData);
                    
                    // 更新传播路径
                    $app.dao().runInTransaction((txDao) => {
                        const strain = txDao.findRecordById("strains", e.record.id);
                        if (strain) {
                            strain.set("propagation_path", JSON.stringify(spreadData.predicted_path));
                            strain.set("current_spread_level", spreadData.geo_hierarchy_progression[0] || "community");
                            txDao.saveRecord(strain);
                        }
                    });
                })
                .catch(error => {
                    console.error("传播预测失败:", error);
                });
            }
        })
        .catch(error => {
            console.error("AI分析失败:", error);
            
            // 分析失败时设置默认值
            $app.dao().runInTransaction((txDao) => {
                const strain = txDao.findRecordById("strains", e.record.id);
                if (strain) {
                    strain.set("toxicity_score", 5.0);
                    strain.set("status", "active");
                    strain.set("ai_generated_metadata", JSON.stringify({
                        error: "AI分析失败，使用默认值",
                        timestamp: new Date().toISOString()
                    }));
                    txDao.saveRecord(strain);
                }
            });
        });
    }
});

// 感染记录创建时更新传播状态
onRecordAfterCreateRequest((e) => {
    if (e.record.collection().name === "infections") {
        console.log("新感染记录创建:", e.record.id);
        
        const strainId = e.record.get("strain");
        const geoHierarchy = e.record.get("geo_hierarchy");
        
        // 更新毒株的共鸣计数
        $app.dao().runInTransaction((txDao) => {
            const strain = txDao.findRecordById("strains", strainId);
            if (strain) {
                const currentCount = strain.get("resonance_count") || 0;
                strain.set("resonance_count", currentCount + 1);
                
                // 根据感染层级更新传播状态
                const currentLevel = strain.get("current_spread_level");
                const levelHierarchy = ["community", "neighborhood", "street", "city"];
                const currentIndex = levelHierarchy.indexOf(currentLevel);
                const newIndex = levelHierarchy.indexOf(geoHierarchy);
                
                if (newIndex > currentIndex) {
                    strain.set("current_spread_level", geoHierarchy);
                }
                
                txDao.saveRecord(strain);
            }
        });
        
        // 检查是否达到传播阈值
        $app.dao().runInTransaction((txDao) => {
            const strain = txDao.findRecordById("strains", strainId);
            if (strain) {
                const toxicityScore = strain.get("toxicity_score") || 0;
                const resonanceCount = strain.get("resonance_count") || 0;
                
                // 根据德道经规则检查传播阈值
                const thresholds = {
                    "community": 10,
                    "neighborhood": 50,
                    "street": 200,
                    "city": 1000
                };
                
                const currentLevel = strain.get("current_spread_level");
                const threshold = thresholds[currentLevel] || 10;
                
                if (resonanceCount >= threshold && toxicityScore >= 6.0) {
                    console.log(`毒株 ${strainId} 达到 ${currentLevel} 层级传播阈值`);
                    
                    // 可以在这里触发更高级别的传播逻辑
                    // 例如：通知相关用户、更新推荐算法等
                }
            }
        });
    }
});

// 用户更新时同步兴趣向量
onRecordAfterUpdateRequest((e) => {
    if (e.record.collection().name === "users") {
        console.log("用户信息更新，同步兴趣向量:", e.record.id);
        
        // 异步更新用户兴趣向量到ChromaDB
        const userData = {
            id: e.record.id,
            username: e.record.get("username"),
            user_level: e.record.get("user_level"),
            location_data: e.record.get("location_data"),
            interest_vector: e.record.get("interest_vector")
        };
        
        fetch("http://ai-agent:8000/api/embed", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content: JSON.stringify(userData),
                content_type: "user_profile"
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("用户向量更新成功:", e.record.id);
            
            // 将向量存储到ChromaDB
            fetch("http://chroma:8000/api/v1/collections/user_interests/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ids: [e.record.id],
                    embeddings: [data.vector],
                    metadatas: [{
                        user_id: e.record.id,
                        username: e.record.get("username"),
                        user_level: e.record.get("user_level"),
                        updated_at: new Date().toISOString()
                    }]
                })
            })
            .catch(error => {
                console.error("ChromaDB更新失败:", error);
            });
        })
        .catch(error => {
            console.error("用户向量生成失败:", error);
        });
    }
});

// 错误处理钩子
onRecordAfterCreateRequest((e) => {
    try {
        // 记录操作日志
        console.log(`记录创建: ${e.record.collection().name} - ${e.record.id}`);
    } catch (error) {
        console.error("钩子执行错误:", error);
    }
});

onRecordAfterUpdateRequest((e) => {
    try {
        // 记录操作日志
        console.log(`记录更新: ${e.record.collection().name} - ${e.record.id}`);
    } catch (error) {
        console.error("钩子执行错误:", error);
    }
});

onRecordAfterDeleteRequest((e) => {
    try {
        // 记录操作日志
        console.log(`记录删除: ${e.record.collection().name} - ${e.record.id}`);
    } catch (error) {
        console.error("钩子执行错误:", error);
    }
});
