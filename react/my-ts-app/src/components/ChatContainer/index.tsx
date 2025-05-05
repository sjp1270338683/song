/**
 * @name 消息容器
 */
import { useImperativeHandle, forwardRef, useState, useRef } from 'react';
import View from '@ali/pcom-ice-view';
import Picture from '@ali/picture';
import images from '@/common/images';
import SearchBar, { SearchBarRef } from './SearchBar';
import Scroller from '@ali/scroller';
import { useChatContainer } from './hooks/useChatContainer';
import type { ChatContainerRef, ChatContainerProps, GenericTypingWrapper } from './typings';
import './index.less';

const classPrefix = 'chat-wrapper';

const ChatContainer = forwardRef<ChatContainerRef, ChatContainerProps>(function (props, ref) {
  const { messages, renderCapsuleTabs, onSearch, onBlur, onFocus } = props;
  const textareaRef = useRef<SearchBarRef>(null);

  const {
    chatWrapperRef,
    searchBarWrapperRef,
    _ref,
    isShowScroll,
    canScroll,
    onTouchStart,
    onAppear,
    scrollToBottom,
    onDisappear,
  } = useChatContainer(textareaRef);

  useImperativeHandle(ref, () => ({
    scrollToBottom,
  }));

  return (
    <div ref={chatWrapperRef} className={classPrefix}>
      <Scroller
        className={`${classPrefix}-list`}
        id="chat-content-list"
        ref={_ref}
        dataSource={messages}
        throttle={50}
        onTouchStart={onTouchStart}
        renderItem={(item, index) => {
          return (
            <div key={`${item?.messageContent?.me}-${index}`}>
              {props?.renderMessageItem?.(item, index, textareaRef.current?.getFocusStatus())}
              {/* 用于置底  */}
              {messages && index === messages?.length - 1 ? (
                <View
                  onAppear={onAppear}
                  onDisappear={onDisappear}
                  className="bottom-item"
                  style={{ width: '100%', height: '24rpx' }}
                  x-if={(messages?.length || 0) - 1 === index}
                />
              ) : null}
            </div>
          );
        }}
      />

      <div ref={searchBarWrapperRef} style={{ height: 'fit-content', position: 'relative' }}>
        {/* 置底icon  */}
        <Picture
          onClick={() => scrollToBottom(true)}
          className={`${classPrefix}-bottom-icon`}
          source={{ uri: images.home.bottom_up_icon }}
          style={{
            top: isShowScroll ? '-84rpx' : '500rpx',
          }}
        />
        {/* 底部搜索栏  */}
        <SearchBar
          canScroll={canScroll}
          renderCapsuleTabs={renderCapsuleTabs}
          scrollToBottom={scrollToBottom}
          onSearch={onSearch}
          onBlur={onBlur}
          onFocus={onFocus}
          ref={textareaRef}
        />
      </div>
    </div>
  );
});

ChatContainer.displayName = 'ChatContainer';

export default ChatContainer as GenericTypingWrapper;
