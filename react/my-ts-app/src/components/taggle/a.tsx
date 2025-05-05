import {
    createElement,
    ForwardRefExoticComponent,
    forwardRef,
    Fragment,
    useRef,
    useEffect,
    useState,
  } from 'rax';
  import View from 'rax-view';
  import transition from 'universal-transition';
  import { SlotmachineProps } from '../../utils/type';
  import Toast from 'universal-toast';
  import { THANKATTEND, NOCHANCE, NONETWORK, LOTTERY_STATUS } from '../../utils/const';
  import { goldlogRecordClk } from '@ali/tl-fangzhou-utils';
  import './index.less';
  
  // 数组项全等判断
  function isArrayItemEqual(array: any[]) {
    if (!array || !array.length) return false;
    const arr = array.filter((item: any, index: Number) => array.indexOf(item) === index);
    if (arr.length < 2) return true;
    return false;
  }
  
  const classPrefix = 'slotmachine';
  let lock = false; // 请求锁
  let plist = [] as any;
  let backupIndex = 0;
  
  const RoundBox = (props: any) => {
    const {
      item,
      index,
      loading,
      current,
      resetCurrent,
      duration = 6,
      resetLocation,
      result,
      list,
      onComplete,
    } = props;
  
    const box = useRef(null);
  
    useEffect(() => {
      if (loading && box?.current) {
        transition(
          box.current,
          {
            transform: `translateY(-${current * 132}rpx)`,
          },
          {
            timingFunction: 'ease-in-out',
            duration: duration * 1000,
            delay: index * 500,
          },
          () => {
            if (index === 2) {
              onComplete();
            }
            // 游戏完毕后，位置重置
            if (box && box.current) {
              const oldVal = (box as any).current.style.transform.match(/\d+/)[0] || 0;
              (box as any).current.style.transform = `translateY(-${
                (resetCurrent * oldVal) / current
              }vw)`;
              try {
                // 异常1：服务端结果未中奖，但是转的奖品位置一样 - 全部转到兜底图上
                if ((result === THANKATTEND || !result) && isArrayItemEqual(resetLocation)) {
                  // 全部转到兜底图上
                  (box as any).current.style.transform = `translateY(-${
                    (backupIndex * oldVal) / current
                  }vw)`;
                }
                // 异常2：服务端结果已中奖，但是转的奖品位置跟奖品不符合(且不是兜底奖品图) - 全部转到兜底图上
                if (
                  result &&
                  result !== THANKATTEND &&
                  list[index][resetLocation[index]].code !== result &&
                  backupIndex !== resetCurrent
                ) {
                  (box as any).current.style.transform = `translateY(-${
                    (backupIndex * oldVal) / current
                  }vw)`;
                }
              } catch (error) {
                console.log(error, '--error');
              }
            }
          },
        );
      }
    }, [loading, current]);
  
    return (
      <View
        className={`${classPrefix}-bgImg-container-col-container`}
        ref={box}
        style={{ transform: `translateY(-${index * 132}rpx)` }}
      >
        {item && item.length
          ? item.map((it, idx) => (
            <View
              className={`${classPrefix}-bgImg-container-col-container-benefit`}
              key={`${it.code}_${index}_${idx}`}
            >
              {it?.imageUrl ? (
                <View
                  className={`${classPrefix}-bgImg-container-col-container-benefit-icon`}
                  style={{
                      backgroundImage: `url(${it?.imageUrl})`,
                    }}
                />
                ) : (
                  <View className={`${classPrefix}-bgImg-container-col-container-benefit-icon`} />
                )}
            </View>
            ))
          : null}
      </View>
    );
  };
  