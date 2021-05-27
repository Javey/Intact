export type SetOptions = {
    silent: boolean
    // async: false
}

export type UnknownKey<T> = Exclude<string, keyof T>

export type WithUnknownKey<T, U> = Partial<T> & U

export type InjectionKey = string | symbol
