import {isString, isNumber, isObject} from 'intact-shared';

type Fiber = any;

let internalInstanceKey: string;
let internalPropsKey: string;

export function precacheFiberNode(node: Element, placeholder: Element): Fiber {
    if (!internalInstanceKey) {
        const keys = Object.keys(placeholder);
        internalInstanceKey = keys[0]; 
        internalPropsKey = keys[1];
    }

    const fiber = (placeholder as any)[internalInstanceKey];
    (node as any)[internalInstanceKey] = fiber;

    return fiber;
}

export function updateFiberProps(node: Element, placeholder: Element) {
    (node as any)[internalPropsKey] = (placeholder as any)[internalPropsKey];
}

export let listeningMarker: string;

const bind = Function.prototype.bind;
// retrieve from react definition
const IS_EVENT_HANDLE_NON_MANAGED_NODE = 1;
const IS_NON_DELEGATED = 2;
Function.prototype.bind = function(...args: any[]) {
    const [obj, domEventName, eventSystemFlags, targetContainer, nativeEvent] = args;
    if (obj === null && isString(domEventName) && isNumber(eventSystemFlags) && targetContainer instanceof Element) {
        let isReactListening = false;
        if (!listeningMarker) {
            const keys = Object.keys(targetContainer);
            const key = keys.find(key => key.startsWith('_reactListening'));
            if (key) {
                listeningMarker = key;
                isReactListening = true;
            } else {
                isReactListening = false;
            }
        } else {
            isReactListening = (targetContainer as any)[listeningMarker] && nativeEvent instanceof Event;
        }

        if (isReactListening && (eventSystemFlags & IS_EVENT_HANDLE_NON_MANAGED_NODE) === 0 && (eventSystemFlags & IS_NON_DELEGATED) === 0) {
            /**
             * Because we only add listeners to the react root container, the comment root container in Wrapper will ignore doing this.
             * But React will check the container (isMatchingRootContainer). it will always return false since the comment parentNode is not
             * the targetContainer. Therefore, we fake the parentNode by returning the targetContainer to skip the check in React.
             * Eventually we restore the value after calling the function.
             */
            const _fn = this;
            const fn = (name: string, eventSystemFlags: number, targetContainer: HTMLElement, nativeEvent: Event) => {
                const targetInst = getClosestInstanceFromNode(nativeEvent.target);
                const commentRoot = getCommentRoot(targetInst);
                let containerInfo: any;
                if (commentRoot) {
                    containerInfo = commentRoot.stateNode.containerInfo;
                    commentRoot.stateNode.containerInfo = targetContainer;
                }

                const ret = _fn(name, eventSystemFlags, targetContainer, nativeEvent);

                if (commentRoot) {
                    commentRoot.stateNode.containerInfo = containerInfo; 
                }

                return ret;
            };
            return bind.call(fn, null, domEventName, eventSystemFlags, targetContainer, nativeEvent);
        }
    }
    return bind.call(this, ...(args as [any]));
}

function getClosestInstanceFromNode(targetNode: any) {
  var targetInst = targetNode[internalInstanceKey];

  if (targetInst) {
    // Don't return HostRoot or SuspenseComponent here.
    return targetInst;
  } // If the direct event target isn't a React owned DOM node, we need to look
  // to see if one of its parents is a React owned DOM node.


  var parentNode = targetNode.parentNode;

  while (parentNode) {
    targetInst = parentNode[internalInstanceKey];

    if (targetInst) {
      return targetInst;
    }

    targetNode = parentNode;
    parentNode = targetNode.parentNode;
  }

  return null;
}

function getCommentRoot(targetInst: any) {
    let node = targetInst;
    while (true) {
        if (node === null) return;

        const nodeTag = node.tag;
        if (nodeTag === 3 /* HostRoot */) {
            return node;
        }

        node = node.return;
    }
}
