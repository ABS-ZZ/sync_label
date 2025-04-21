import { createRouter, createWebHistory} from "vue-router";

import HomeView from "../pages/HomeView.vue";
import Annotation from "../layouts/annotation/index.vue";

const routes = [
    {
        path: '/',
        redirect: { name: 'home' }
    },
    {
        name: 'home',
        path: '/home',
        component: HomeView,
        redirect: { name: 'annotation' },
        children: [ 
            {
                name: 'annotation',
                path: 'annotation',
                component: Annotation
            }
        ],
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// router.beforeResolve ((to) => {
//     const loginStore = useLoginStore()

//     if(!to.meta.isLogin) return true

//     const expiration = loginStore.expirationTime || localStorage.getItem('expirationTime')
//     // console.log(expiration)
//     if(expiration === null || expiration === undefined || expiration === '') {
//         message.error("请先登录账号")
//         return {name: 'login'}
//     }
//     const nowTime = getTimeStamp()
//     const isExpiration = campareTimeStamp(nowTime, expiration)

//     if(isExpiration) {
//         message.warning("账号已过期，请重新登录")
//         return {name: 'login'}
//     }

// })
export default router