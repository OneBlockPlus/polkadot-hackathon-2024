import { SigmaverseProgram } from '@/app/hooks';
import { CyborStream } from '@/sigmaverse';
import { useEffect, useState, useCallback } from 'react';
import { useAccount, useBalanceFormat, useBalance, BigNumber } from '@gear-js/react-hooks';
import { Unity, useUnityContext } from 'react-unity-webgl';

interface UnityReactChannelRequest {
  act: string;
  req: string;
}

export const UnityComponent = () => {
  const { account, isAccountReady } = useAccount();
  const { balance, isBalanceReady } = useBalance(account?.address);
  const [allMyCybors, setMyCybors] = useState<Array<[number | string | bigint, CyborStream]>>([]);

  const { getFormattedBalanceValue } = useBalanceFormat();

  const { unityProvider, sendMessage, isLoaded } = useUnityContext({
    loaderUrl: 'Build-WebGL/Build/Build-WebGL.loader.js',
    dataUrl: 'Build-WebGL/Build/Build-WebGL.data',
    frameworkUrl: 'Build-WebGL/Build/Build-WebGL.framework.js',
    codeUrl: 'Build-WebGL/Build/Build-WebGL.wasm',
  });

  var fetchMyCybors = () => {
    SigmaverseProgram.cyborNft
      .allMyCybors(account?.address)
      .then((result) => {
        console.log('Fetch All My Cybor :::: ', account?.address, result);
        setMyCybors(result);
      })
      .catch((error) => {
        console.error('Error fetching my cybors:', error);
      });
  };

  var convertCyborsStateToMapping = (
    arr: Array<[number | string | bigint, CyborStream]>,
  ): { [key: string]: CyborStream } => {
    return arr.reduce((acc, [id, stream]) => {
      const bigIntId = BigInt(id).toString();
      acc[bigIntId] = stream;
      return acc;
    }, {} as { [key: string]: CyborStream });
  };

  // ------------- 发起调用Unity函数的消息 -------------
  // const testCallUnity = () => {
  //   CallUnityFunction('test', { test: ' test' });
  // };
  var CallUnityFunction = useCallback(
    (act: string, resp: object) => {
      if (isLoaded) {
        var respStr = JSON.stringify(resp);
        // TODO Encrypt
        var msg = JSON.stringify({ Act: act, Resp: respStr });
        console.debug('CallUnity MSG ::::: ', msg);
        sendMessage('WebGLChannel', 'WaitReactCallMe', msg);
      }
    },
    [isLoaded],
  );

  // 钱包信息更新
  useEffect(() => {
    // notify unity return to login scene if changed
    if (isLoaded) {
      var b = BigNumber(0, 10);
      if (balance) {
        b = getFormattedBalanceValue(balance + '');
      }
      console.log('Wallet-Info ::::: ', account?.address, b, isBalanceReady);
      CallUnityFunction('wallet_info', {
        address: account?.address,
        balance: b ? b : 0,
      });
    }
    return () => {};
  }, [account, isAccountReady, balance, isBalanceReady, isLoaded]);

  // 更换钱包重新加载 Cybors & Imprints
  useEffect(() => {
    fetchMyCybors();
  }, [account, isAccountReady]);

  // CyborNFT 有更新 通知 Unity
  useEffect(() => {
    if (isLoaded) {
      var _ret = convertCyborsStateToMapping(allMyCybors);
      console.log('MyCybors-Info ::::: ', allMyCybors, _ret);
      CallUnityFunction('all_my_cybors', _ret);
    }
  }, [allMyCybors]);

  // ------------- 处理来自 Unity 调用 React 的消息 -------------
  const handleUnityMessage = useCallback((event: CustomEvent) => {
    var message = event.detail;
    console.log('React收到来自Unity的消息:', message, isLoaded);
    try {
      var req = JSON.parse(message) as UnityReactChannelRequest;
      // TODO dencrypt body
      var reqBody = JSON.parse(req.req);

      if ('wallet_info' === req.act) {
        var b = BigNumber(0, 10);
        if (balance) {
          b = getFormattedBalanceValue(balance + '');
        }
        CallUnityFunction('wallet_info', {
          address: account?.address,
          balance: b,
        });
      } else if ('all_my_cybors' === req.act) {
        var _ret = convertCyborsStateToMapping(allMyCybors);
        console.log('MyCybors-Info ::::: ', allMyCybors, _ret);
        CallUnityFunction('all_my_cybors', _ret);
      }
    } catch (err) {
      console.debug('DEBUG:::: ' + err);
    }
  }, [isLoaded, balance, account, allMyCybors, CallUnityFunction, getFormattedBalanceValue]);
  useEffect(() => {
    window.addEventListener('MessageFromUnity', handleUnityMessage as EventListener);
    return () => {
      window.removeEventListener('MessageFromUnity', handleUnityMessage as EventListener);
    };
  }, [handleUnityMessage]);

  // ------------- 渲染 unity & 动态调整大小 -------------
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const updateDimensions = useCallback(() => {
    const aspectRatio = 4 / 2.2;
    let newWidth = window.innerWidth;
    let newHeight = window.innerHeight;

    if (newWidth / newHeight > aspectRatio) {
      newWidth = newHeight * aspectRatio;
    } else {
      newHeight = newWidth / aspectRatio;
    }
    setDimensions({ width: newWidth, height: newHeight });
  }, []);
  useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [updateDimensions]);
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* <button onClick={testCallUnity} style={{ position: 'absolute', top: 10, left: 500 }}>
          Send Message to Unity
        </button> */}
      <div style={{ width: dimensions.width, height: dimensions.height }}>
        <Unity
          unityProvider={unityProvider}
          style={{ width: '100%', height: '80%', paddingTop: ' 2%', paddingLeft: '2%', paddingRight: '4%' }}
        />
      </div>
    </div>
  );
};
