import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { TransactionRelayerService } from '../services/relayer.service';

declare var ace: any;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements AfterViewInit{

  @ViewChild('editor') private editor!:ElementRef;
  output: string = '';
  code: string = `
    // Feel free to override below code with your actual smart contract code.

    Contract ExampleContract accepts 0x123456789abcdef, 0xabcdef123456789:
      State:
        int stateVariable1;
        int stateVariable2;

      initState(int initialValue1, int initialValue2):
        stateVariable1 = initialValue1;
        stateVariable2 = initialValue2;

      calculateSum(int a, int b) public:
        // This function takes two integers and returns their sum.
        return a + b;`;

  isDeploy: boolean = false;
  deploymentLog: string = '';
  isVerified: boolean = false;
  showOverlay: boolean = false;
  code_hash:string = '';
  args: string = '';

  constructor(private txnRelayerService: TransactionRelayerService) {}

  ngAfterViewInit(): void {
    const aceEditor = ace.edit(this.editor.nativeElement);
    aceEditor.setTheme('ace/theme/twilight');
    aceEditor.session.setMode('ace/mode/plaintext');
    aceEditor.setOptions({
      fontSize: "0.875rem",
      showLineNumbers: true,
      showGutter: true,
    });
    aceEditor.resize();
  }
  openVerification() {
    if (!this.isVerified) {
      this.showOverlay = true;
    }
  }

  closeVerification() {
    this.showOverlay = false;
  }

  handleVerification(isVerified: boolean) {
    this.isVerified = isVerified;
    this.showOverlay = false;

    // if (this.isVerified) {
    //   this.runCode();
    // }
  }
  runCode(): void {
    if (!this.isVerified) {
      this.appendToLog(this.getTimestampedMessage('OTP not verified. Deployment blocked.'), 'red-text');
      return;
    }

    this.isDeploy = true;
    // this.appendToLog(`\n[${currentTime}] : Starting deployment...`);

    const aceEditor = ace.edit(this.editor.nativeElement);
    const contractCode = aceEditor.getValue();
    this.code_hash = this.generateCodeHash(contractCode);

    let reqBody = {
      code_hash: this.code_hash,
      args: this.args
    }

    this.txnRelayerService.deploy(reqBody)
      .subscribe({
        next: (response) => {
          this.appendToLog(this.getTimestampedMessage(response.message), 'green-text');
          if (response.logs) {
            response.logs.forEach((log: string) => {
              this.appendToLog(this.getTimestampedMessage(log), 'green-text');

            });
          }
        },
        error: (err) => {
          this.deploymentLog += 'Error occurred during deployment: ' +'\n' +err.message + '\n';
        },
        complete: () => {
          this.deploymentLog += 'Deployment process completed.\n';
        }
      });
  }
  generateCodeHash(contractCode: string): string {
    return CryptoJS.SHA256(contractCode).toString(CryptoJS.enc.Hex);
  }
  private appendToLog(message: string, cssClass: string = '') {
    const logMessage = cssClass ? `<span class="${cssClass}">${message}</span>` : message;
    this.deploymentLog += logMessage + '\n';
    console.log(message);
  }
  private getTimestampedMessage(message: string): string {
    const currentTime = new Date().toLocaleTimeString();
    return `[${currentTime}] ${message}`;
  }
  private appendLogWithDelay(message: string, delay: number, cssClass: string = '') {
    setTimeout(() => {
      this.appendToLog(this.getTimestampedMessage(message), cssClass);
    }, delay);
  }
}
