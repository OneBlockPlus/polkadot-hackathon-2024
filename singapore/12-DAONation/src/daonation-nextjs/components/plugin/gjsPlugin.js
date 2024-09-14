export function gjsPlugin(editor) {
  let button_class = 'py-2 px-4 gap-2 text-moon-14 rounded-moon-i-sm relative z-0 flex justify-center items-center font-medium no-underline overflow-hidden select-none outline-none transition duration-200 active:scale-90 focus-visible:shadow-focus btn-primary';
  editor.Components.addType('button-back', {
    model: {
      defaults: {
        tagName: 'button',
        attributes: { type: 'button' },
        content: 'Back',
        classes: button_class + ' btn-back ',

        traits: [
          {
            type: 'text',
            label: 'Text',
            name: 'value',
            value: 'Back'
          }
        ]
      }
    },
    isComponent(el) {
      if (el && el.classList && el.classList.contains('btn-back')) {
        return { type: 'button-back' };
      }
    },
    view: {
      events: {
        click: 'handleClick'
      },

      init() {
        this.listenTo(this.model, 'change:attributes', this.updateContent);
        this.listenTo(this.model, 'change:contnet', this.updateContent);
      },

      updateContent() {
        this.el.innerHTML = this.el.getAttribute('value');
      },

      handleClick(e) {
        e.preventDefault();
      }
    }
  });

  editor.Blocks.add('back-block', {
    label: 'Back',
    content: `<button value="Back" >Back</button>`,
    category: 'Dao Component',
    media: `<svg  xmlns="http://www.w3.org/2000/svg" width="80%"  viewBox="0 0 1024 1024"><path fill="var(--btn-bg)" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"/><path fill="var(--btn-bg)"  d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"/></svg>`,
    content: { type: 'button-back' }
  });

  editor.Components.addType('button-create-goal', {
    model: {
      defaults: {
        tagName: 'button',
        attributes: { type: 'button' },
        classes: button_class + ' create-goal-block ',

        content: 'Create Goal',
        traits: [
          {
            type: 'text',
            label: 'Text',
            name: 'value',
            value: 'Create Goal'
          }
        ]
      }
    },
    isComponent(el) {
      if (el && el.classList && el.classList.contains('create-goal-block')) {
        return { type: 'button-create-goal' };
      }
    },
    view: {
      events: {
        click: 'handleClick'
      },

      init() {
        this.listenTo(this.model, 'change:attributes', this.updateContent);
        this.listenTo(this.model, 'change:contnet', this.updateContent);
      },

      updateContent() {
        this.el.innerHTML = this.el.getAttribute('value');
      },

      handleClick(e) {
        console.log('YEAH?');
        e.preventDefault();
      }
    }
  });

  editor.Blocks.add('create-goal-block', {
    label: 'Create Goal',
    content: `<button value="Create Goal" >Create Goal</button>`,
    category: 'Dao Component',
    media: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="80%" viewBox="0 0 64 64" aria-hidden="true" role="img" class="iconify iconify--emojione" preserveAspectRatio="xMidYMid meet"><g fill="#f2b200"><path d="M12.7 31.7c-.5 0-1.1-.1-1.5-.4c-1.3-.7-2.9-2.5-2.9-7.3c0-10-5.4-15.8-5.4-15.8l-.9-1L6.7 2l.8 1.2c.1.1 2.6 3.7 6.5 2.7l.5 2.6c-3.9 1-6.7-1.1-8.1-2.6l-1 1.3c1.7 2.2 5.3 8 5.3 16.8c0 2.6.5 4.4 1.5 4.9c.7.4 1.8 0 2.8-1c2.6-2.6 4.5-9 4.5-9l2.2.8c-.1.3-2.1 7.2-5.2 10.2c-1.3 1.2-2.6 1.8-3.8 1.8"/><path d="M51.3 31.7c.5 0 1.1-.1 1.5-.4c1.3-.7 2.9-2.5 2.9-7.3c0-10.1 5.3-15.8 5.4-15.9l.9-.9L57.3 2l-.8 1.2c-.1.1-2.6 3.7-6.5 2.7l-.5 2.6c3.9 1 6.7-1.1 8.1-2.6l1.2 1.3c-1.7 2.2-5.3 8-5.3 16.8c0 2.6-.5 4.4-1.5 4.9c-.7.4-1.8 0-2.8-1c-2.6-2.6-4.5-9-4.5-9l-2.2.8c.1.3 2.1 7.2 5.2 10.2c1.1 1.2 2.4 1.8 3.6 1.8"/><path d="M29 24.9h6.1v24.5H29z"/></g><path fill="#ffce31" d="M30.2 24.9h3.6v24.5h-3.6z"/><path d="M11.8 2C13.5 17.4 21.9 29.7 32 29.7S50.5 17.4 52.2 2H11.8z" fill="#f2b200"/><path d="M15.7 2c1.4 15.6 8.2 28 16.3 28S46.9 17.6 48.3 2H15.7z" fill="#ffce31"/><path d="M47.6 54H16.4s7-9 15.6-9s15.6 9 15.6 9" fill="#f2b200"/><path d="M43.9 54H20.1s5.3-9.2 11.9-9.2S43.9 54 43.9 54z" fill="#ffce31"/><path fill="#bc845e" d="M11.8 56h40.4v6H11.8z"/><path fill="#916140" d="M16.4 54h31.3v2H16.4z"/><path fill="#f2b200" d="M22 57.5h20v3H22z"/><path fill="#ce9c7a" d="M11.8 56h2v6h-2z"/><path fill="#916140" d="M50.2 56h2v6h-2z"/><path fill="#ffce31" d="M23 57.5h18v3H23z"/></svg>`,
    content: { type: 'button-create-goal' }
  });

  editor.Components.addType('button-join-community', {
    model: {
      defaults: {
        tagName: 'button',
        classes: button_class + ' join-community-block ',

        attributes: { type: 'button' },
        content: 'Join charity',
        traits: [
          {
            type: 'text',
            label: 'Text',
            name: 'value',
            value: 'Join charity'
          }
        ]
      }
    },
    isComponent(el) {
      if (el && el.classList && el.classList.contains('join-community-block')) {
        return { type: 'button-join-community' };
      }
    },
    view: {
      events: {
        click: 'handleClick'
      },

      init() {
        this.listenTo(this.model, 'change:attributes', this.updateContent);
        this.listenTo(this.model, 'change:contnet', this.updateContent);
      },

      updateContent() {
        this.el.innerHTML = this.el.getAttribute('value');
      },

      handleClick(e) {
        e.preventDefault();
      }
    }
  });

  editor.Blocks.add('join-community-block', {
    label: 'Join Charity',
    content: `<button value="Join Charity" >Join Charity</button>`,
    category: 'Dao Component',
    media: `<svg xmlns="http://www.w3.org/2000/svg"  width="80%" fill="var(--btn-bg)"  xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 208.87 208.87" style="enable-background:new 0 0 208.87 208.87;" xml:space="preserve"> <g> <g> <g> <path  d="M142.859,116.944c2.423,1.032,4.839,2.094,7.286,3.049c1.175,0.465,1.617,1.235,1.862,2.452     c0.549,2.781,0.107,5.448-0.549,8.127c-0.489,2.035-1.396,2.763-3.461,3.097c-0.609,0.101-1.223,0.459-1.724,0.847     c-0.453,0.352-0.865,0.758-1.283,1.158c4.988,2.124,10.15,4.487,15.299,7.13c2.47,1.271,4.648,2.858,6.48,4.744l1.689,1.748     v8.372c13.473,0,26.946,0,40.414,0c-1.14-7.638-5.794-12.166-12.829-14.768c-4.583-1.689-9.076-3.646-13.533-5.663     c-1.271-0.591-2.214-1.856-3.353-2.727c-0.501-0.382-1.122-0.746-1.712-0.853c-2.076-0.328-2.983-1.062-3.473-3.103     c-0.638-2.673-1.11-5.346-0.549-8.121c0.245-1.217,0.686-1.987,1.862-2.452c2.458-0.949,4.857-2.017,7.286-3.049     c1.82-0.77,1.921-1.396,1.271-3.276c-2.088-5.901-3.634-11.916-4.135-18.229c-0.328-3.986-0.221-8.061-1.175-11.976h-0.149     c-0.084-0.364-0.125-0.728-0.221-1.086c-1.76-6.904-9.159-10.657-15.383-11.057c-0.06-0.006-0.107-0.018-0.149-0.018     c-0.477-0.03-0.931,0.042-1.396,0.072c-2.619,0.364-4.768,2.023-7.262,2.751c-3.24,0.955-5.233,3.938-6.444,7.148     c-1.712,4.565-1.396,9.434-1.784,14.159c-0.501,6.319-2.053,12.322-4.135,18.223C140.931,115.535,141.051,116.18,142.859,116.944     z"/> <path d="M43.17,149.368l1.897-1.784c1.724-1.617,3.783-3.049,6.486-4.487l1.897-1.026     c2.691-1.45,5.37-2.9,8.139-4.219c1.456-0.692,2.972-1.307,4.463-1.939c-0.316-0.871-0.627-1.742-0.895-2.625     c-0.352-1.122-0.573-2.25-2.029-2.554c-0.364-0.078-0.811-0.698-0.871-1.122c-0.292-2.166-0.513-4.35-0.662-6.54     c-0.036-0.453,0.203-1.062,0.525-1.408c1.903-2.13,2.966-4.6,3.395-7.435c0.221-1.408,1.02-2.739,1.426-4.123     c0.549-1.874,0.996-3.783,1.426-5.686c0.155-0.686,0.066-1.426,0.173-2.13c0.155-1.026,0.125-1.82-1.104-2.214     c-0.346-0.113-0.621-0.919-0.627-1.42c-0.066-3.043-0.024-6.086-0.036-9.129c-0.024-1.862,0-3.747-0.131-5.603     c-0.269-3.574-2.363-6.086-4.988-8.252c-3.843-3.156-8.306-6.14-13.145-5.752c-0.119,0.006-0.215,0.036-0.328,0.054     c-0.113-0.018-0.203-0.048-0.328-0.054c-4.845-0.388-9.314,2.596-13.139,5.752c-2.625,2.166-4.72,4.678-4.988,8.252     c-0.131,1.862-0.125,3.741-0.131,5.603c-0.012,3.049,0.024,6.092-0.036,9.129c-0.012,0.501-0.292,1.313-0.632,1.42     c-1.229,0.394-1.259,1.187-1.098,2.214c0.113,0.704,0.018,1.444,0.173,2.13c0.424,1.903,0.871,3.807,1.42,5.686     c0.406,1.384,1.199,2.715,1.426,4.123c0.436,2.834,1.486,5.305,3.401,7.435c0.316,0.364,0.549,0.955,0.519,1.408     c-0.149,2.19-0.37,4.362-0.668,6.54c-0.06,0.418-0.507,1.05-0.871,1.122c-1.45,0.304-1.677,1.426-2.023,2.554     c-0.453,1.492-0.943,2.983-1.522,4.427c-0.179,0.436-0.627,0.907-1.074,1.116c-2.578,1.122-5.209,2.148-7.805,3.246     c-2.763,1.152-5.555,2.267-8.246,3.556c-2.798,1.331-5.49,2.834-8.198,4.29c-1.611,0.859-3.109,1.808-4.362,2.983v4.779     c14.386,0,28.76,0,43.135,0v-8.312h0.036V149.368z"/> </g> <path d="M157.549,148.144c-9.487-4.857-19.297-8.891-29.226-12.703c-0.746-0.286-1.629-0.847-1.933-1.504    c-0.806-1.79-1.366-3.682-1.945-5.567c-0.364-1.199-0.674-2.339-2.005-2.906c-0.352-0.149-0.662-0.853-0.662-1.295    c0.072-4.356-0.931-8.932,2.297-12.739c0.107-0.125,0.125-0.292,0.209-0.424c1.736-3.819,2.053-8.175,4.487-11.731    c0.06-0.084,0.072-0.197,0.084-0.304c0.28-2.709,0.585-5.412,0.806-8.121c0.024-0.34-0.269-0.931-0.561-1.038    c-1.343-0.477-1.271-1.551-1.259-2.631c0-5.293,0-10.585-0.012-15.878c0-3.079-0.907-5.818-3.228-7.906    c-2.643-2.375-5.37-4.678-8.085-6.981c-1.319-1.116-1.42-1.963-0.197-3.192c0.549-0.537,1.247-0.919,1.862-1.372    c-0.125-0.209-0.269-0.412-0.394-0.621c-0.829,0-1.665-0.113-2.458,0.018c-3.007,0.483-6.038,0.907-8.986,1.611    c-5.639,1.331-11.122,3.097-15.711,6.868c-3.127,2.59-5.621,5.597-5.949,9.845c-0.149,2.232-0.131,4.469-0.149,6.701    c-0.018,3.634,0.03,7.28-0.048,10.907c-0.012,0.597-0.358,1.563-0.758,1.695c-1.468,0.477-1.51,1.414-1.319,2.643    c0.137,0.841,0.036,1.724,0.215,2.548c0.507,2.273,1.05,4.547,1.701,6.784c0.489,1.665,1.438,3.24,1.701,4.935    c0.525,3.383,1.778,6.337,4.069,8.885c0.37,0.418,0.662,1.128,0.621,1.689c-0.179,2.608-0.442,5.209-0.8,7.799    c-0.078,0.507-0.609,1.259-1.044,1.354c-1.73,0.37-1.999,1.695-2.405,3.043c-0.549,1.784-1.122,3.562-1.826,5.287    c-0.209,0.537-0.752,1.104-1.277,1.331c-3.085,1.349-6.217,2.584-9.32,3.872c-3.306,1.384-6.629,2.715-9.845,4.248    c-3.33,1.593-6.552,3.371-9.798,5.12c-1.909,1.014-3.705,2.148-5.203,3.568v5.698c37.752,0,75.505,0,113.263,0v-5.937    C161.07,150.304,159.441,149.111,157.549,148.144z"/> </g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> </svg>`,
    content: { type: 'button-join-community' }
  });
}
