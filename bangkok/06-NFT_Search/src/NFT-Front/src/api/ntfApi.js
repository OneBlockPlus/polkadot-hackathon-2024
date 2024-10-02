import request from "@/utlis/request";


// 图-文全局检索
export function caption_global_search(data) {

    return request({
        url: "/caption_global_search",
        method: "post",
        data
    })
}

// 图-文定向检索
export function caption_directed_search(data) {

    return request({
        url: "/caption_directed_search",
        method: "post",
        data
    })
}


// 图-文定向检索
export function img_global_search(data) {

    return request({
        url: "/img_global_search",
        method: "post",
        data
    })
}


// 图-图定向检索
export function img_directed_search(data) {

    return request({
        url: "/img_directed_search",
        method: "post",
        data
    })
}
