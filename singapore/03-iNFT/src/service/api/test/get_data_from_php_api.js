const url="https://android.im/market/";

const getData=async ()=>{
    const response = await fetch(url);
    //console.log(response);
    const ctx = await response.text();
    console.log(ctx);
}

getData();