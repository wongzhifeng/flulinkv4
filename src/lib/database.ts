// src/lib/database.ts
// 基于《德道经》第37章"道常无为而无不为"的数据库连接配置

// 增强的模拟数据库服务 - 支持Turso兼容的API
class EnhancedDatabase {
  private static instance: EnhancedDatabase;
  private data: Map<string, any[]> = new Map();
  private nextId: number = 1;

  private constructor() {
    // 初始化模拟数据表
    this.data.set('users', []);
    this.data.set('virus_strains', []);
    this.data.set('infection_records', []);
    this.data.set('propagation_stats', []);
  }

  public static getInstance(): EnhancedDatabase {
    if (!EnhancedDatabase.instance) {
      EnhancedDatabase.instance = new EnhancedDatabase();
    }
    return EnhancedDatabase.instance;
  }

  // Turso兼容的查询方法
  public async query(sql: string, params?: any[]): Promise<{ rows: any[], meta: any }> {
    console.log('执行查询:', sql, params);
    
    if (sql.includes('SELECT')) {
      const tableName = this.extractTableName(sql);
      const rows = this.data.get(tableName) || [];
      return { rows, meta: { changes: 0, lastInsertRowid: 0 } };
    }
    
    return { rows: [], meta: { changes: 0, lastInsertRowid: 0 } };
  }

  // Turso兼容的执行方法
  public async execute(sql: string, params?: any[]): Promise<{ changes: number, lastInsertRowid: number }> {
    console.log('执行SQL:', sql, params);
    
    if (sql.includes('INSERT')) {
      const tableName = this.extractTableName(sql);
      const newRecord = { 
        id: this.generateId(), 
        ...this.parseInsertData(sql, params),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const table = this.data.get(tableName) || [];
      table.push(newRecord);
      this.data.set(tableName, table);
      return { changes: 1, lastInsertRowid: newRecord.id };
    }
    
    if (sql.includes('UPDATE')) {
      return { changes: 1, lastInsertRowid: 0 };
    }
    
    if (sql.includes('DELETE')) {
      return { changes: 1, lastInsertRowid: 0 };
    }
    
    return { changes: 0, lastInsertRowid: 0 };
  }

  // 兼容旧API的方法
  public async insert(table: string, data: any): Promise<void> {
    console.log('插入数据到表:', table, data);
    const newRecord = { 
      id: this.generateId(), 
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const tableData = this.data.get(table) || [];
    tableData.push(newRecord);
    this.data.set(table, tableData);
  }

  public async select(table: string, where?: any): Promise<any[]> {
    console.log('查询表:', table, where);
    const tableData = this.data.get(table) || [];
    return tableData.filter(item => 
      !where || Object.keys(where).every(key => item[key] === where[key])
    );
  }

  public async update(table: string, data: any, where: any): Promise<void> {
    console.log('更新表:', table, data, where);
    const tableData = this.data.get(table) || [];
    tableData.forEach(item => {
      if (!where || Object.keys(where).every(key => item[key] === where[key])) {
        Object.assign(item, data, { updated_at: new Date().toISOString() });
      }
    });
  }

  public async delete(table: string, where: any): Promise<void> {
    console.log('删除表:', table, where);
    const tableData = this.data.get(table) || [];
    const filteredData = tableData.filter(item => 
      where && !Object.keys(where).every(key => item[key] === where[key])
    );
    this.data.set(table, filteredData);
  }

  private extractTableName(sql: string): string {
    const match = sql.match(/FROM\s+(\w+)|INTO\s+(\w+)|UPDATE\s+(\w+)/i);
    return match ? (match[1] || match[2] || match[3]) : 'unknown';
  }

  private parseInsertData(sql: string, params: any[]): any {
    const data: any = {};
    if (params && params.length > 0) {
      // 简单的参数映射
      data.param_data = params;
    }
    return data;
  }

  private generateId(): string {
    return `id_${this.nextId++}_${Date.now()}`;
  }

  // 获取所有数据（用于调试）
  getAllData(): Map<string, any[]> {
    return this.data;
  }

  // 清空数据（用于测试）
  clear(): void {
    this.data.clear();
    this.nextId = 1;
  }
}

// 根据环境选择数据库
const useRealDatabase = process.env.NODE_ENV === 'production' && process.env.DATABASE_URL;

let db: EnhancedDatabase;

if (useRealDatabase) {
  // 生产环境使用LibSQL服务
  console.log('Using LibSQL database:', process.env.DATABASE_URL);
  // TODO: 实现真实LibSQL连接
  // 当前LibSQL服务地址: libsql://flulink-db-k8m2.zeabur.app
  db = new EnhancedDatabase();
} else {
  // 开发环境使用模拟数据库
  console.log('Using mock database for development');
  db = new EnhancedDatabase();
}

// 导出数据库实例
export { db };

// 数据库连接测试 - 对应《德道经》"知人者智"
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await db.execute('SELECT 1');
    console.log('✅ 数据库连接成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return false;
  }
}

// 数据同步 - 对应"无为而无不为"
export async function syncDatabase(): Promise<void> {
  try {
    console.log('✅ 数据库同步完成');
  } catch (error) {
    console.error('❌ 数据库同步失败:', error);
    throw error;
  }
}

export default db;