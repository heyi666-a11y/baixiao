// Supabase 配置
const SUPABASE_URL = 'https://yzhnrtinfztdumfzuxvk.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_yebBr2U45Y5yWMUzNcaBkw_NRaAwZEM'

// 封装 Supabase API 请求
class SupabaseClient {
  constructor(url, key) {
    this.url = url
    this.key = key
    this.headers = {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    }
  }

  // GET 请求
  async get(table, options = {}) {
    const { select = '*', eq, order, limit, offset } = options
    let url = `${this.url}/rest/v1/${table}?select=${select}`
    
    if (eq) {
      url += `&${eq.column}=eq.${eq.value}`
    }
    
    if (order) {
      url += `&order=${order.column}.${order.ascending ? 'asc' : 'desc'}`
    }
    
    if (limit) {
      url += `&limit=${limit}`
    }
    
    if (offset) {
      url += `&offset=${offset}`
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      })
      
      const data = await response.json()
      
      if (response.ok) {
        return { data: data, error: null }
      } else {
        return { data: null, error: data }
      }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  // POST 请求
  async post(table, data) {
    const url = `${this.url}/rest/v1/${table}`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...this.headers,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      })
      
      const responseData = await response.json()
      
      if (response.ok) {
        return { data: responseData, error: null }
      } else {
        return { data: null, error: responseData }
      }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  // PATCH 请求
  async patch(table, data, eq) {
    let url = `${this.url}/rest/v1/${table}?${eq.column}=eq.${eq.value}`
    
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          ...this.headers,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      })
      
      const responseData = await response.json()
      
      if (response.ok) {
        return { data: responseData, error: null }
      } else {
        return { data: null, error: responseData }
      }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  // DELETE 请求
  async delete(table, eq) {
    let url = `${this.url}/rest/v1/${table}?${eq.column}=eq.${eq.value}`
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.headers
      })
      
      if (response.ok) {
        return { data: null, error: null }
      } else {
        const data = await response.json()
        return { data: null, error: data }
      }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  // RPC 调用
  async rpc(functionName, params = {}) {
    const url = `${this.url}/rest/v1/rpc/${functionName}`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(params)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        return { data: data, error: null }
      } else {
        return { data: null, error: data }
      }
    } catch (err) {
      return { data: null, error: err }
    }
  }
}

// 创建 Supabase 客户端实例
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 测试 Supabase 连接
async function testSupabaseConnection() {
  try {
    console.log('测试 Supabase 连接...');
    const result = await supabase.get('books', { limit: 1 });
    console.log('测试结果:', result);
    if (result.error) {
      console.error('Supabase 连接测试失败:', result.error);
    } else {
      console.log('Supabase 连接测试成功');
    }
  } catch (error) {
    console.error('Supabase 连接测试异常:', error);
  }
}

// 启动时测试连接
testSupabaseConnection();

// 图书馆相关 API
const libraryAPI = {
  // 获取图书列表
  getBooks: async (options = {}) => {
    try {
      console.log('开始获取图书列表，选项:', options);
      const result = await supabase.get('books', options);
      console.log('获取图书列表结果:', result);
      
      if (result.error) {
        console.error('获取图书列表错误:', result.error);
      }
      
      if (result.data) {
        console.log('获取到的图书数据:', result.data);
        // 处理图书数据，确保字段兼容
        result.data = result.data.map(book => ({
          ...book,
          available_quantity: 1, // 假设所有图书都可借
          total_quantity: 1 // 假设每本书只有一本
        }));
      } else {
        console.log('未获取到图书数据');
      }
      
      return result;
    } catch (error) {
      console.error('获取图书列表异常:', error);
      return { data: null, error };
    }
  },
  
  // 获取单本图书
  getBook: async (id) => {
    const result = await supabase.get('books', { eq: { column: 'id', value: id } });
    if (result.data && result.data.length > 0) {
      result.data[0] = {
        ...result.data[0],
        available_quantity: 1, // 假设所有图书都可借
        total_quantity: 1 // 假设每本书只有一本
      };
    }
    return result;
  },
  
  // 添加图书
  addBook: (data) => supabase.post('books', data),
  
  // 更新图书
  updateBook: (id, data) => supabase.patch('books', data, { column: 'id', value: id }),
  
  // 删除图书
  deleteBook: (id) => supabase.delete('books', { column: 'id', value: id }),
  
  // 获取读者列表
  getReaders: async (options = {}) => {
    const result = await supabase.get('readers', options);
    if (result.data) {
      // 处理读者数据，确保字段兼容
      result.data = result.data.map(reader => ({
        ...reader,
        current_books: reader.current_books || 0
      }));
    }
    return result;
  },
  
  // 获取读者详情
  getReader: async (id) => {
    const result = await supabase.get('readers', { eq: { column: 'id', value: id } });
    if (result.data && result.data.length > 0) {
      result.data[0] = {
        ...result.data[0],
        current_books: result.data[0].current_books || 0
      };
    }
    return result;
  },
  
  // 添加读者
  addReader: (data) => {
    // 只包含数据库中存在的字段
    const transformedData = {
      student_id: data.student_id,
      name: data.name,
      class_name: data.class_name || '',
      max_books: data.max_books || 5,
      current_books: data.current_books || 0
    };
    return supabase.post('readers', transformedData);
  },
  
  // 更新读者
  updateReader: (id, data) => {
    // 只包含需要更新的字段
    const transformedData = {};
    if (data.current_books !== undefined) {
      transformedData.current_books = data.current_books;
    }
    if (data.name) {
      transformedData.name = data.name;
    }
    if (data.class_name) {
      transformedData.class_name = data.class_name;
    }
    return supabase.patch('readers', transformedData, { column: 'id', value: id });
  },
  
  // 获取借阅记录
  getBorrowRecords: async (options = {}) => {
    const result = await supabase.get('borrow_records', options);
    if (result.data) {
      // 处理状态值和字段名，确保兼容
      result.data = result.data.map(record => ({
        ...record,
        reader_id: record.student_id, // 映射 student_id 到 reader_id
        status: record.status === 'return' ? 'returned' : record.status === 'borrow' ? 'borrowed' : record.status
      }));
    }
    return result;
  },
  
  // 添加借阅记录
  addBorrowRecord: (data) => {
    // 转换状态值和字段名以匹配数据库
    const transformedData = {
      student_id: data.reader_id, // 映射 reader_id 到 student_id
      book_id: data.book_id,
      borrow_date: data.borrow_date,
      due_date: data.due_date,
      status: data.status === 'borrowed' ? 'borrow' : data.status
    };
    // 只包含数据库中存在的字段
    return supabase.post('borrow_records', transformedData);
  },
  
  // 更新借阅记录（还书）
  updateBorrowRecord: (id, data) => {
    // 转换状态值以匹配数据库
    const transformedData = {
      return_date: data.return_date,
      status: data.status === 'returned' ? 'return' : data.status
    };
    // 只包含需要更新的字段
    return supabase.patch('borrow_records', transformedData, { column: 'id', value: id });
  },
  
  // 获取统计数据
  getStats: () => supabase.rpc('get_library_stats')
}

// 荣誉公示相关 API
const honorsAPI = {
  // 获取荣誉列表
  getHonors: async (options = {}) => {
    const result = await supabase.get('announcements', options);
    if (result.data) {
      // 处理数据，确保字段兼容
      result.data = result.data.map(announcement => ({
        id: announcement.id,
        title: announcement.title || '公告',
        content: announcement.content || '',
        date: announcement.created_at || new Date().toISOString(),
        type: 'honor'
      }));
    }
    return result;
  },
  
  // 获取荣誉详情
  getHonor: async (id) => {
    const result = await supabase.get('announcements', { eq: { column: 'id', value: id } });
    if (result.data && result.data.length > 0) {
      result.data[0] = {
        id: result.data[0].id,
        title: result.data[0].title || '公告',
        content: result.data[0].content || '',
        date: result.data[0].created_at || new Date().toISOString(),
        type: 'honor'
      };
    }
    return result;
  }
}

// 学校管理相关 API
const schoolsAPI = {
  // 获取学校列表
  getSchools: async (options = {}) => {
    try {
      console.log('开始获取学校列表，选项:', options);
      const result = await supabase.get('schools', options);
      console.log('获取学校列表结果:', result);
      
      if (result.error) {
        console.error('获取学校列表错误:', result.error);
      }
      
      if (result.data) {
        console.log('获取到的学校数据:', result.data);
      } else {
        console.log('未获取到学校数据');
      }
      
      return result;
    } catch (error) {
      console.error('获取学校列表异常:', error);
      return { data: null, error };
    }
  },
  
  // 获取学校详情
  getSchool: async (id) => {
    try {
      console.log('开始获取学校详情，ID:', id);
      const result = await supabase.get('schools', { eq: { column: 'id', value: id } });
      console.log('获取学校详情结果:', result);
      
      if (result.error) {
        console.error('获取学校详情错误:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('获取学校详情异常:', error);
      return { data: null, error };
    }
  }
}

// 资源共享相关 API
const sharedResourcesAPI = {
  // 获取资源列表（支持搜索、筛选）
  getResources: async (options = {}) => {
    try {
      console.log('开始获取资源列表，选项:', options);
      const { search, category, ...supabaseOptions } = options;
      
      // 构建查询选项
      let queryOptions = { ...supabaseOptions };
      
      // 如果有分类筛选
      if (category) {
        queryOptions.eq = { column: 'category', value: category };
      }
      
      const result = await supabase.get('shared_resources', queryOptions);
      console.log('获取资源列表结果:', result);
      
      if (result.error) {
        console.error('获取资源列表错误:', result.error);
      }
      
      if (result.data) {
        // 如果有搜索关键词，进行本地过滤
        if (search) {
          const searchLower = search.toLowerCase();
          result.data = result.data.filter(resource => 
            (resource.title && resource.title.toLowerCase().includes(searchLower)) ||
            (resource.description && resource.description.toLowerCase().includes(searchLower))
          );
        }
        console.log('获取到的资源数据:', result.data);
      } else {
        console.log('未获取到资源数据');
      }
      
      return result;
    } catch (error) {
      console.error('获取资源列表异常:', error);
      return { data: null, error };
    }
  },
  
  // 获取资源详情
  getResource: async (id) => {
    try {
      console.log('开始获取资源详情，ID:', id);
      const result = await supabase.get('shared_resources', { eq: { column: 'id', value: id } });
      console.log('获取资源详情结果:', result);
      
      if (result.error) {
        console.error('获取资源详情错误:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('获取资源详情异常:', error);
      return { data: null, error };
    }
  },
  
  // 增加下载次数
  incrementDownload: async (id) => {
    try {
      console.log('开始增加下载次数，资源ID:', id);
      
      // 先获取当前下载次数
      const getResult = await supabase.get('shared_resources', { 
        eq: { column: 'id', value: id },
        select: 'download_count'
      });
      
      if (getResult.error) {
        console.error('获取资源下载次数错误:', getResult.error);
        return getResult;
      }
      
      if (!getResult.data || getResult.data.length === 0) {
        console.error('资源不存在');
        return { data: null, error: { message: '资源不存在' } };
      }
      
      const currentCount = getResult.data[0].download_count || 0;
      const newCount = currentCount + 1;
      
      // 更新下载次数
      const result = await supabase.patch('shared_resources', 
        { download_count: newCount }, 
        { column: 'id', value: id }
      );
      
      console.log('增加下载次数结果:', result);
      
      if (result.error) {
        console.error('增加下载次数错误:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('增加下载次数异常:', error);
      return { data: null, error };
    }
  }
}

// 联考管理相关 API
const jointExamsAPI = {
  // 获取联考列表
  getExams: async (options = {}) => {
    try {
      console.log('开始获取联考列表，选项:', options);
      const result = await supabase.get('joint_exams', options);
      console.log('获取联考列表结果:', result);
      
      if (result.error) {
        console.error('获取联考列表错误:', result.error);
      }
      
      if (result.data) {
        console.log('获取到的联考数据:', result.data);
      } else {
        console.log('未获取到联考数据');
      }
      
      return result;
    } catch (error) {
      console.error('获取联考列表异常:', error);
      return { data: null, error };
    }
  },
  
  // 获取联考详情
  getExam: async (id) => {
    try {
      console.log('开始获取联考详情，ID:', id);
      const result = await supabase.get('joint_exams', { eq: { column: 'id', value: id } });
      console.log('获取联考详情结果:', result);
      
      if (result.error) {
        console.error('获取联考详情错误:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('获取联考详情异常:', error);
      return { data: null, error };
    }
  },
  
  // 获取排名
  getRankings: async (examId) => {
    try {
      console.log('开始获取联考排名，考试ID:', examId);
      const result = await supabase.get('exam_rankings', { 
        eq: { column: 'exam_id', value: examId },
        order: { column: 'rank', ascending: true }
      });
      console.log('获取联考排名结果:', result);
      
      if (result.error) {
        console.error('获取联考排名错误:', result.error);
      }
      
      if (result.data) {
        console.log('获取到的排名数据:', result.data);
      } else {
        console.log('未获取到排名数据');
      }
      
      return result;
    } catch (error) {
      console.error('获取联考排名异常:', error);
      return { data: null, error };
    }
  }
}

// 饭堂系统相关 API
const canteenAPI = {
  // 获取菜单
  getMenus: async (date) => {
    try {
      console.log('开始获取菜单，日期:', date);
      const options = date ? { eq: { column: 'date', value: date } } : {};
      const result = await supabase.get('canteen_menus', options);
      console.log('获取菜单结果:', result);
      
      if (result.error) {
        console.error('获取菜单错误:', result.error);
      }
      
      if (result.data) {
        console.log('获取到的菜单数据:', result.data);
      } else {
        console.log('未获取到菜单数据');
      }
      
      return result;
    } catch (error) {
      console.error('获取菜单异常:', error);
      return { data: null, error };
    }
  },
  
  // 创建订单
  createOrder: async (data) => {
    try {
      console.log('开始创建订单，数据:', data);
      
      // 构建订单数据
      const orderData = {
        user_id: data.userId,
        menu_id: data.menuId,
        quantity: data.quantity || 1,
        total_price: data.totalPrice,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      const result = await supabase.post('canteen_orders', orderData);
      console.log('创建订单结果:', result);
      
      if (result.error) {
        console.error('创建订单错误:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('创建订单异常:', error);
      return { data: null, error };
    }
  },
  
  // 获取订单列表
  getOrders: async (userId) => {
    try {
      console.log('开始获取订单列表，用户ID:', userId);
      const result = await supabase.get('canteen_orders', { 
        eq: { column: 'user_id', value: userId },
        order: { column: 'created_at', ascending: false }
      });
      console.log('获取订单列表结果:', result);
      
      if (result.error) {
        console.error('获取订单列表错误:', result.error);
      }
      
      if (result.data) {
        console.log('获取到的订单数据:', result.data);
      } else {
        console.log('未获取到订单数据');
      }
      
      return result;
    } catch (error) {
      console.error('获取订单列表异常:', error);
      return { data: null, error };
    }
  },
  
  // 取消订单
  cancelOrder: async (id) => {
    try {
      console.log('开始取消订单，ID:', id);
      const result = await supabase.patch('canteen_orders', 
        { status: 'cancelled', cancelled_at: new Date().toISOString() }, 
        { column: 'id', value: id }
      );
      console.log('取消订单结果:', result);
      
      if (result.error) {
        console.error('取消订单错误:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('取消订单异常:', error);
      return { data: null, error };
    }
  }
}

// 财务系统相关 API
const financeAPI = {
  // 获取财务记录
  getRecords: async (options = {}) => {
    try {
      console.log('开始获取财务记录，选项:', options);
      const { type, startDate, endDate, ...supabaseOptions } = options;
      
      // 构建查询选项
      let queryOptions = { ...supabaseOptions };
      
      // 如果有类型筛选
      if (type) {
        queryOptions.eq = { column: 'type', value: type };
      }
      
      const result = await supabase.get('finance_records', queryOptions);
      console.log('获取财务记录结果:', result);
      
      if (result.error) {
        console.error('获取财务记录错误:', result.error);
      }
      
      if (result.data) {
        // 如果有日期范围，进行本地过滤
        if (startDate || endDate) {
          result.data = result.data.filter(record => {
            const recordDate = new Date(record.date);
            if (startDate && recordDate < new Date(startDate)) return false;
            if (endDate && recordDate > new Date(endDate)) return false;
            return true;
          });
        }
        console.log('获取到的财务数据:', result.data);
      } else {
        console.log('未获取到财务数据');
      }
      
      return result;
    } catch (error) {
      console.error('获取财务记录异常:', error);
      return { data: null, error };
    }
  },
  
  // 添加记录
  addRecord: async (data) => {
    try {
      console.log('开始添加财务记录，数据:', data);
      
      // 构建记录数据
      const recordData = {
        type: data.type, // 'income' 或 'expense'
        amount: data.amount,
        category: data.category,
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        created_by: data.createdBy,
        created_at: new Date().toISOString()
      };
      
      const result = await supabase.post('finance_records', recordData);
      console.log('添加财务记录结果:', result);
      
      if (result.error) {
        console.error('添加财务记录错误:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('添加财务记录异常:', error);
      return { data: null, error };
    }
  }
}

// 教师系统相关 API
const teachersAPI = {
  // 获取教师列表
  getTeachers: async (options = {}) => {
    try {
      console.log('开始获取教师列表，选项:', options);
      const result = await supabase.get('teachers', options);
      console.log('获取教师列表结果:', result);
      
      if (result.error) {
        console.error('获取教师列表错误:', result.error);
      }
      
      if (result.data) {
        console.log('获取到的教师数据:', result.data);
      } else {
        console.log('未获取到教师数据');
      }
      
      return result;
    } catch (error) {
      console.error('获取教师列表异常:', error);
      return { data: null, error };
    }
  },
  
  // 获取教师详情
  getTeacher: async (id) => {
    try {
      console.log('开始获取教师详情，ID:', id);
      const result = await supabase.get('teachers', { eq: { column: 'id', value: id } });
      console.log('获取教师详情结果:', result);
      
      if (result.error) {
        console.error('获取教师详情错误:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('获取教师详情异常:', error);
      return { data: null, error };
    }
  },
  
  // 创建教师
  createTeacher: async (data) => {
    try {
      console.log('开始创建教师，数据:', data);
      const result = await supabase.post('teachers', data);
      console.log('创建教师结果:', result);
      
      if (result.error) {
        console.error('创建教师错误:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('创建教师异常:', error);
      return { data: null, error };
    }
  },
  
  // 更新教师
  updateTeacher: async (id, data) => {
    try {
      console.log('开始更新教师，ID:', id, '数据:', data);
      const result = await supabase.patch('teachers', data, { column: 'id', value: id });
      console.log('更新教师结果:', result);
      
      if (result.error) {
        console.error('更新教师错误:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('更新教师异常:', error);
      return { data: null, error };
    }
  },
  
  // 删除教师
  deleteTeacher: async (id) => {
    try {
      console.log('开始删除教师，ID:', id);
      const result = await supabase.delete('teachers', { column: 'id', value: id });
      console.log('删除教师结果:', result);
      
      if (result.error) {
        console.error('删除教师错误:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('删除教师异常:', error);
      return { data: null, error };
    }
  },
  
  // 获取课程表
  getSchedule: async (teacherId) => {
    try {
      console.log('开始获取教师课程表，教师ID:', teacherId);
      const result = await supabase.get('teacher_schedules', { 
        eq: { column: 'teacher_id', value: teacherId },
        order: { column: 'day_of_week', ascending: true }
      });
      console.log('获取教师课程表结果:', result);
      
      if (result.error) {
        console.error('获取教师课程表错误:', result.error);
      }
      
      if (result.data) {
        console.log('获取到的课程表数据:', result.data);
      } else {
        console.log('未获取到课程表数据');
      }
      
      return result;
    } catch (error) {
      console.error('获取教师课程表异常:', error);
      return { data: null, error };
    }
  }
}

// 学生系统相关 API
const studentsAPI = {
  // 获取学生列表
  getStudents: async (options = {}) => {
    try {
      console.log('开始获取学生列表，选项:', options);
      const result = await supabase.get('students', options);
      console.log('获取学生列表结果:', result);
      
      if (result.error) {
        console.error('获取学生列表错误:', result.error);
      }
      
      if (result.data) {
        console.log('获取到的学生数据:', result.data);
      } else {
        console.log('未获取到学生数据');
      }
      
      return result;
    } catch (error) {
      console.error('获取学生列表异常:', error);
      return { data: null, error };
    }
  },
  
  // 获取学生详情
  getStudent: async (id) => {
    try {
      console.log('开始获取学生详情，ID:', id);
      const result = await supabase.get('students', { eq: { column: 'id', value: id } });
      console.log('获取学生详情结果:', result);
      
      if (result.error) {
        console.error('获取学生详情错误:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('获取学生详情异常:', error);
      return { data: null, error };
    }
  },

  // 创建学生
  createStudent: async (data) => {
    try {
      console.log('开始创建学生，数据:', data);
      const result = await supabase.post('students', data);
      console.log('创建学生结果:', result);

      if (result.error) {
        console.error('创建学生错误:', result.error);
      }

      return result;
    } catch (error) {
      console.error('创建学生异常:', error);
      return { data: null, error };
    }
  },

  // 更新学生
  updateStudent: async (id, data) => {
    try {
      console.log('开始更新学生，ID:', id, '数据:', data);
      const result = await supabase.patch('students', data, { column: 'id', value: id });
      console.log('更新学生结果:', result);

      if (result.error) {
        console.error('更新学生错误:', result.error);
      }

      return result;
    } catch (error) {
      console.error('更新学生异常:', error);
      return { data: null, error };
    }
  },

  // 删除学生
  deleteStudent: async (id) => {
    try {
      console.log('开始删除学生，ID:', id);
      const result = await supabase.delete('students', { column: 'id', value: id });
      console.log('删除学生结果:', result);

      if (result.error) {
        console.error('删除学生错误:', result.error);
      }

      return result;
    } catch (error) {
      console.error('删除学生异常:', error);
      return { data: null, error };
    }
  },

  // 获取成绩
  getGrades: async (studentId) => {
    try {
      console.log('开始获取学生成绩，学生ID:', studentId);
      const result = await supabase.get('student_grades', { 
        eq: { column: 'student_id', value: studentId },
        order: { column: 'exam_date', ascending: false }
      });
      console.log('获取学生成绩结果:', result);
      
      if (result.error) {
        console.error('获取学生成绩错误:', result.error);
      }
      
      if (result.data) {
        console.log('获取到的成绩数据:', result.data);
      } else {
        console.log('未获取到成绩数据');
      }
      
      return result;
    } catch (error) {
      console.error('获取学生成绩异常:', error);
      return { data: null, error };
    }
  },
  
  // 获取课程表
  getSchedule: async (studentId) => {
    try {
      console.log('开始获取学生课程表，学生ID:', studentId);
      
      // 先获取学生信息以确定班级
      const studentResult = await supabase.get('students', { 
        eq: { column: 'id', value: studentId },
        select: 'class_id'
      });
      
      if (studentResult.error || !studentResult.data || studentResult.data.length === 0) {
        console.error('获取学生信息失败');
        return { data: null, error: { message: '获取学生信息失败' } };
      }
      
      const classId = studentResult.data[0].class_id;
      
      // 获取班级课程表
      const result = await supabase.get('class_schedules', { 
        eq: { column: 'class_id', value: classId },
        order: { column: 'day_of_week', ascending: true }
      });
      console.log('获取学生课程表结果:', result);
      
      if (result.error) {
        console.error('获取学生课程表错误:', result.error);
      }
      
      if (result.data) {
        console.log('获取到的课程表数据:', result.data);
      } else {
        console.log('未获取到课程表数据');
      }
      
      return result;
    } catch (error) {
      console.error('获取学生课程表异常:', error);
      return { data: null, error };
    }
  }
}

// 新闻相关 API
const newsAPI = {
  // 获取平台新闻（首页显示，school_id 为 NULL）
  getNews: async (options = {}) => {
    try {
      console.log('开始获取平台新闻，选项:', options);
      const { limit = 10, offset = 0 } = options;
      const result = await supabase.get('school_news', {
        eq: { column: 'is_published', value: true },
        order: { column: 'published_at', ascending: false },
        limit: limit,
        offset: offset
      });
      console.log('获取平台新闻结果:', result);
      
      if (result.error) {
        console.error('获取平台新闻错误:', result.error);
      }
      
      if (result.data) {
        console.log('获取到的新闻数据:', result.data);
      } else {
        console.log('未获取到新闻数据');
      }
      
      return result;
    } catch (error) {
      console.error('获取平台新闻异常:', error);
      return { data: null, error };
    }
  },
  
  // 获取学校新闻
  getSchoolNews: async (schoolId, options = {}) => {
    try {
      console.log('开始获取学校新闻，学校ID:', schoolId, '选项:', options);
      const { limit = 10, offset = 0 } = options;
      const result = await supabase.get('school_news', {
        eq: { column: 'school_id', value: schoolId },
        eq: { column: 'is_published', value: true },
        order: { column: 'published_at', ascending: false },
        limit: limit,
        offset: offset
      });
      console.log('获取学校新闻结果:', result);
      
      if (result.error) {
        console.error('获取学校新闻错误:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('获取学校新闻异常:', error);
      return { data: null, error };
    }
  },
  
  // 获取新闻详情
  getNewsById: async (id) => {
    try {
      console.log('开始获取新闻详情，ID:', id);
      const result = await supabase.get('school_news', { eq: { column: 'id', value: id } });
      console.log('获取新闻详情结果:', result);
      
      if (result.error) {
        console.error('获取新闻详情错误:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('获取新闻详情异常:', error);
      return { data: null, error };
    }
  }
};

// 将所有 API 挂载到 window 对象，使其全局可用
window.supabase = supabase;
window.supabaseAPI = {
  libraryAPI,
  honorsAPI,
  schoolsAPI,
  sharedResourcesAPI,
  jointExamsAPI,
  canteenAPI,
  financeAPI,
  teachersAPI,
  studentsAPI,
  newsAPI,
  SUPABASE_URL,
  SUPABASE_ANON_KEY
};

// 添加getNews方法到supabaseAPI根对象，保持与小程序版兼容
window.supabaseAPI.getNews = newsAPI.getNews;
