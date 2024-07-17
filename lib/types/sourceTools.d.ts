/// <reference path="minemap.d.ts" />
/**
 *
 * @param data 检查数据源是否加载完成。这是一个异步函数，会在限制时间(limit)内不断查询数据源是否加载完成，如果超过限制时间，则返回false，成功则为true
 * @returns
 */
export declare function checkSourceLoaded(data: {
    map: minemap.Map;
    sourceId: string;
    limit?: number;
}): Promise<boolean>;
