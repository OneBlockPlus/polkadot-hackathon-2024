

class CustomButton extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement('template');
    template.innerHTML = /*html*/`
  <style>
    :host {
      width: 100%;
      display: flex;
      justify-content: center;
    }
    .button {
      color: #fff;
      background-color: #409eff;
      border: 1px solid #409eff;
      border-radius: 4px;
      padding: 12px 20px;
      font-size: 14px;
    }
  </style>
  <button class="button">默认按钮</button>
`;
    const content = template.content.cloneNode(true);
    const button = content.querySelector('.button');

    button.innerText = this.getAttribute('text');

    let num = 0;
    button.addEventListener('click', () => {
      button.innerText = `clicked ${++num} times`;
    });
    const shadow = this.attachShadow({ mode: 'closed' });

    shadow.append(content);
  }
}

customElements.define('custom-button', CustomButton);