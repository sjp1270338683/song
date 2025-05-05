/**
 * @name 主页store
 */
import type { StateCreator } from 'zustand';
import { zustand } from '@ali/tl-store';
import { Toast } from '@ali/tl-toolkit';
import Service from '@/utils/service';
import { Category, CommodityList, CommodityParams, ETaskStatus, GenAvatar } from '@/types';
import { LoginStatusSlice, createLoginSlice, PageStatus } from './slices/loginStatus';
import { ApiStatusSlice, createApiStatusSlice } from './slices/apiStatus';

const { createStore } = zustand;

export interface HomeSlice {
  /** 主接口数据 */
  mainData: {
    commodityList?: CommodityList[];
    categoryList?: Category[];
  };
  categorySet: Category;
  firstLevelCategory: string;
  pageNo: number;
  pageSize: number;
  hasNext: boolean;
  isFetching: boolean;
  categoryLoading: string;
  /** 商品流状态置状态 */
  setCommodityStatus: (id: string, isComplete: boolean, taskStatus: string) => void;
  /** 查询类目 */
  queryCategory: () => Promise<TLMtopResponse<Category[]>>;
  /** 查询商品 */
  queryCommodityList: (params: CommodityParams, isDefault?: boolean, isOld?: boolean) => void;
  /** 商品流状态置为默认状态 */
  setDefaultStatus: (params: CommodityParams) => void;
  /** 查询商品下一页 */
  setNextPage: (params: CommodityParams) => void;
  /** 保存类目集合，刷新商品流使用 */
  setCategorySet: (params: Category) => void;
  /** 保存一级类目 */
  setFirstLevelCategory: (params: string) => void;
  /** 生成任务 */
  queryGenAvatar: (params: { itemId: string; categgory: string }) => Promise<TLMtopResponse<GenAvatar>>;
}

export type HomeStore = ApiStatusSlice & LoginStatusSlice & HomeSlice;

const createHomeSlice: StateCreator<HomeSlice> = (set, get: () => HomeStore) => ({
  mainData: {},
  categorySet: {} as Category,
  firstLevelCategory: '',
  pageNo: 1,
  pageSize: 20,
  hasNext: true,
  isFetching: true,
  categoryLoading: PageStatus.Init,

  /**
   * 获取商品流类目
   */
  queryCategory: () => {
    set({ categoryLoading: PageStatus.Loading });

    return Service.getCategory()
      .then((res: TLMtopResponse<Category[]>) => {
        set({ categoryLoading: PageStatus.Normal });
        const data = res?.result;
        if (data?.length) {
          set((prev) => ({
            mainData: {
              ...prev.mainData,
              categoryList: data || [],
            },
          }));
        }

        return Promise.resolve(data);
      })
      .catch((err) => {
        set({ categoryLoading: PageStatus.Error });
        return Promise.resolve(err);
      });
  },

  /**
   * name: 获取商品流
   * params: 接口参数
   * isDefault: 是否置顶默认状态
   * isOld: 是否旧数据
   */
  queryCommodityList: (params: CommodityParams, isDefault = true) => {
    get().setServiceLoading();

    return Service.getCommodityList({
      ...params,
      pageNo: get().pageNo,
      pageSize: get().pageSize,
    })
      .then((res: TLMtopResponse<CommodityList[]>) => {
        get().setServiceSuccess();
        //  双列流数据
        const data = res?.result;

        if (isDefault) {
          set((prev) => ({
            mainData: {
              ...prev.mainData,
              commodityList: data || [],
            },
          }));
        } else {
          set((prev) => ({
            mainData: {
              ...prev.mainData,
              commodityList: [...(get().mainData.commodityList || []), ...data] || [],
            },
          }));
        }

        // 判断是否有下一页
        if (data && data.length <= 0) {
          set({
            hasNext: false,
          });
        }

        // 加载状态
        set({
          isFetching: false,
        });

        return Promise.resolve(data);
      })
      .catch((err) => {
        get().setServiceError();
        // 加载状态
        set({
          hasNext: false,
          isFetching: false,
        });

        return Promise.resolve(err);
      });
  },

  /**
   * 商品流状态置为默认状态
   */
  setDefaultStatus: (params: CommodityParams) => {
    set({
      pageNo: 1,
      hasNext: true,
    });
    get().queryCommodityList(params);
  },

  /**
   * 获取商品流下一页
   */
  setNextPage: (params: CommodityParams) => {
    set({
      pageNo: get().pageNo + 1,
    });
    get().queryCommodityList(params, false);
  },

  /**
   * 保存类目集合，刷新商品流使用
   */
  setCategorySet: (params: Category) => {
    set({
      categorySet: params,
    });
  },

  /**
   * 保存一级类目
   */
  setFirstLevelCategory: (params: string) => {
    set({
      firstLevelCategory: params,
    });
  },

   /**
   * name: 商品流状态置状态
   * id: 商品id
   * id: 商品id
   */
   setCommodityStatus: (id = '', isComplete = false, taskStatus = '') => {
    const commodityList = get().mainData.commodityList || [];
    if (!id || !commodityList.length) return;
    const data = commodityList?.map((item) => {
      if (item?.id === id) {
        return {
          ...item,
          taskStatus: isComplete ? taskStatus : ETaskStatus.GENERATING_2,
        };
      } else {
        return item;
      }
    });

    set((prev) => ({
      mainData: {
        ...prev.mainData,
        commodityList: data || [],
      },
    }));
  },

  /**
   * 生成任务
   */
  queryGenAvatar: (params) => {
    return Service.getGenAvatar(params)
      .then((res) => {
        const data = res?.result || {};
        set((prev) => ({
          mainData: {
            ...prev.mainData,
            genAvatar: data,
          },
        }));

        if (res?.message !== 'success') {
          Toast.show(res?.message || '生成任务失败');
        }

        return Promise.resolve(data);
      })
      .catch((err) => {
        return Promise.resolve(err);
      });
  },
});

const useHomeStore = createStore<HomeStore>('AI_STORE')((set, get, store) => ({
  ...createLoginSlice(set, get, store),
  ...createApiStatusSlice(set, get, store),
  ...createHomeSlice(set, get, store),
}));

export default useHomeStore;

    
