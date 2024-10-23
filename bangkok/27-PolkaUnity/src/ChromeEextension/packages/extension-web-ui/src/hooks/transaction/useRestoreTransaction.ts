// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TransactionContext } from '@subwallet/extension-web-ui/contexts/TransactionContext';
import { TransactionFormBaseProps } from '@subwallet/extension-web-ui/types';
import { FormInstance } from '@subwallet/react-ui';
import { useContext, useEffect } from 'react';

const useRestoreTransaction = <T extends TransactionFormBaseProps>(form: FormInstance<T>) => {
  const { needPersistData, persistData } = useContext(TransactionContext);

  useEffect(() => {
    if (needPersistData) {
      persistData(form.getFieldsValue());
    }
  }, [form, needPersistData, persistData]);
};

export default useRestoreTransaction;
