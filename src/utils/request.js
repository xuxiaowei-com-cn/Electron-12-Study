import axios from 'axios'
import {ElMessage} from 'element-plus'

// create an axios instance
const service = axios.create({
    baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
    // withCredentials: true, // 跨域请求时发送cookies
    timeout: 5000 // 请求超时
})

// request interceptor
service.interceptors.request.use(
    config => {
        // 在发送请求之前做一些事情

        // 让每个请求都携带令牌
        // ['X-Token'] 自定义 headers key
        // 请根据实际情况修改
        config.headers['X-Token'] = ''

        return config
    },
    error => {
        // 做一些请求错误的事情
        console.log(error) // 用于调试
        return Promise.reject(error)
    }
)

// response interceptor
service.interceptors.response.use(
    /**
     * 如果你想获取http信息，比如 headers 或者 status 请返回 response => response
     */

    /**
     * 通过自定义代码确定请求状态
     * 这里只是一个例子
     * 也可以通过 HTTP Status Code 判断状态
     */
    response => {
        const res = response.data

        // 如果自定义代码不是20000，则判断为错误。
        if (res.code !== 20000) {
            ElMessage({
                message: res.message || 'Error',
                type: 'error',
                duration: 5 * 1000
            })

            // 50008: 非法令牌; 50012: 其他客户登录; 50014: 令牌过期;
            if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
                // 重新登录
                this.$confirm('您已退出，您可以取消停留在此页面，或重新登录', '确认退出', {
                    confirmButtonText: '重新登录',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // 重置 Token
                    location.reload()
                })
            }
            return Promise.reject(new Error(res.message || 'Error'))
        } else {
            return res
        }
    },
    error => {
        console.log('err' + error) // 用于调试
        ElMessage({
            message: error.message,
            type: 'error',
            duration: 5 * 1000
        })
        return Promise.reject(error)
    }
)

export default service
