class MyElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      let txt= this.getAttribute('text');
      this.shadowRoot.innerHTML = /*html*/`
        <style>:host { display: block; }</style>
        <div>My custom element！${txt}</div>
      `;
    }
  }
  
  customElements.define('simple-greeting', MyElement);
  