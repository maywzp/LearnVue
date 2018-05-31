// 封装 Dep 函数，实现依赖管理
class Dep {
  // static target = null

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
    this.subs.forEach(func => func(newVal, oldVal))
  }
}

Dep.target = null

// 对 defineReactive 函数进行改进
const defineReactive = function (obj, key, val) {
  const dep = new Dep()
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get() {
      if (Dep.target) {
        dep.addSubs(Dep.target)
      }
      return val
    },
    set(newVal) {
      if (newVal !== val) {
        dep.notify(newVal, val)
      }
      val = newVal
    }
  })
}

// defineReactive 函数的调用
const obj = {}
defineReactive(obj, 'name', 'jack')

Dep.target = (newValue, oldValue) =>
  console.log('第一个依赖函数，新值为：' + newValue)
obj.name
// jack

Dep.target = (newValue, oldValue) =>
  console.log('第二个依赖函数，新值为：' + newValue)
obj.name = 'ross'
obj.name
// 第一个依赖函数，新值为：ross
// ross

Dep.target = null
obj.name = 'titanic'
obj.name
// 第一个依赖函数，新值为：titanic
// 第二个依赖函数，新值为：titanic
// titanic
