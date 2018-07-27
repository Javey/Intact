export default function checkMode(o) {
    const mountChildren = [];
    const updateChildren = [];
    const unmountChildren = [];

    const children = o.children = o.children.filter(instance => {
        if (instance._delayEnter) {
            instance._delayEnter = false;
            mountChildren.push(instance);

            return false;
        } else if (instance._delayLeave) {
            instance._delayLeave = false;
            unmountChildren.push(instance);

            return true;
        } else if (instance._leaving !== false) {
            updateChildren.push(instance);

            return true;
        }

        return false;
    });

    o._beforeUpdate();

    mountChildren.forEach(instance => {
        instance.element.style.display = '';
        instance.position = null;
    });

    o.mountChildren = mountChildren;
    o.updateChildren = updateChildren;
    o.unmountChildren = unmountChildren;
    o.children = children.concat(mountChildren);

    o._update(null, null, true);
}
