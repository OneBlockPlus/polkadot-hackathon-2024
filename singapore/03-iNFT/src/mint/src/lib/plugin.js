const map={};

const ui={        //Dapp UI function 
  dialog:null,    //popup dialog UI method 
  toast:null,     //popup toast method 
  page:null,      //single page UI method 
  fresh:null,     //auto fresh method
}

const plugin = {
  reg:(key,fun)=>{  
    map[key]=fun;
  },
  run:(key,params)=>{
    map[key](ui,...params);
  },
  remove:(key)=>{
    delete map[key];
  },
  setUI:(obj)=>{
    for(let key in ui){
      if(obj[key]) ui[key]=obj[key];
    }
  },
};

export default plugin;