export function deepProxy<T extends object>(target: T, handler: ProxyHandler<any>): T {
  const cache = new WeakMap();

  const wrap = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (cache.has(obj)) return cache.get(obj);

    const proxy = new Proxy(obj, {
      get(target, prop, receiver) {
        if (target instanceof Element || target instanceof HTMLElement || target instanceof Node) {
          return target[prop];
        } else {
          const result = Reflect.get(target, prop, receiver);
          return wrap(result); // 递归包装子对象
        }
      },
      set(target, prop, value, receiver) {
        const old = target[prop];
        const newValue = wrap(value);
        const result = Reflect.set(target, prop, newValue, receiver);
        handler.set?.(target, prop, newValue, receiver);
        return result;
      },
      ...handler,
    });

    cache.set(obj, proxy);
    return proxy;
  };

  return wrap(target);
}

export function observeArray<T extends any[]>(arr: T, onChange: (info: any) => void): T {
  return new Proxy(arr, {
    get(target, prop, receiver) {
      let value;
      if (target instanceof Element || target instanceof HTMLElement || target instanceof Node) {
        value = target[prop];
      } else {
        value = Reflect.get(target, prop, receiver);
      }
      // 拦截方法调用，比如 push/pop
      if (typeof value === 'function') {
        return (...args: any[]) => {
          const result = value.apply(target, args);
          onChange({ method: prop, args, target: [...target] });
          return result;
        };
      }
      return value;
    },
    set(target, prop, value, receiver) {
      const result = Reflect.set(target, prop, value, receiver);
      onChange({ method: 'set', prop, value, target: [...target] });
      return result;
    },
  });
}
