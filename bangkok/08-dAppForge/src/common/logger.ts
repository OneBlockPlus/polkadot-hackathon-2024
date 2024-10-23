import { workspace } from 'vscode';

export class Logger {
  private _config = workspace.getConfiguration('dappforge');
  private _debugEnabled = this._config.get('enableLogging') as boolean;

  public log = (...messages: unknown[]) => {
    if (!this._debugEnabled) return;
    console.log(`[dAppForge] ${messages.join(' ')}`);
  };

  public error = (err: NodeJS.ErrnoException) => {
    if (!this._debugEnabled) return
    console.error(`[dAppForge] ${err.message}`)
  }

  public updateConfig() {
    this._config = workspace.getConfiguration('dappforge');
    this._debugEnabled = this._config.get('enableLogging') as boolean;
  }
}

