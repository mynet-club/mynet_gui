/**
 * 场景信息智能解析工具
 * 
 * 核心职责：
 * 1. 从节点名称智能提取地理位置信息
 * 2. 识别使用场景（家用、办公室等）
 * 3. 推断设备类型（Mac、路由器等）
 * 4. 在后端支持前提供前端解析方案
 * 
 * 使用场景：
 * - 好友节点卡片显示
 * - 节点列表次要信息
 * - 路由创建流程节点选择
 */

/**
 * 场景信息结构
 */
export interface SceneInfo {
  location?: string      // 地理位置（北京、新加坡等）
  scene?: string         // 使用场景（家用、办公室等）
  device?: string        // 设备类型（Mac、路由器等）
  raw: string           // 原始节点名称
  parsed: boolean       // 是否成功解析
}

/**
 * 预定义的地理位置关键词
 */
const LOCATION_KEYWORDS = [
  // 国内城市
  '北京', '上海', '深圳', '广州', '杭州', '成都', '重庆', '武汉', 
  '西安', '南京', '天津', '苏州', '郑州', '长沙', '东莞', '青岛',
  '沈阳', '宁波', '昆明', '合肥', '福州', '济南', '厦门', '大连',
  
  // 国际城市/地区
  '新加坡', 'Singapore', '东京', 'Tokyo', '首尔', 'Seoul',
  '香港', 'Hong Kong', 'HK', '台北', 'Taipei',
  '纽约', 'New York', 'NY', '洛杉矶', 'LA',
  '伦敦', 'London', '巴黎', 'Paris', '柏林', 'Berlin',
  '悉尼', 'Sydney', '多伦多', 'Toronto',
  
  // 地区简称
  'CN', 'US', 'JP', 'KR', 'SG', 'UK', 'DE', 'FR', 'AU', 'CA'
]

/**
 * 预定义的场景关键词
 */
const SCENE_KEYWORDS = [
  // 中文
  '家', '家用', '家里', '住宅',
  '办公室', '公司', '单位', '工作',
  '学校', '宿舍', '寝室',
  '实验室', '机房',
  
  // 英文
  'Home', 'Office', 'Work', 'School', 'Lab', 'Dorm',
  'Personal', 'Business'
]

/**
 * 预定义的设备类型关键词
 */
const DEVICE_KEYWORDS = [
  // 品牌/型号
  'Mac', 'MacBook', 'iMac', 'iPad', 'iPhone',
  'Windows', 'Win', 'PC', 'Laptop', 'Desktop',
  'Linux', 'Ubuntu', 'Debian', 'CentOS',
  'Android', 'Phone', 'Tablet',
  
  // 设备类型
  '路由器', 'Router', 'AP', 'Gateway',
  '服务器', 'Server', 'NAS',
  '树莓派', 'RaspberryPi', 'RPi', 'Pi',
  'OpenWRT', 'Padavan'
]

/**
 * 从节点名称智能解析场景信息
 * 
 * @param nodeName 节点名称
 * @returns 场景信息对象
 * 
 * @example
 * ```ts
 * parseSceneInfo('herenet北京家用Mac')
 * // => { location: '北京', scene: '家用', device: 'Mac', parsed: true }
 * 
 * parseSceneInfo('Office-Router-SG')
 * // => { location: 'Singapore', scene: 'Office', device: 'Router', parsed: true }
 * ```
 */
export function parseSceneInfo(nodeName: string): SceneInfo {
  const info: SceneInfo = {
    raw: nodeName,
    parsed: false
  }
  
  if (!nodeName) {
    return info
  }
  
  const name = nodeName.trim()
  
  // 提取地理位置
  for (const keyword of LOCATION_KEYWORDS) {
    if (name.includes(keyword)) {
      info.location = keyword
      break
    }
  }
  
  // 提取使用场景
  for (const keyword of SCENE_KEYWORDS) {
    if (name.includes(keyword)) {
      info.scene = keyword
      break
    }
  }
  
  // 提取设备类型
  for (const keyword of DEVICE_KEYWORDS) {
    if (name.includes(keyword)) {
      info.device = keyword
      break
    }
  }
  
  // 判断是否成功解析
  info.parsed = !!(info.location || info.scene || info.device)
  
  return info
}

/**
 * 格式化场景信息为显示文本
 * 
 * @param info 场景信息对象
 * @param separator 分隔符
 * @returns 格式化后的文本
 * 
 * @example
 * ```ts
 * formatSceneInfo({ location: '北京', scene: '家用', device: 'Mac' })
 * // => '北京 / 家用 / Mac'
 * ```
 */
export function formatSceneInfo(info: SceneInfo, separator: string = ' / '): string | null {
  if (!info.parsed) {
    return null
  }
  
  const parts = [info.location, info.scene, info.device].filter(Boolean)
  return parts.length > 0 ? parts.join(separator) : null
}

/**
 * 批量解析节点场景信息
 * 
 * @param nodes 节点列表
 * @param nodeNameKey 节点名称字段名
 * @returns 带场景信息的节点列表
 */
export function batchParseSceneInfo<T extends Record<string, any>>(
  nodes: T[],
  nodeNameKey: string = 'node_name'
): Array<T & { sceneInfo: SceneInfo }> {
  return nodes.map(node => ({
    ...node,
    sceneInfo: parseSceneInfo(node[nodeNameKey] || '')
  }))
}

/**
 * 获取场景信息的图标
 * 
 * @param info 场景信息对象
 * @returns Material图标名称
 */
export function getSceneIcon(info: SceneInfo): string {
  // 优先根据场景判断
  if (info.scene) {
    const scene = info.scene.toLowerCase()
    if (scene.includes('home') || scene.includes('家')) return 'home'
    if (scene.includes('office') || scene.includes('公司') || scene.includes('办公')) return 'business'
    if (scene.includes('school') || scene.includes('学校')) return 'school'
    if (scene.includes('lab') || scene.includes('实验')) return 'science'
  }
  
  // 根据设备类型判断
  if (info.device) {
    const device = info.device.toLowerCase()
    if (device.includes('mac') || device.includes('imac')) return 'computer'
    if (device.includes('phone') || device.includes('iphone')) return 'smartphone'
    if (device.includes('router') || device.includes('路由')) return 'router'
    if (device.includes('server') || device.includes('服务器')) return 'dns'
    if (device.includes('pi') || device.includes('树莓')) return 'developer_board'
  }
  
  // 根据位置判断
  if (info.location) {
    return 'place'
  }
  
  return 'location_on'
}

/**
 * 获取场景信息的颜色
 * 
 * @param info 场景信息对象
 * @returns Quasar颜色名称
 */
export function getSceneColor(info: SceneInfo): string {
  if (info.scene) {
    const scene = info.scene.toLowerCase()
    if (scene.includes('home') || scene.includes('家')) return 'amber'
    if (scene.includes('office') || scene.includes('公司')) return 'blue'
    if (scene.includes('school')) return 'purple'
  }
  
  return 'blue-grey'
}

/**
 * 检查场景信息是否完整
 * 完整的场景信息应包含：位置 + 场景 或 位置 + 设备
 * 
 * @param info 场景信息对象
 * @returns 是否完整
 */
export function isSceneInfoComplete(info: SceneInfo): boolean {
  return !!(
    (info.location && info.scene) ||
    (info.location && info.device) ||
    (info.scene && info.device)
  )
}

/**
 * 获取场景信息的完整度分数（0-100）
 * 
 * @param info 场景信息对象
 * @returns 完整度分数
 */
export function getSceneCompleteness(info: SceneInfo): number {
  let score = 0
  if (info.location) score += 33
  if (info.scene) score += 33
  if (info.device) score += 34
  return score
}
