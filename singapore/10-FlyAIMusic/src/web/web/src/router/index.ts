import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'

const routes: RouteRecordRaw[] = [ //路由数组中每个元素类型为RouteRecordRaw
     {
        path: '/market',
        name: 'market',
        component: () => import('@/views/market/index.vue'),
     },
    {
        path: '',
        redirect: '/index',
    }, {
        path: '/index',
        name: 'index',
        redirect: '/discover',
        component: () => import('@/views/index.vue'),
        children: <any>[
            {
                path: '/discover',
                component: () => import('@/views/discover/index.vue'),
                redirect: '/market',

                children: [
                    {
                        name: 'recommend',
                        path: '/discover/recommend',
                        component: () => import('../views/discover/children/recommend/index.vue'),
                    }, {
                        name: 'songList',
                        path: '/discover/songList',
                        component: () => import('../views/discover/children/songList/children/songListIndex.vue'),
                        redirect: '/discover/songList/index',
                        children: [
                            {
                                name: 'songListIndex',
                                path: '/discover/songList/index',

                            }
                        ]
                    }, {
                        name: 'ranking',
                        path: '/discover/ranking',
                        component: () => import('../views/discover/children/ranking/index.vue'),
                    }, {
                        name: 'artist',
                        path: '/discover/artist',
                        component: () => import('../views/discover/children/artist/index.vue'),
                    }, {
                        name: 'CreateNFT',
                            path: '/discover/create-nft',
                        component: () => import('@/views/CreateNFT.vue'),
                    },{
                        name: 'u-pro',
                        path: '/discover/u-pro',
                        component: () => import('@/views/UserProfile.vue'),
                    },{
                        name: 'Marketplace',
                        path: '/web3/Marketplace',
                        component: () => import('@/views/web3/Marketplace.vue'),
                    },{
                        name: 'Community',
                        path: '/web3/Community',
                        component: () => import('@/views/web3/Community.vue'),
                    },{
                        name: 'Artists',
                        path: '/web3/Artists',
                        component: () => import('@/views/web3/Artists.vue'),
                    },{
                        name: 'user-details',
                        path: '/web3/user-details',
                        component: () => import('@/views/web3/UserDetails.vue'),
                    },{
                        name: 'nft-detail',
                        path: '/web3/nft-details',
                        component: () => import('@/views/web3/NFTDetails.vue'),
                    }


                ]
            },
            {
                path: '/video',
                component: () => import('@/views/video/index.vue'),
                redirect: '/video/videoList',
                children: [
                    {
                        name: 'videoList',
                        path: '/video/videoList',
                        component: () => import('@/views/video/videoList/index.vue'),
                    },
                    {
                        name: 'mvList',
                        path: '/video/mvList',
                        component: () => import('@/views/video/mvList/index.vue'),
                    },
                ]
            }
            , {
                path: '/favourite',
                component: () => import('@/views/favourite/index.vue'),
                redirect: '/favourite/favouriteAlbum',
                children: [
                    {
                        name: 'favouriteAlbum',
                        path: '/favourite/favouriteAlbum',
                        component: () => import('@/views/favourite/favouriteAlbum/index.vue'),
                    },
                    {
                        name: 'favouriteSinger',
                        path: '/favourite/favouriteSinger',
                        component: () => import('@/views/favourite/favouriteSinger/index.vue'),
                    },
                    {
                        name: 'favouriteVideo',
                        path: '/favourite/favouriteVideo',
                        component: () => import('@/views/favourite/favouriteVideo/index.vue'),
                    },
                ]
            },
            {
                path: '/dailyRecommend',
                name: 'dailyRecommend',
                component: () => import('@/views/dailyRecommend/index.vue')
            }
            , {
                path: '/search',
                name: 'search',
                component: () => import('@/views/search/index.vue')
            }
            , {
                path: '/musicListDetail',
                name: 'musicListDetail',
                component: () => import('@/views/musicListDetail/index.vue')
            }, {
                path: '/albumDetail',
                name: 'albumDetail',
                component: () => import('@/views/albumDetail/index.vue')
            }, {
                path: '/mvDetail',
                name: 'mvDetail',
                component: () => import('@/views/mvDetail/index.vue')
            }
            , {
                path: '/artistDetail',
                name: 'artistDetail',
                component: () => import('@/views/artistDetail/index.vue')
            }
            , {
                path: '/personal',
                name: 'personal',
                component: () => import('@/views/personal/index.vue'),
                keepAlive: false,
            },
            {
                path: '/personal/follows',
                name: 'follows',
                component: () => import('@/views/personal/follows/index.vue'),
            }
            , {
                path: '/playRecord',
                name: 'playRecord',
                component: () => import('@/views/playRecord/index.vue'),
            }
            , {
                path: '/personal/followeds',
                name: 'followeds',
                component: () => import('@/views/personal/follows/index.vue'),
            },
            {
                path:'/userEvent',
                name:'userEvent',
                component:()=>import('@/views/userEvent/index.vue'),
                children: [
                    {
                        name: 'forwardDetail',
                        path: '/userEvent/forwardDetail',
                        component: () => import('@/views/userEvent/forwardDetail/index.vue'),
                    }
                ]
            }
        ]
    }]
const router = createRouter({
    routes,
    history: createWebHistory()// createWebHashHistory URL带#，createWebHistory URL不带#
})
export default router
