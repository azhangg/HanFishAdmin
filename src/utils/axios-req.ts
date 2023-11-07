import axios from 'axios'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import { useBasicStore } from '@/store/basic'

//使用axios.create()创建一个axios请求实例
const service = axios.create()
let loadingInstance: any = null //loading实例
let tempReqUrlSave = ''
let authorTipDoor = true

const noAuthDill = (msg = '请重新登录') => {
  authorTipDoor = false
  ElMessageBox.confirm(msg, {
    confirmButtonText: '请重新登录',
    closeOnClickModal: false,
    showCancelButton: false,
    showClose: false,
    type: 'warning'
  }).then(() => {
    useBasicStore().resetStateAndToLogin()
    authorTipDoor = true
  })
}

//请求前拦截
service.interceptors.request.use(
  (req: any) => {
    const { token, axiosPromiseArr }: any = useBasicStore()
    //axiosPromiseArr收集请求地址,用于取消请求
    req.cancelToken = new axios.CancelToken((cancel) => {
      tempReqUrlSave = req.url
      axiosPromiseArr.push({
        url: req.url,
        cancel
      })
    })

    //设置token到header
    if (token) req.headers['Authorization'] = token
    //如果req.method给get 请求参数设置为 ?name=xxx
    if ('get'.includes(req.method?.toLowerCase()) && !req.params) req.params = req.data

    //req loading
    // @ts-ignore
    if (req.reqLoading ?? true) {
      loadingInstance = ElLoading.service({
        lock: true,
        fullscreen: true,
        // spinner: 'CircleCheck',
        text: '数据载入中...',
        background: 'rgba(0, 0, 0, 0.1)'
      })
    }
    return req
  },
  (err) => {
    //发送请求失败
    Promise.reject(err)
  }
)
//请求后拦截
service.interceptors.response.use(
  (res: any) => {
    //取消请求
    useBasicStore().remotePromiseArrByReqUrl(tempReqUrlSave)
    if (loadingInstance) {
      loadingInstance && loadingInstance.close()
    }
    //download file
    if (res.data?.type?.includes('sheet')) {
      return res
    }

    const { isSuccess, message, data } = res.data

    const noAuthCode = [401, 403]
    if (isSuccess) {
      return data
    } else {
      //authorTipDoor 防止多个请求 多次alter
      if (authorTipDoor) {
        if (noAuthCode.includes(res.status)) {
          noAuthDill()
        } else {
          // @ts-ignore
          if (!isSuccess) {
            ElMessage.error({
              message: message,
              duration: 2 * 1000
            })
          } else {
            return res
          }
          return Promise.reject(message)
        }
      }
    }
  },
  //响应报错
  (err) => {
    //取消请求
    useBasicStore().remotePromiseArrByReqUrl(tempReqUrlSave)
    if (loadingInstance) {
      loadingInstance && loadingInstance.close()
    }
    ElMessage.error({
      message: err,
      duration: 2 * 1000
    })
    if (err.response.status === 401) noAuthDill(err)
    return Promise.reject(err)
  }
)

//导出service实例给页面调用 , config->页面的配置
export default function axiosReq(config) {
  return service({
    baseURL: import.meta.env.VITE_APP_BASE_URL,
    timeout: 8000,
    ...config
  })
}

export const httpPostByParams = (url: string, params) => {
  return axiosReq({
    url: `/api${url}`,
    method: 'post',
    params: { ...params }
  })
}

export const httpPost = (url: string, data) => {
  return axiosReq({
    url: `/api${url}`,
    method: 'post',
    data: { ...data }
  })
}

export const httpGet = (url, params?) => {
  return axiosReq({
    url: `/api${url}`,
    method: 'get',
    params: { ...params }
  })
}
