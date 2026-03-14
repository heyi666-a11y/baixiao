/**
 * AI 助手组件（网页版）
 * 基于小程序版本转换，支持悬浮球和对话窗口
 */
class AIAssistant {
  constructor(options = {}) {
    this.options = {
      apiKey: options.apiKey || '702cce54fab44c0e81c28d6fe98a4c40.VcC3hpNDQeY8yiCa',
      apiUrl: options.apiUrl || 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      model: options.model || 'glm-4-flash',
      position: options.position || 'bottom-right',
      ...options
    };

    this.state = {
      isDragging: false,
      isChatOpen: false,
      inputValue: '',
      messages: [],
      isLoading: false,
      showQuickQuestions: true
    };

    this.ballPosition = { x: 0, y: 0 };
    this.chatPosition = { x: 0, y: 0 };
    this.dragStart = { x: 0, y: 0 };
    this.ballStart = { x: 0, y: 0 };

    this.quickQuestions = [
      '如何借书？',
      '饭堂几点开？',
      '如何查看成绩？',
      '图书馆开放时间？',
      '如何预约教室？',
      '怎么上传资源？',
      '联考怎么参加？'
    ];

    this.container = null;
    this.init();
  }

  /**
   * 获取系统角色设定
   */
  getSystemRole() {
    return {
      role: 'system',
      content: `你是百校一体化系统的智能助手，专门回答与百校一体化系统相关的问题。

【系统介绍】
百校一体化系统是专为学校打造的综合性管理平台，包含以下功能模块：

1. 图书馆管理：图书借阅、归还、查询、预约等功能
   - 支持AI ISBN识别自动填充图书信息
   - 图书分类管理（试卷、教案、课件、其他）

2. 饭堂预点餐系统：
   - 在线点餐、菜单查看
   - 订单管理、取餐时间选择
   - 后台菜单管理功能

3. 财务系统：
   - 收支记录、财务报表、预算管理
   - 密码保护（默认密码：888888）
   - AI智慧财报分析功能

4. 教师系统：
   - 教师信息管理、课程安排、考勤记录
   - 密码保护（默认密码：123）
   - 姓氏头像显示
   - 学生请假审批功能

5. 学生系统：
   - 学生信息管理、成绩查询、课程表
   - 密码保护（默认密码：123）
   - 请假申请功能

6. 学校管理后台：
   - 管理员登录（账号：admin，密码：admin123）
   - 教师数据管理（增删改查）
   - 学生数据管理（增删改查）
   - 饭堂系统管理（菜单、订单）

7. 联考管理：统一命题、联合考试、成绩排名

8. 资源共享：试卷、教案、课件等教学资源共享平台

9. AI助手：智能问答服务，全局悬浮显示

【各模块使用方法】

财务系统：
- 进入方式：首页或系统页面点击"财务系统"
- 首次进入需要输入密码：888888
- 功能：记录收支、查看报表、AI财报分析

学校管理后台：
- 进入方式：首页点击"学校管理"
- 登录账号：admin，密码：admin123
- 功能：管理教师、学生、饭堂数据

学生系统：
- 进入方式：首页或系统页面点击"学生系统"
- 查看学生详情需要输入密码：123
- 功能：查看信息、成绩、提交请假申请

教师系统：
- 进入方式：首页或系统页面点击"教师系统"
- 查看教师详情需要输入密码：123
- 功能：查看信息、课表、审批学生请假

饭堂系统：
- 进入方式：首页或系统页面点击"饭堂预点餐"
- 功能：浏览菜单、添加购物车、提交订单
- 后台管理：学校管理后台的饭堂管理模块

【你的职责】
1. 帮助用户解决在使用百校一体化系统过程中遇到的各种问题
2. 提供各功能模块的使用方法和操作指南
3. 回答用户关于系统的功能咨询
4. 告知用户各系统的默认密码
5. 用友好、专业的语气回答用户的问题

【回答规范】
1. 如果用户问的是与系统相关的问题，请详细解答
2. 如果用户问的是与系统无关的问题，请礼貌地引导用户询问与百校一体化系统相关的问题
3. 对于不清楚的问题，请诚实告知并建议用户联系管理员
4. 保持回答简洁明了，避免过于冗长
5. 主动提供相关的密码信息（如用户询问如何进入财务系统，告知密码是888888）

【联系方式】
系统开发者：何逸
联系电话：19388112925`
    };
  }

  /**
   * 初始化组件
   */
  init() {
    if (typeof document === 'undefined') return;

    this.loadHistory();
    this.createStyles();
    this.render();
    this.initPosition();
    this.bindEvents();
  }

  /**
   * 创建样式
   */
  createStyles() {
    if (document.getElementById('ai-assistant-styles')) return;

    const style = document.createElement('style');
    style.id = 'ai-assistant-styles';
    style.textContent = `
      .ai-assistant-container {
        position: fixed;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      /* 悬浮球 */
      .ai-float-ball {
        position: fixed;
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        transition: transform 0.2s, box-shadow 0.2s;
        user-select: none;
        z-index: 10000;
      }

      .ai-float-ball:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
      }

      .ai-float-ball.dragging {
        cursor: grabbing;
        transform: scale(1.05);
      }

      .ai-ball-icon {
        font-size: 28px;
        line-height: 1;
      }

      /* 对话窗口 */
      .ai-chat-window {
        position: fixed;
        width: 380px;
        height: 520px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        opacity: 0;
        visibility: hidden;
        transform: scale(0.9);
        transition: all 0.3s ease;
        z-index: 10001;
      }

      .ai-chat-window.show {
        opacity: 1;
        visibility: visible;
        transform: scale(1);
      }

      /* 窗口头部 */
      .ai-chat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        cursor: move;
        user-select: none;
      }

      .ai-chat-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
      }

      .ai-chat-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .ai-clear-btn, .ai-close-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 14px;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.2s;
      }

      .ai-clear-btn:hover, .ai-close-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .ai-close-btn {
        font-size: 20px;
        line-height: 1;
        padding: 4px;
      }

      /* 快捷问题 */
      .ai-quick-questions {
        padding: 16px;
        background: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
      }

      .ai-quick-title {
        font-size: 13px;
        color: #6c757d;
        margin-bottom: 10px;
        display: block;
      }

      .ai-quick-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .ai-quick-item {
        padding: 6px 12px;
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 16px;
        font-size: 13px;
        color: #495057;
        cursor: pointer;
        transition: all 0.2s;
      }

      .ai-quick-item:hover {
        background: #667eea;
        color: white;
        border-color: #667eea;
      }

      /* 消息列表 */
      .ai-message-list {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #f8f9fa;
      }

      .ai-message-item {
        display: flex;
        gap: 10px;
        margin-bottom: 16px;
        animation: ai-fade-in 0.3s ease;
      }

      @keyframes ai-fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .ai-message-item.user {
        flex-direction: row-reverse;
      }

      .ai-message-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .ai-message-item.user .ai-message-avatar {
        background: #667eea;
      }

      .ai-message-content {
        max-width: 70%;
        padding: 12px 16px;
        border-radius: 12px;
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }

      .ai-message-item.user .ai-message-content {
        background: #667eea;
        color: white;
      }

      .ai-message-text {
        font-size: 14px;
        line-height: 1.6;
        word-break: break-word;
        white-space: pre-wrap;
      }

      .ai-message-time {
        font-size: 11px;
        color: #adb5bd;
        margin-top: 6px;
        display: block;
      }

      .ai-message-item.user .ai-message-time {
        color: rgba(255,255,255,0.7);
      }

      /* 加载动画 */
      .ai-loading-dots {
        display: flex;
        gap: 4px;
        padding: 8px 0;
      }

      .ai-loading-dots span {
        width: 8px;
        height: 8px;
        background: #adb5bd;
        border-radius: 50%;
        animation: ai-bounce 1.4s ease-in-out infinite both;
      }

      .ai-loading-dots span:nth-child(1) { animation-delay: -0.32s; }
      .ai-loading-dots span:nth-child(2) { animation-delay: -0.16s; }

      @keyframes ai-bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }

      /* 输入区域 */
      .ai-input-area {
        display: flex;
        gap: 10px;
        padding: 12px 16px;
        background: white;
        border-top: 1px solid #e9ecef;
      }

      .ai-message-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #dee2e6;
        border-radius: 20px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
      }

      .ai-message-input:focus {
        border-color: #667eea;
      }

      .ai-send-btn {
        padding: 10px 20px;
        background: #e9ecef;
        color: #6c757d;
        border: none;
        border-radius: 20px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .ai-send-btn.active {
        background: #667eea;
        color: white;
      }

      .ai-send-btn:hover.active {
        background: #5a6fd6;
      }

      /* 滚动条样式 */
      .ai-message-list::-webkit-scrollbar {
        width: 6px;
      }

      .ai-message-list::-webkit-scrollbar-track {
        background: transparent;
      }

      .ai-message-list::-webkit-scrollbar-thumb {
        background: #ced4da;
        border-radius: 3px;
      }

      .ai-message-list::-webkit-scrollbar-thumb:hover {
        background: #adb5bd;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * 渲染组件
   */
  render() {
    // 悬浮球
    this.floatBall = document.createElement('div');
    this.floatBall.className = 'ai-float-ball';
    this.floatBall.innerHTML = '<span class="ai-ball-icon">🤖</span>';

    // 对话窗口
    this.chatWindow = document.createElement('div');
    this.chatWindow.className = 'ai-chat-window';
    this.chatWindow.innerHTML = `
      <div class="ai-chat-header">
        <h3 class="ai-chat-title">百校联盟助手</h3>
        <div class="ai-chat-actions">
          <button class="ai-clear-btn">清空</button>
          <button class="ai-close-btn">×</button>
        </div>
      </div>
      <div class="ai-quick-questions">
        <span class="ai-quick-title">常见问题</span>
        <div class="ai-quick-list">
          ${this.quickQuestions.map(q => `<span class="ai-quick-item">${q}</span>`).join('')}
        </div>
      </div>
      <div class="ai-message-list"></div>
      <div class="ai-input-area">
        <input type="text" class="ai-message-input" placeholder="请输入您的问题...">
        <button class="ai-send-btn">发送</button>
      </div>
    `;

    // 添加到 body
    document.body.appendChild(this.floatBall);
    document.body.appendChild(this.chatWindow);

    // 缓存元素引用
    this.messageList = this.chatWindow.querySelector('.ai-message-list');
    this.messageInput = this.chatWindow.querySelector('.ai-message-input');
    this.sendBtn = this.chatWindow.querySelector('.ai-send-btn');
    this.quickQuestionsEl = this.chatWindow.querySelector('.ai-quick-questions');
    this.clearBtn = this.chatWindow.querySelector('.ai-clear-btn');
    this.closeBtn = this.chatWindow.querySelector('.ai-close-btn');
    this.chatHeader = this.chatWindow.querySelector('.ai-chat-header');
  }

  /**
   * 初始化位置
   */
  initPosition() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // 悬浮球初始位置（右下角）
    this.ballPosition = {
      x: screenWidth - 76,
      y: screenHeight - 100
    };

    // 对话窗口初始位置
    this.chatPosition = {
      x: screenWidth - 400,
      y: screenHeight - 560
    };

    this.updatePositions();
  }

  /**
   * 更新位置
   */
  updatePositions() {
    this.floatBall.style.left = this.ballPosition.x + 'px';
    this.floatBall.style.top = this.ballPosition.y + 'px';
    this.chatWindow.style.left = this.chatPosition.x + 'px';
    this.chatWindow.style.top = this.chatPosition.y + 'px';
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 悬浮球拖动
    this.floatBall.addEventListener('mousedown', this.onBallMouseDown.bind(this));
    document.addEventListener('mousemove', this.onBallMouseMove.bind(this));
    document.addEventListener('mouseup', this.onBallMouseUp.bind(this));

    // 悬浮球点击
    this.floatBall.addEventListener('click', this.onBallClick.bind(this));

    // 窗口头部拖动
    this.chatHeader.addEventListener('mousedown', this.onHeaderMouseDown.bind(this));

    // 关闭按钮
    this.closeBtn.addEventListener('click', this.closeChat.bind(this));

    // 清空按钮
    this.clearBtn.addEventListener('click', this.clearHistory.bind(this));

    // 快捷问题
    this.chatWindow.querySelectorAll('.ai-quick-item').forEach(item => {
      item.addEventListener('click', () => {
        this.messageInput.value = item.textContent;
        this.onInputChange();
        this.sendMessage();
      });
    });

    // 输入框
    this.messageInput.addEventListener('input', this.onInputChange.bind(this));
    this.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // 发送按钮
    this.sendBtn.addEventListener('click', this.sendMessage.bind(this));

    // 窗口大小改变
    window.addEventListener('resize', () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // 确保悬浮球在屏幕内
      this.ballPosition.x = Math.min(this.ballPosition.x, screenWidth - 76);
      this.ballPosition.y = Math.min(this.ballPosition.y, screenHeight - 76);

      // 确保对话窗口在屏幕内
      this.chatPosition.x = Math.min(this.chatPosition.x, screenWidth - 380);
      this.chatPosition.y = Math.min(this.chatPosition.y, screenHeight - 520);

      this.updatePositions();
    });
  }

  /**
   * 悬浮球鼠标按下
   */
  onBallMouseDown(e) {
    this.state.isDragging = false;
    this.dragStart.x = e.clientX;
    this.dragStart.y = e.clientY;
    this.ballStart.x = this.ballPosition.x;
    this.ballStart.y = this.ballPosition.y;
    this.isMouseDown = true;
  }

  /**
   * 悬浮球鼠标移动
   */
  onBallMouseMove(e) {
    if (!this.isMouseDown) return;

    const deltaX = e.clientX - this.dragStart.x;
    const deltaY = e.clientY - this.dragStart.y;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      this.state.isDragging = true;
      this.floatBall.classList.add('dragging');
    }

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let newX = this.ballStart.x + deltaX;
    let newY = this.ballStart.y + deltaY;

    newX = Math.max(0, Math.min(newX, screenWidth - 56));
    newY = Math.max(0, Math.min(newY, screenHeight - 56));

    this.ballPosition.x = newX;
    this.ballPosition.y = newY;
    this.floatBall.style.left = newX + 'px';
    this.floatBall.style.top = newY + 'px';
  }

  /**
   * 悬浮球鼠标松开
   */
  onBallMouseUp() {
    this.isMouseDown = false;
    this.floatBall.classList.remove('dragging');
    setTimeout(() => {
      this.state.isDragging = false;
    }, 100);
  }

  /**
   * 悬浮球点击
   */
  onBallClick() {
    if (this.state.isDragging) return;
    this.toggleChat();
  }

  /**
   * 窗口头部鼠标按下
   */
  onHeaderMouseDown(e) {
    this.headerDragStart = {
      x: e.clientX,
      y: e.clientY
    };
    this.chatStart = {
      x: this.chatPosition.x,
      y: this.chatPosition.y
    };

    const onMouseMove = (e) => {
      const deltaX = e.clientX - this.headerDragStart.x;
      const deltaY = e.clientY - this.headerDragStart.y;

      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      let newX = this.chatStart.x + deltaX;
      let newY = this.chatStart.y + deltaY;

      newX = Math.max(0, Math.min(newX, screenWidth - 380));
      newY = Math.max(0, Math.min(newY, screenHeight - 520));

      this.chatPosition.x = newX;
      this.chatPosition.y = newY;
      this.chatWindow.style.left = newX + 'px';
      this.chatWindow.style.top = newY + 'px';
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  /**
   * 切换对话窗口
   */
  toggleChat() {
    this.state.isChatOpen = !this.state.isChatOpen;
    this.chatWindow.classList.toggle('show', this.state.isChatOpen);

    if (this.state.isChatOpen) {
      this.scrollToBottom();
      setTimeout(() => this.messageInput.focus(), 100);
    }
  }

  /**
   * 关闭对话窗口
   */
  closeChat() {
    this.state.isChatOpen = false;
    this.chatWindow.classList.remove('show');
  }

  /**
   * 输入框变化
   */
  onInputChange() {
    this.state.inputValue = this.messageInput.value.trim();
    this.sendBtn.classList.toggle('active', this.state.inputValue.length > 0);
  }

  /**
   * 发送消息
   */
  sendMessage() {
    const content = this.state.inputValue;
    if (!content || this.state.isLoading) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const userMessage = {
      role: 'user',
      content,
      time: timeStr
    };

    this.state.messages.push(userMessage);
    this.messageInput.value = '';
    this.onInputChange();
    this.state.showQuickQuestions = false;
    this.quickQuestionsEl.style.display = 'none';

    this.saveHistory();
    this.renderMessages();
    this.scrollToBottom();

    this.callAI();
  }

  /**
   * 调用 AI 接口
   */
  async callAI() {
    this.state.isLoading = true;
    this.renderMessages();
    this.scrollToBottom();

    try {
      const requestMessages = [
        this.getSystemRole(),
        ...this.state.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      const response = await fetch(this.options.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.options.apiKey}`
        },
        body: JSON.stringify({
          model: this.options.model,
          messages: requestMessages,
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error('AI 请求失败');
      }

      const data = await response.json();

      if (data.choices && data.choices[0]) {
        const aiResponse = data.choices[0].message.content;
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const assistantMessage = {
          role: 'assistant',
          content: aiResponse,
          time: timeStr
        };

        this.state.messages.push(assistantMessage);
        this.saveHistory();
        this.renderMessages();
        this.scrollToBottom();
      } else {
        throw new Error('AI 响应异常');
      }
    } catch (error) {
      console.error('AI 请求失败:', error);
      this.handleError('网络请求失败，请检查网络连接');
    } finally {
      this.state.isLoading = false;
      this.renderMessages();
    }
  }

  /**
   * 处理错误
   */
  handleError(errorMsg) {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const errorMessage = {
      role: 'assistant',
      content: `抱歉，${errorMsg}。请稍后重试。`,
      time: timeStr
    };

    this.state.messages.push(errorMessage);
    this.saveHistory();
    this.renderMessages();
    this.scrollToBottom();
  }

  /**
   * 渲染消息列表
   */
  renderMessages() {
    let html = '';

    this.state.messages.forEach((msg, index) => {
      const isUser = msg.role === 'user';
      html += `
        <div class="ai-message-item ${isUser ? 'user' : ''}">
          <div class="ai-message-avatar">${isUser ? '👤' : '🤖'}</div>
          <div class="ai-message-content">
            <div class="ai-message-text">${this.escapeHtml(msg.content)}</div>
            <span class="ai-message-time">${msg.time}</span>
          </div>
        </div>
      `;
    });

    if (this.state.isLoading) {
      html += `
        <div class="ai-message-item">
          <div class="ai-message-avatar">🤖</div>
          <div class="ai-message-content">
            <div class="ai-loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      `;
    }

    this.messageList.innerHTML = html;
  }

  /**
   * HTML 转义
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 滚动到底部
   */
  scrollToBottom() {
    setTimeout(() => {
      this.messageList.scrollTop = this.messageList.scrollHeight;
    }, 100);
  }

  /**
   * 加载历史记录
   */
  loadHistory() {
    try {
      const history = localStorage.getItem('ai_assistant_history');
      if (history) {
        this.state.messages = JSON.parse(history);
        if (this.state.messages.length > 0) {
          this.state.showQuickQuestions = false;
        }
      }
    } catch (e) {
      console.log('加载历史记录失败', e);
    }
  }

  /**
   * 保存历史记录
   */
  saveHistory() {
    try {
      localStorage.setItem('ai_assistant_history', JSON.stringify(this.state.messages));
    } catch (e) {
      console.log('保存历史记录失败', e);
    }
  }

  /**
   * 清空历史记录
   */
  clearHistory() {
    if (this.state.messages.length === 0) return;

    if (confirm('确定要清空所有对话记录吗？')) {
      this.state.messages = [];
      this.state.showQuickQuestions = true;
      this.quickQuestionsEl.style.display = 'block';
      this.saveHistory();
      this.renderMessages();
    }
  }

  /**
   * 销毁组件
   */
  destroy() {
    if (this.floatBall) this.floatBall.remove();
    if (this.chatWindow) this.chatWindow.remove();
    const style = document.getElementById('ai-assistant-styles');
    if (style) style.remove();
  }
}

// 创建默认实例
let defaultAssistant = null;

/**
 * 初始化 AI 助手
 * @param {Object} options - 配置选项
 * @returns {AIAssistant} AI 助手实例
 */
function initAIAssistant(options = {}) {
  if (defaultAssistant) {
    defaultAssistant.destroy();
  }
  defaultAssistant = new AIAssistant(options);
  return defaultAssistant;
}

/**
 * 获取 AI 助手实例
 * @returns {AIAssistant} AI 助手实例
 */
function getAIAssistant() {
  return defaultAssistant;
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIAssistant, initAIAssistant, getAIAssistant };
}

if (typeof window !== 'undefined') {
  window.AIAssistant = AIAssistant;
  window.initAIAssistant = initAIAssistant;
  window.getAIAssistant = getAIAssistant;

  // 页面加载完成后自动初始化 AI 助手
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // 检查页面中是否有 ai-assistant 标签或需要初始化 AI 助手
      const aiElement = document.querySelector('ai-assistant');
      if (aiElement && !window.aiAssistantInitialized) {
        window.aiAssistantInitialized = true;
        initAIAssistant();
      }
    });
  } else {
    // DOM 已经加载完成
    const aiElement = document.querySelector('ai-assistant');
    if (aiElement && !window.aiAssistantInitialized) {
      window.aiAssistantInitialized = true;
      initAIAssistant();
    }
  }
}
