export type ChangeTrace = {path: string, newValue: any, oldValue: any};

export type SetOptions = {
    silent: boolean
    // async: false
}

export type UnknownKey<T> = Exclude<string, keyof T>

export type WithUnknownKey<T, U> = Partial<T> & U
