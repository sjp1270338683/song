const Slotmachine: ForwardRefExoticComponent<SlotmachineProps> = forwardRef((props) => {
    const el = useRef(null);
    const {
      btnImg = '',
      prizeList = [],
      duration,
      lotteryCount = 0,
      onLottery,
      onComplete,
      prizeConfig,
      prizeBtnImg,
      login,
      detectLogin,
      moduleId,
    } = props;
  
    // 拼接后的3列奖品
    const [list, setList] = useState([]);
    // 动画结束后的3列奖品选中位置的索引
    const [location, setLocation] = useState<number[]>([]);
    // 重置动画时3列奖品选中位置的索引
    const [resetLocation, setResetLocation] = useState<number[]>([]);
    // 标识动画是否进行中
    const [loading, setLoading] = useState(false);
    // 当前最新的抽奖结果
    const [currentResult, setCurrentResult] = useState('');
    // 按钮
    const [isPrizeBtn, setIsPrizeBtn] = useState('');
  
    useEffect(() => {
      if (lotteryCount > 0) {
        setIsPrizeBtn(prizeBtnImg);
      } else {
        setIsPrizeBtn(btnImg);
      }
    }, [lotteryCount]);
  
    // 当前最新的抽奖结果
    useEffect(() => {
      if (Array.isArray(prizeList) && prizeList.length) {
        let columnList: any = [];
        let count = Math.ceil((duration * 10) / (prizeList.length || 1));
        count = count < 2 ? 2 : count;
        for (let i = 0; i < count; i++) {
          columnList = columnList.concat([], prizeList);
        }
        setList([columnList, columnList, columnList]);
        plist = [columnList, columnList, columnList];
        backupIndex = 0;
      }
    }, [duration, prizeList]);
  
    /**
     * 处理游戏动画执行完毕
     */
    const handleComplete = () => {
      setLoading(false);
      lock = false;
      onComplete();
    };
  
    /**
     * 动画了
     */
    const anim = (result: string) => {
      let columnTemp: any = [];
      let resetColumnTemp: any = [];
      if (result && result !== THANKATTEND) {
        // 中奖啦
        const firstColList = [...((plist && plist[0]) || [])];
        const { length } = firstColList;
        const orl = firstColList.reverse().findIndex((i) => i.code === result);
        const prizeListOrl = prizeList.findIndex((i) => i.code === result);
        const l = length - orl - 1;
        columnTemp = [l, l, l];
        resetColumnTemp = [prizeListOrl, prizeListOrl, prizeListOrl];
      } else {
        // 其余情况都以未中奖来处理
        const randomList = randomItems();
        columnTemp = randomList.new;
        resetColumnTemp = randomList.old;
      }
      setLocation(columnTemp);
      setResetLocation(resetColumnTemp);
      setLoading(true);
      console.log('转动位置', columnTemp);
      console.log('重置位置', resetColumnTemp);
    };
  
    /**
     * 找与targetObj不同且最终的索引不为targetIndex的奖品
     */
    const findOtherIndex = (sourceArr: any[], targetObj: any, targetIndex: number) => {
      return sourceArr.findIndex((item: any, index: number) => index !== targetIndex);
    };
  
    /**
     * 3列随机取索引数
     */
    const randomItems = () => {
      const length: number = prizeList?.length || 0;
      const len: number = ((plist && plist[0]) || []).length;
  
      const randomIndex = parseInt(`${Math.random() * length}`);
      const randomItem = prizeList[randomIndex];
      const secondRandomIndex = findOtherIndex(prizeList, randomItem, randomIndex);
      const thirdRandomIndex = findOtherIndex(prizeList, randomItem, secondRandomIndex);
      const columnTemp = [randomIndex, secondRandomIndex, thirdRandomIndex];
  
      return {
        old: columnTemp,
        new: columnTemp.map((i) => len - length + i),
      };
    };
    // 点击抽奖埋点
    const handleLotteryClick = () => {
      goldlogRecordClk('/tbLiveApp.Diantaoactivity_DtMod.LuckyDraw', moduleId, '', {
        status: lotteryCount ? LOTTERY_STATUS.lottery : LOTTERY_STATUS.notLottery,
        module_name: '老虎机抽奖',
      });
    };
  
    /**
     * 去抽奖
     */
    const run = () => {
      handleLotteryClick();
      if (!login) {
        detectLogin();
        return;
      }
      if (Number(lotteryCount) <= 0) {
        Toast.show('您的抽奖次数不足，请完成任务后再来吧', 3000);
        return;
      }
      if (lock) return;
      lock = true;
      onLottery()
        .then((res: string) => {
          if (res === NOCHANCE || res === NONETWORK) {
            lock = false;
            return;
          }
          setCurrentResult(res);
          anim(res);
        })
        .catch(() => {
          Toast.show('网络超时，请稍后重试', 3000);
        });
    };
    return (
        <Fragment>
          <View className={classPrefix}>
            <View className={`${classPrefix}-bgImg`} ref={el}>
              <View className={`${classPrefix}-bgImg-container`}>
                {list && list?.length
                  ? list?.map((item, index) => (
                    <View className={`${classPrefix}-bgImg-container-col`} key={`col_${index}`}>
                      <RoundBox
                        {...props}
                        item={item}
                        index={index}
                        loading={loading}
                        current={location[index] || 0}
                        resetCurrent={resetLocation[index] || 0}
                        resetLocation={resetLocation}
                        result={currentResult}
                        list={list}
                        duration={duration}
                        onComplete={handleComplete}
                        setIsPrizeBtn={setIsPrizeBtn}
                        btnImg={btnImg}
                      />
                    </View>
                    ))
                  : null}
              </View>
            </View>
            <View className={`${classPrefix}-btn`}>
              <View
                className={`${classPrefix}-btn-btnImg`}
                style={{ backgroundImage: `url(${isPrizeBtn || btnImg})` }}
                onClick={run}
              >
                <View
                  className={`${classPrefix}-btn-btnImg-icon`}
                  style={{
                    backgroundColor: prizeConfig?.bubbleBgColor,
                    color: prizeConfig?.bubbleColor,
                  }}
                >
                  {lotteryCount}次
                </View>
              </View>
            </View>
          </View>
        </Fragment>
      );
    });
    
    export default Slotmachine;
    