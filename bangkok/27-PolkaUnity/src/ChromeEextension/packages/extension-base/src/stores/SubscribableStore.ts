// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BaseStore from '@subwallet/extension-base/stores/Base';
import { Subject } from 'rxjs';

export default abstract class SubscribableStore<T> extends BaseStore<T> {
  private readonly subject: Subject<T> = new Subject<T>();

  public getSubject (): Subject<T> {
    return this.subject;
  }

  public override set (_key: string, value: T, update?: () => void): void {
    super.set(_key, value, () => {
      this.subject.next(value);
      update && update();
    });
  }

  public asyncGet = async (key: string): Promise<T> => {
    return new Promise((resolve) => {
      this.get(key, resolve);
    });
  };

  public removeAll () {
    return this.all((key) => this.remove(key));
  }
}
