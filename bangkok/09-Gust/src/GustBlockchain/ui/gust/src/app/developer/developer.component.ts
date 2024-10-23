import { Component } from '@angular/core';
import { TransactionRelayerService } from '../services/relayer.service';

@Component({
  selector: 'app-developer',
  templateUrl: './developer.component.html',
  styleUrls: ['./developer.component.css']
})
export class DeveloperComponent {
  selectedTab: number = 0;

  isDeploy: boolean = false;
  deploymentLog: string = '';
  recipient_address: string = '';
  amount: number = 0;
  isVerified: boolean = false;
  showOverlay: boolean = false;

  tabs = [
    { title: 'Gustavo Smart Contracts' },
    { title: 'Deploy Your First Contract' },
    { title: 'Write Your Contract' }
  ];

  constructor(private txnRelayerService: TransactionRelayerService) {}

  smartContractCode: string = `
    Contract SimpleTransaction accepts 0xTokenAddress:
      State:
        address sender;
        address receiver;
        uint amount;

      initState(address receiverAcc, uint initialAmount):
        sender = CallBy.acc;
        receiver = receiverAcc;
        amount = initialAmount;

      transferFunds(uint transferAmount) public:
        if transferAmount <= amount:
          amount -= transferAmount;
          CallBy.pay(receiver, transferAmount);
        else:
          revert("Insufficient funds for the transaction");
  `;

  selectTab(index: number) {
    this.selectedTab = index;
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
    //   this.runDeployment();
    // }
  }

  runDeployment() {
    if (!this.isVerified) {
      // this.appendToLog('OTP not verified. Deployment blocked.');
      this.appendToLog(this.getTimestampedMessage('OTP not verified. Deployment blocked.'));
      return;
    }

    this.isDeploy = true;
    this.appendLogWithDelay('Starting deployment...', 0, 'green-text');
    this.appendLogWithDelay(`Sending ${this.amount} GSC to ${this.recipient_address}...`, 2000);
    this.appendLogWithDelay('Transaction successfully completed...', 4000, 'green-text');
    const reqBody = {
      recipient_address: this.recipient_address,
      amount: this.amount
    };

    this.txnRelayerService.sendAndSign(reqBody)
      .subscribe({
        next: (response) => {
          this.appendToLog(this.getTimestampedMessage(response.message));
          if (response.logs) {
            response.logs.forEach((log: string) => {
              this.appendToLog(this.getTimestampedMessage(log));
            });
          }
        },
        error: (err) => {
          this.appendLogWithDelay('Error occurred during deployment ', 0, 'red-text');
          this.appendLogWithDelay( err.message, 1000,'red-text');
        },
        complete: () => {
          this.appendLogWithDelay('Deployment process completed.', 0, 'green-text');
        }
      });
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
