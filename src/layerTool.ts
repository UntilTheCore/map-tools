/**
 * 设置 source 的 id 名
 * @param prefix - 前缀
 * @param name - 名称
 * @return {string}
 */
export function setSourceIdName(prefix: string, name = '') {
  return `${prefix}-${name}-source`;
}

/**
 * 设置 layer 的 id 名
 * @param prefix
 * @param name
 * @return {string}
 */
export function setLayerIdName(prefix: string, name = '') {
  return `${prefix}-${name}-layer`;
}
