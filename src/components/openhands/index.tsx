'use client';

import ContractInteraction from '@/components/openhands/modules/ContractInteraction';
import Divider from '@/components/openhands/modules/Divider';
import SendNativeToken from '@/components/openhands/modules/SendNativeToken';
import SignMessage from '@/components/openhands/modules/SignMessage';
import SignTypedData from '@/components/openhands/modules/SignTypedData';
import { ContextProvider } from '@/components/openhands/store/useGlobalState';

import styles from './index.module.css';

export default function OpenHands() {
  return (
    <ContextProvider>
      <div className={styles.openhands}>
        <SendNativeToken />
        <Divider />
        <SignMessage activeIndex={2} />
        <Divider />
        <SignTypedData />
        <Divider />
        <ContractInteraction />
      </div>
    </ContextProvider>
  );
}
