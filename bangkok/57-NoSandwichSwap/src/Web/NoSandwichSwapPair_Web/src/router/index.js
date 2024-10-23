import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Trade from '../views/Trade.vue';
import Document from '../views/Document.vue';
import Introduction_1 from '../components/documents/Introduction_1.vue';
import Introduction_2 from '../components/documents/Introduction_2.vue';
import Team_1 from '../components/documents/Team_1.vue';
import Team_2 from '../components/documents/Team_2.vue';
import Team_3 from '../components/documents/Team_3.vue';
import Team_4 from '../components/documents/Team_4.vue';
import Team_5 from '../components/documents/Team_5.vue';
import Team_6 from '../components/documents/Team_6.vue';

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home,
    },
    {
        path: '/trade',
        name: 'trade',
        component: Trade,
    },
    {
        path: '/document',
        name: 'document',
        component: Document,
        redirect: '/document/section/1/1',
        children: [
            {
                path: 'section/1/1',
                component: Introduction_1, // 局部更新到router-view
            },
            {
                path: 'section/1/2',
                component: Introduction_2, // 局部更新到router-view
            },
            {
                path: 'section/2/1',
                component: Team_1, // 局部更新到router-view
            },
            {
                path: 'section/2/2',
                component: Team_2, // 局部更新到router-view
            },
            {
                path: 'section/2/3',
                component: Team_3, // 局部更新到router-view
            },
            {
                path: 'section/2/4',
                component: Team_4, // 局部更新到router-view
            },
            {
                path: 'section/2/5',
                component: Team_5, // 局部更新到router-view
            },
            {
                path: 'section/2/6',
                component: Team_6, // 局部更新到router-view
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
