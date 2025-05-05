/**
 * @name 页面曝光/离开黄金令箭
 */
import { usePageShow, usePageHide } from '@ali/tl-usePageLifeCycles';
import { useEffect, useRef } from 'react';

export function usePageGoldLog(exp, leave, deps?) {
  const enterTime = useRef(0);

  useEffect(exp, deps ? deps : []);

  usePageShow(() => {
    enterTime.current = Date.now();
  });

  const handleLogLeave = () => {
    leave({
      read_time: Date.now() - enterTime.current,
    });
  };

  usePageHide(() => {
    handleLogLeave();
  });
}
