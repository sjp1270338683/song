/**
 * @name 助力记录
 */
import { useState, useCallback, useEffect } from 'react';
import { query } from '@ali/tl-detector';
import { sceneId } from '@/common/const';
import { PageStatus } from '@/types/common';
import { isEmpty } from '@/utils/index';
import { FriendList } from '@/types/index';
import Service from '@/utils/service';

export default () => {
  const [list, setList] = useState<FriendList[]>([]);
  const [page, setPage] = useState(1);
  const [apiStatus, setStatus] = useState(PageStatus.Init);
  const [hasMore, setHasMore] = useState(true);

  const queryList = useCallback(
    async (funId, isInit?) => {
      // 查询中
      if (apiStatus === PageStatus.Fetching) return;

      // 没下一页 & 非强制加载
      if (!isInit && !hasMore) return;

      setStatus(PageStatus.Fetching);

      try {
        const res = await Service.queryInviteList({ currentPage: isInit ? 1 : page, sceneId, funId });
        // 接口正常
        const newList = res?.friendList || [];
        setHasMore(!isEmpty(newList));

        // 设置 data
        if (isInit) {
          setList(newList);
          setPage(2);
        } else {
          setList([...list, ...newList]);
          setPage((p) => p + 1);
        }

        // 设置接口状态
        if (isEmpty(list) && isEmpty(newList)) {
          setStatus(PageStatus.Empty);
        } else {
          setStatus(PageStatus.Normal);
        }
      } catch (err) {
        setStatus(PageStatus.Error);
        setHasMore(false);
      }
    },
    [hasMore, apiStatus, page, list],
  );

  // 查询下一页接口
  const loadNextPage = () => {
    queryList(query?.funId);
  };

  // 重加载接口
  const onInit = () => {
    queryList(query?.funId, true);
  };

  useEffect(() => {
    queryList(query?.funId);
  }, []);

  return { list, hasMore, loadNextPage, onInit, apiStatus };
};
