// 通常增加一个对象的属性
const obj = {}
obj.name = 'jack'

// 使用 Object.defineProperty 增加属性
const obj = {}
let name = 'jack'
Object.defineProperty(obj, 'name', {
  configurable: true, // 该属性是否可修改，默认值：false
  enumerable: true, // 该属性是否能遍历，默认值：false
  get() {
    return name
  },
  set(newValue) {
    name = newValue
  }
})

// defineProperty 函数封装
const callback = {
  target: null
}

const defineProperty = function(object, key, value, cb) {
  let array = []
  Object.defineProperty(object, key, {
    configurable: true,
    enumerable: true,
    get() {
      // 依赖收集
      if (callback.target) {
        array.push(callback.target)
      }
      return value
    },
    set(newValue) {
      if (newValue !== value) {
        // 触发事件
        array.forEach(func => func(newValue, value))
      }
      value = newValue
    }
  })
}

// defineProperty 函数的调用
const obj = {}
defineProperty(obj, 'name', 'jack')

callback.target = (newValue, oldValue) =>
  console.log('第一个依赖函数，新值为：' + newValue)
obj.name
// jack

callback.target = (newValue, oldValue) =>
  console.log('第二个依赖函数，新值为：' + newValue)
obj.name = 'ross'
obj.name
// 第一个依赖函数，新值为：ross
// ross

obj.name = 'titanic'
obj.name
// 第一个依赖函数，新值为：titanic
// 第二个依赖函数，新值为：titanic
// titanic

// Vue 中将 data 变为可观察 (observable) 的
const observable = (obj, cb) => {
  Object.keys(obj).forEach(k => defineReactive(obj, k, obj[k], cb))
}

const defineReactive = (obj, key, val, cb) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get() {
      // 依赖收集
    },
    set(newValue) {
      // 通知订阅者触发视图更新
      cb()
    }
  })
}

class Vue {
  constructor(ops) {
    this._data = ops.data
    observable(this._data, ops.render)
  }
}

const app = new Vue({
  el: '#app',
  data: {
    name: 'jack'
  },
  render() {
    console.log('视图更新')
  }
})

// 代理函数，将 data 里的属性移植到 vue实例中去，采用 app.name 这种方式触发 set，而非 app._data.name
function _proxy(data) {
  const that = this
  Object.keys(data).forEach(key => {
    Object.defineProperty(that, key, {
      configurable: true,
      enumerable: true,
      get: function proxyGetter() {
        return that._data[key]
      },
      set: function proxySetter(newValue) {
        that._data[key] = newValue
      }
    })
  })
}

// _proxy 函数的使用
class Vue {
  constructor(ops) {
    this._data = ops.data
    _proxy(ops.data)
    observable(this._data, ops.render)
  }
}