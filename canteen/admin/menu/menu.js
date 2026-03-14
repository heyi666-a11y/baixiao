// 菜单管理页
let currentDate = '';
let currentMeal = 'lunch';
let menuList = [];
let editingItem = null;
let tempImage = '';

const meals = [
  { key: 'breakfast', label: '早餐' },
  { key: 'lunch', label: '午餐' },
  { key: 'dinner', label: '晚餐' }
];

const categories = [
  { key: 'staple', label: '主食' },
  { key: 'dish', label: '菜品' },
  { key: 'soup', label: '汤品' },
  { key: 'snack', label: '小吃' },
  { key: 'drink', label: '饮品' }
];

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  setCurrentDate();
  loadMenu();
});

// 设置当前日期
function setCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  currentDate = `${year}-${month}-${day}`;
  document.getElementById('current-date').value = currentDate;
}

// 加载菜单
function loadMenu() {
  const menu = getMenu(currentDate, currentMeal);
  menuList = menu || [];
  renderMenuList();
}

// 获取菜单
function getMenu(date, meal) {
  const menus = JSON.parse(localStorage.getItem('canteen_menus') || '{}');
  return menus[`${date}_${meal}`] || [];
}

// 保存菜单
function saveMenu(date, meal, menu) {
  const menus = JSON.parse(localStorage.getItem('canteen_menus') || '{}');
  menus[`${date}_${meal}`] = menu;
  localStorage.setItem('canteen_menus', JSON.stringify(menus));
}

// 渲染菜单列表
function renderMenuList() {
  const container = document.getElementById('menu-list');
  const emptyState = document.getElementById('empty-state');
  
  if (menuList.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  container.innerHTML = menuList.map(item => `
    <div class="menu-item">
      <img class="item-image" src="${item.image || '/images/food-default.png'}" alt="${item.name}"/>
      <div class="item-info">
        <div class="item-header">
          <span class="item-name">${item.name}</span>
          <div class="item-category">${getCategoryLabel(item.category)}</div>
        </div>
        ${item.description ? `<span class="item-desc">${item.description}</span>` : ''}
        <div class="item-footer">
          <span class="item-price">¥${item.price}</span>
          <span class="item-stock">库存: ${item.stock || 99}</span>
        </div>
      </div>
      <div class="item-actions">
        <span class="action-btn edit" onclick='editItem(${JSON.stringify(item).replace(/'/g, "&#39;")})'>编辑</span>
        <span class="action-btn delete" onclick="deleteItem('${item.id}')">删除</span>
      </div>
    </div>
  `).join('');
}

// 获取分类标签
function getCategoryLabel(key) {
  const category = categories.find(c => c.key === key);
  return category ? category.label : key;
}

// 日期变更
function onDateChange(value) {
  currentDate = value;
  loadMenu();
}

// 切换餐别
function switchMeal(meal) {
  currentMeal = meal;
  
  // 更新标签样式
  document.querySelectorAll('.meal-tab').forEach(tab => {
    if (tab.dataset.meal === meal) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  loadMenu();
}

// 显示添加弹窗
function showAddModal() {
  editingItem = null;
  tempImage = '';
  document.getElementById('modal-title').textContent = '添加菜品';
  
  // 清空表单
  document.getElementById('form-name').value = '';
  document.getElementById('form-price').value = '';
  document.getElementById('form-category').value = 'staple';
  document.getElementById('form-stock').value = '99';
  document.getElementById('form-description').value = '';
  
  // 重置图片
  document.getElementById('preview-image').style.display = 'none';
  document.getElementById('upload-placeholder').style.display = 'flex';
  
  document.getElementById('add-modal').classList.add('show');
}

// 隐藏添加弹窗
function hideAddModal() {
  document.getElementById('add-modal').classList.remove('show');
  editingItem = null;
  tempImage = '';
}

// 编辑菜品
function editItem(item) {
  editingItem = item;
  tempImage = item.image || '';
  document.getElementById('modal-title').textContent = '编辑菜品';
  
  // 填充表单
  document.getElementById('form-name').value = item.name;
  document.getElementById('form-price').value = item.price;
  document.getElementById('form-category').value = item.category || 'staple';
  document.getElementById('form-stock').value = item.stock || 99;
  document.getElementById('form-description').value = item.description || '';
  
  // 设置图片
  if (item.image) {
    document.getElementById('preview-image').src = item.image;
    document.getElementById('preview-image').style.display = 'block';
    document.getElementById('upload-placeholder').style.display = 'none';
  } else {
    document.getElementById('preview-image').style.display = 'none';
    document.getElementById('upload-placeholder').style.display = 'flex';
  }
  
  document.getElementById('add-modal').classList.add('show');
}

// 删除菜品
function deleteItem(itemId) {
  if (!confirm('确定要删除这个菜品吗？')) return;
  
  menuList = menuList.filter(item => item.id !== itemId);
  saveMenu(currentDate, currentMeal, menuList);
  renderMenuList();
  
  showToast('删除成功', 'success');
}

// 选择图片
function chooseImage() {
  document.getElementById('image-input').click();
}

// 图片选择回调
function onImageSelected(input) {
  const file = input.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    tempImage = e.target.result;
    document.getElementById('preview-image').src = tempImage;
    document.getElementById('preview-image').style.display = 'block';
    document.getElementById('upload-placeholder').style.display = 'none';
  };
  reader.readAsDataURL(file);
  
  // 清空input，允许重复选择同一文件
  input.value = '';
}

// 保存菜品
function saveItem() {
  const name = document.getElementById('form-name').value.trim();
  const price = parseFloat(document.getElementById('form-price').value);
  const category = document.getElementById('form-category').value;
  const stock = parseInt(document.getElementById('form-stock').value) || 99;
  const description = document.getElementById('form-description').value.trim();
  
  if (!name) {
    showToast('请输入菜品名称', 'error');
    return;
  }
  
  if (!price || price <= 0) {
    showToast('请输入正确的价格', 'error');
    return;
  }

  const itemData = {
    name: name,
    price: price,
    category: category,
    image: tempImage || '/images/food-default.png',
    description: description,
    stock: stock
  };

  if (editingItem) {
    // 编辑模式
    const index = menuList.findIndex(item => item.id === editingItem.id);
    if (index !== -1) {
      menuList[index] = { ...editingItem, ...itemData };
    }
    showToast('修改成功', 'success');
  } else {
    // 添加模式
    const newItem = {
      id: Date.now().toString(),
      ...itemData
    };
    menuList.push(newItem);
    showToast('添加成功', 'success');
  }

  saveMenu(currentDate, currentMeal, menuList);
  renderMenuList();
  hideAddModal();
}

// 复制到明天
function copyToTomorrow() {
  if (menuList.length === 0) {
    showToast('当前没有菜品可复制', 'error');
    return;
  }

  const tomorrow = new Date(currentDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  if (!confirm(`将当前菜单复制到 ${tomorrowStr} 吗？`)) return;

  saveMenu(tomorrowStr, currentMeal, [...menuList]);
  showToast('复制成功', 'success');
}

// 显示提示
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 2000);
}
