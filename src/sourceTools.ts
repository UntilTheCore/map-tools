/**
 * 
 * @param data 检查数据源是否加载完成。这是一个异步函数，会在限制时间(limit)内不断查询数据源是否加载完成，如果超过限制时间，则返回false，成功则为true
 * @returns 
 */
export async function checkSourceLoaded(data: {map: minemap.Map; sourceId: string; limit?: number}): Promise<boolean> {
  data = data || {};
  const {map, sourceId, limit = 30} = data;

  let timer: any;
  let counter = 0;

  function _clearInterval() {
    if(timer) {
      clearInterval(timer);
      timer = 0;
    }
  }

  return new Promise((resolve) => {
    if(!map || !sourceId) {
      console.warn("map or sourceId is required!");
      resolve(false);
    } else {
      timer = setInterval(() => {
        const isLoaded = map.isSourceLoaded(sourceId);
        if(isLoaded) {
          _clearInterval();
          counter = 0;
          resolve(true);
        } else {
          counter++;
          if (counter === limit) {
            console.warn('map tools : checkSourceLoaded : 检查数据源加载完成超时')
            clearInterval(timer);
            resolve(false);
          }
        }
      }, 1000)
    }
  })
}