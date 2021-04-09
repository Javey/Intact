import {Component} from '../core/component';
import {ComponentConstructor, ComponentFunction, VNodeProps, TypeDefs} from '../utils/types';
import {createVNode as h} from '../core/vnode'; 
import {isNullOrUndefined} from '../utils/helpers';
import {className, nextFrame} from './heplers';
import {onEnter} from './common';

export type AnimateTag = string | ComponentConstructor | ComponentFunction

export type AnimateProps<T extends AnimateTag = string> = {
    tag?: AnimateTag 
    transition?: string
    appear?: boolean
    mode?: 'both' | 'in-out' | 'out-in' 
    disabled?: boolean
    move?: boolean
    show?: boolean
    props?: VNodeProps<T>
}

export class Animate<T extends AnimateTag = string> extends Component<AnimateProps<T>> {
    static template(this: Animate) {
        const {tag, props, children} = this.get();

        const newProps = {...props};
        newProps.className = className({
            [newProps.className as string]: newProps.className,
            ...this.classNames
        });

        return h(tag!, newProps, children);
    };

    static typeDefs: TypeDefs<AnimateProps> = {
        tag: [String, Function],
        transition: String,
        appear: Boolean,
        mode: ['both', 'in-out', 'out-in'],
        disabled: Boolean,
        move: Boolean,
        show: Boolean,
        props: Object,
    };

    public classNames: Record<string, boolean> = {}

    defaults(): AnimateProps<T> {
        return {
            tag: 'div',
            transition: 'animate',
            appear: false,
            mode: 'both',
            disabled: false,
            move: true,
            show: true,
        };
    }

    mounted() {
        onEnter(this);
    }
}
