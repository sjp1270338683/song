/**
 * @name 主页组件
 * @time 2024-11-11
 * @author jixianda.jxd
 */
import { useRef } from 'react';
import { definePageConfig } from 'ice';
import { Navbar } from '@ali/tl-ui';
import { statusBarHeight, navBarHeight } from '@ali/tl-toolkit';
import Picture from '@ali/picture';
import { useHome } from '@/store/hooks/useHome';
import usePageExp from '@/store/hooks/usePageExp';
import ChatContainer from '@/components/ChatContainer';
import MessageItem from '@/components/MessageItem';
import CapsuleTabs from '@/components/CapsuleTabs';
import usePlazaStore from '@/store/plaza';
import images from '@/common/images';
import { ApiStatus, CARD_TYPE, CapsuleTabsType, MESSAGES_TYPE } from '@/types';
import type { ChatContainerRef } from '@/components/ChatContainer/typings';
import type { Message, CapsuleTabsProps } from '@/types';

import './index.less';

export const pageConfig = definePageConfig(() => ({
  title: 'AI挑礼物',
  spm: {
    spmB: '29835867',
  },
}));

const classPrefix = 'ai-picks-gifts';

export default function Home() {
  const chatContainerRef = useRef<ChatContainerRef>(null);
  useHome(chatContainerRef);

  // 获取数据
  const {
    messages,
    cardShowType,
    chatIdApiStatus,
    answerApiStatus,
    giftList,
    sugConfig,
    selectedData,
    pushMessage,
    queryQuestionChatId,
    setPreventApi,
    setIsFocus,
  } = usePlazaStore([
    'messages',
    'cardShowType',
    'chatIdApiStatus',
    'answerApiStatus',
    'giftList',
    'sugConfig',
    'pushMessage',
    'queryQuestionChatId',
    'setPreventApi',
    'selectedData',
    'setIsFocus',
  ]);
  // 页面曝光
  usePageExp('/tbLiveApp.AI_PickGift.Page', '/tbLiveApp.AI_PickGift.Page_End');

  /**
   * 搜索回调
   * @param keyword 搜索关键词
   */
  const onSearch = (keyword: string) => {
    setPreventApi(true);
    pushMessage({
      type: MESSAGES_TYPE.MESSAGE,
      messageContent: { me: true, messageList: [{ text: keyword }] },
    });
    queryQuestionChatId({
      content: keyword,
    });
  };
  /**
   * 渲染输入框上方sug词
   * @returns
   */
  const renderCapsuleTabs = (isFocus) => {
    return (
      <div
        className="capsule-tabs-sug"
        x-if={
          chatIdApiStatus !== ApiStatus.LOADING &&
          answerApiStatus !== ApiStatus.LOADING &&
          !isFocus &&
          (Object.keys(selectedData)?.length || (cardShowType === CARD_TYPE.HIDE && giftList?.length))
        }
      >
        {giftList?.map((item: CapsuleTabsProps, index) => (
          <CapsuleTabs
            key={`${item.id}-${index}`}
            {...item}
            className={'capsule-tabs-sug-item'}
            capsuleType={CapsuleTabsType.SEARCH_BOX_TOP_CAPSULE}
          />
        ))}
      </div>
    );
  };

  return (
    <Navbar backgroundColor="#f6f6f6" transparentTitle="no" title="AI礼物助手" style={{ display: 'flex' }}>
      {/* 标题栏背景 */}
      <Picture
        className={`${classPrefix}-bg`}
        source={{
          uri: images.home.bg_title_bar,
        }}
        style={{
          width: '750rpx',
          height: `calc(${navBarHeight} + ${statusBarHeight})`,
        }}
      />
      {/* 内容区 */}
      <div
        className={`${classPrefix}-content`}
        style={{
          paddingTop: `calc(${navBarHeight} + ${statusBarHeight} + 12rpx)`,
        }}
      >
        {/* 聊天内容 */}
        <ChatContainer<Message>
          x-if={messages.length}
          ref={chatContainerRef}
          messages={messages}
          renderMessageItem={(item, index) => {
            return (
              <MessageItem
                key={`${item?.messageContent?.me}-${index}`}
                message={item}
                sugConfig={sugConfig}
                index={index}
              />
            );
          }}
          renderCapsuleTabs={renderCapsuleTabs}
          onSearch={onSearch}
          onBlur={() => {
            // 添加延迟，为了让聚焦后点击事件里的 isFocus 为true
            setTimeout(() => {
              setIsFocus(false);
            }, 500);
          }}
          onFocus={() => {
            setIsFocus(true);
          }}
        />
      </div>
    </Navbar>
  );
}
