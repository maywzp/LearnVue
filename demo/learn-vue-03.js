// watcher 类的实现
class Watcher {
  constructor(obj, key, cb) {
    this.obj = obj
    this.getter = key
    this.cb = cb
    this.dep = null
    this.val = this.get()
  }

  get() {
    Dep.target = this
    // 此处调用 ojb 的 get 方法，同时注入依赖
    const val = this.obj[this.getter]
    Dep.target = null
    return val
  }

  update() {
    const val = this.obj[this.getter]
    const oldVal = this.val
    this.val = val
    this.cb.call(this.obj, val, oldVal)
  }

  addDep(dep) {
    this.dep = dep
  }
}

// 改进 Dep 类
class Dep {
  constructor() {
    this.subs = []
  }

  addSubs(sub) {
    this.subs.push(sub)
  }

  removeSubs(sub) {
    const index = this.subs.indexOf(sub)
    if (index > -1) {
      this.subs.splice(index, 1)
    }
  }

  notify(newVal, oldVal) {
    this.subs.forEach(watcher => watcher.update())
  }
}

Dep.target = null

// 改进 defineReactive 函数
const defineReactive = function (obj, key, val) {
  const dep = new Dep()
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get() {
      if (Dep.target) {
        dep.addSubs(Dep.target)
        // 添加 Watcher 对 dep 的引用
        Dep.target.addDep(dep)
      }
      return val
    },
    set(newVal) {
      if (newVal !== val) {
        val = newVal
        // 不需要传入参数
        dep.notify()
      }
    }
  })
}

// defineReactive 函数的调用
const obj = {}
defineReactive(obj, 'name', 'jack')

obj.name
// jack

const watcher1 = new Watcher(obj, 'name', (newValue, oldValue) =>
console.log('添加的第一个 watch 函数，新值为：' + newValue))
obj.name = 'ross'
obj.name
// 添加的第一个 watch 函数，新值为：ross
// ross

const watcher2 = new Watcher(obj, 'name', (newValue, oldValue) =>
console.log('添加的第二个 watch 函数，新值为：' + newValue))
obj.name = 'titanic'
obj.name
// 添加的第一个 watch 函数，新值为：titanic
// 添加的第二个 watch 函数，新值为：titanic
// titanic

// 移除 watcher2
watcher2.dep.removeSubs(watcher2)
obj.name = 'boom'
// 添加的第一个 watch 函数，新值为：boom
