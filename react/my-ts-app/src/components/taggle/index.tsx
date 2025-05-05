import { createElement, useEffect, useState, useRef } from 'rax';
import View from 'rax-view';
import Text from 'rax-text';
import Toast from 'universal-toast';
import service from '../mobile/utils/service';
import Dialog from './components/dialog';
import NewLotteryResultDlg from './components/newLotteryDlg';
// import LotteryResultDlg from './components/lotteryDlg';
import Slotmachine from '../mobile/components/slotmachine';
import bridge from '@ali/tl-bridge';
import Loading from 'universal-loading';
import { generateUrl } from '@ali/tl-detector';
import {
  THANKATTEND,
  NONETWORK,
  MYPRIZE_URL,
  LOTTERY_STATUS,
  DEFAULT_MODAL_COMFIG,
} from './utils/const';
import { goldlogRecordExp, addEvent, removeEvent } from '@ali/tl-fangzhou-utils';
import { setupAppear } from 'appear-polyfill';
import './index.less';
import { createUsePageLifeCycle, initAppLifeCycles } from 'create-app-shared';
import { Swiper, SwiperSlide } from 'rax-swiper';

initAppLifeCycles();
const { usePageShow } = createUsePageLifeCycle({ useEffect });

const classPrefix = 'tl-play-tiger';

export default function Mod(props: { data: any; moduleId?: string }) {
  const el = useRef(null);

  const { theme, prizeList, scene, myPrizeConfig, modalConfig, styleConfig } = props?.data;
  const [lotteryCount, setLotteryCount] = useState<number>(0);
  const [prizeData, setPrizeData] = useState([]);
  const [login, setLogin] = useState(false);

  const [benefit, setBenefit] = useState({
    code: '',
    title: '',
    imageUrl: '',
    type: '',
    jumpUrl: '',
    headImg: '',
    headName: '',
    useJumpUrl: '',
    effectiveEnd: '',
  }); // 中奖信息

  useEffect(() => {
    setupAppear();
    service
      ?.getPrizeList({
        sceneId: scene?.sceneId,
        page: 1,
        size: 10,
      })
      .then((res) => {
        setPrizeData(res?.data);
      });
  }, []);

  usePageShow(() => {
    bridge.isLogin().then((res: any) => {
      //  已登录
      if (res.login === 'true') {
        setLogin(true);
        lotteryCountFun();
      } else {
        setLogin(false);
      }
    });
  });

  useEffect(() => {
    // trigger形式获取抽奖次数
    addEvent('update-lottery-count', () => {
      lotteryCountFun();
    });
    return () => {
      removeEvent('update-lottery-count');
    };
  }, []);

  const detectLogin = () => {
    bridge.detectLogin((res) => {
      if (res.login === 'true') {
        setLogin(true);
        lotteryCountFun();
      } else {
        // 异常逻辑
        console.log('未登录情况');
      }
    });
  };

  const lotteryCountFun = () => {
    // 查询用户当前可抽奖的次数
    service
      .lotteryCount({
        sceneId: scene?.sceneId,
      })
      .then((res: any) => {
        if (res?.data) {
          setLotteryCount(Number(res?.data));
        }
      });
  };

  /**
   * 抽奖
   */
  const onLottery = async () => {
    const emptyBeneift = {
      code: '',
      title: '',
      imageUrl: '',
      type: '',
      jumpUrl: '',
      headImg: '',
      headName: '',
      useJumpUrl: '',
      effectiveEnd: '',
    };
    const fn = () => {
      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          Loading.show({
            content: '加载中，请稍等',
          });
        }, 500);
        service
          .userLottery({
            sceneId: scene?.sceneId,
          })
          .then((res: any) => {
            // 抽奖接口成功后刷新次数接口
            lotteryCountFun();
            const {
              code,
              imageUrl,
              title,
              type,
              jumpUrl,
              headImg,
              headName,
              useJumpUrl,
              effectiveEnd,
            } = res?.data?.prizeItem || {};
            if (res?.data?.winPrize && String(res?.data?.winPrize) === 'true') {
              // 中奖了
              setBenefit({
                code,
                title,
                imageUrl,
                type,
                jumpUrl,
                headImg,
                headName,
                useJumpUrl,
                effectiveEnd,
              });
              // 标识状态为已中奖
              resolve(code);
            } else {
              if (res?.errorMsg) {
                Toast.show(res?.errorMsg, 3000);
              }
              setBenefit(emptyBeneift);
              // 标识状态为谢谢参与
              resolve(THANKATTEND);
            }
          })
          .catch(() => {
            resolve(NONETWORK);
            setBenefit(emptyBeneift);
            Toast.show('网络异常，请稍后再试', 3000);
        })
        .finally(() => {
          clearTimeout(timer);
          Loading.hide();
        });
    });
  };
  return await fn();
};

/**
 * 抽奖完毕-展示结果
 */
const onCompleteLottery = () => {
  console.log('抽奖结束了，即将展示结果', benefit?.code);
  // const lotteryTitle = prizeList?.find((item) => item?.code === benefit?.code);
  const modalProps = Object.assign(DEFAULT_MODAL_COMFIG, modalConfig);
  setTimeout(() => {
    const dlg = Dialog({
      content: (
        <NewLotteryResultDlg {...(benefit || {})} {...modalProps} hide={() => dlg.hide()} />
      ),
    });
  }, 500);
};
/**
 * 我的奖品页
 */
const myPrize = () => {
  if (!login) {
    detectLogin();
    return;
  }
  if (myPrizeConfig?.jumpUrl) {
    bridge.openWindow(myPrizeConfig.jumpUrl);
  } else {
    bridge.openWindow(generateUrl(MYPRIZE_URL, '0', '1'));
  }
};

return (
    <View
      className={classPrefix}
      style={{
        backgroundImage: theme?.themeImg ? `url(${theme?.themeImg})` : 'none',
      }}
    >
      <View
        className={`${classPrefix}-tigerBg`}
        style={{
          backgroundImage: theme?.tigerImg ? `url(${theme?.tigerImg})` : 'none',
          marginBottom: `${styleConfig?.bottomMargin || 0}rpx`,
          marginTop: `${styleConfig?.topMargin || 0}rpx`,
        }}
        onFirstAppear={() =>
          goldlogRecordExp('/tbLiveApp.Diantaoactivity_DtMod.LuckyDraw', props?.moduleId, '', {
            module_name: '老虎机抽奖',
            status: lotteryCount ? LOTTERY_STATUS.lottery : LOTTERY_STATUS.notLottery,
          })
        }
      >
        {/* 我的奖品 */}
        <View
          className={`${classPrefix}-tigerBg-myPrize`}
          style={{
            border: `2rpx solid ${theme?.myPrizeBorderColor}`,
          }}
        >
          <Text
            className={`${classPrefix}-tigerBg-myPrize-text`}
            style={{
              color: theme?.myPrizeColor,
            }}
            onClick={myPrize}
          >
            我的奖品
          </Text>
          <View
            className={`${classPrefix}-tigerBg-myPrize-icon`}
            style={{
              borderColor: theme?.myPrizeColor,
            }}
          />
        </View>
        {/* 老虎机 */}
        <Slotmachine
          prizeList={prizeList}
          duration={4}
          btnImg={theme.slotmachineBtnBgImg} // 按钮图片
          prizeBtnImg={theme.slotmachinePrizeBtnBgImg} // 中奖按钮图片
          lotteryCount={lotteryCount}
          onLottery={onLottery}
          benefit={benefit}
          onComplete={onCompleteLottery}
          prizeConfig={theme}
          login={login}
          detectLogin={detectLogin}
          ref={el}
          moduleId={props?.moduleId}
        />
        {/* 中奖记录跑马灯 */}
        <Swiper
          className={`${classPrefix}-tigerBg-tips`}
          style={{
            backgroundImage: `linear-gradient(90deg,  ${theme?.tipsStartColor} 0%, ${theme?.tipsEndColor} 99%)`,
          }}
          autoplay
          direction="vertical"
          loop
          initialSlide={1}
          x-if={prizeData?.length > 0}
          allowTouchMove={false}
        >
          {prizeData?.map((item, index) => {
            return (
              <SwiperSlide key={index} className={`${classPrefix}-tigerBg-tips-item`}>
                <Text
                  style={{
                    color: theme?.tipsFontColor,
                  }}
                  className={`${classPrefix}-tigerBg-tips-item-text`}
                >
                  {item}
                </Text>
              </SwiperSlide>
            );
          })}
        </Swiper>
        <Text
          className={`${classPrefix}-tigerBg-text`}
          style={{
            color: theme?.btnBottomTextColor,
          }}
        >
          {theme?.btnBottomText}
        </Text>
      </View>
    </View>
  );
}
