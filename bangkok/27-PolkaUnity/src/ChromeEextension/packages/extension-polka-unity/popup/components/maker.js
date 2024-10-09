
export default function main(params) {
    class MyElement extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            let html = params.html;
            if (params.attrs && params.attrs.length > 0) {
                for (let a of params.attrs) {
                    let value = this.getAttribute(a);
                    let key = "{" + a + "}";
                    html = html.split(key).join(value);
                }
            }
            this.shadowRoot.innerHTML = html;
        }
        connectedCallback() {
            if (params.mounted && typeof params.mounted == 'function') {
                params.mounted();
            }
        }
        disconnectedCallback() {
            if (params.unmounted && typeof params.unmounted == 'function') {
                params.unmounted();
            }
        }
    }
    customElements.define(params.name, MyElement);
}