function createTextNode(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        const isTextNode =
          typeof child === 'string' || typeof child === 'number';

        return isTextNode ? createTextNode(child) : child;
      }),
    },
  };
}

function render(el, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el],
    },
  };

  root = nextWorkOfUnit;
}

function createDom(work) {
  return work.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(work.type);
}

function updateProps(dom, nextProps, prevProps = {}) {
  Object.keys(prevProps).forEach((key) => {
    if (key !== 'children') {
      if (!(key in nextProps)) {
        dom.removeAttribute(key);
      }
    }
  });

  Object.keys(nextProps).forEach((key) => {
    if (key !== 'children') {
      if (prevProps[key] === nextProps[key]) return;

      if (key.startsWith('on')) {
        const eventType = key.slice(2).toLowerCase();
        dom.removeEventListener(eventType, prevProps[key]);
        dom.addEventListener(eventType, nextProps[key]);
      } else {
        dom[key] = nextProps[key];
      }
    }
  });
}

function initChildren(fiber, children) {
  let oldFiber = fiber.alternate?.child;
  let prevSibling = null;

  children.forEach((child, i) => {
    const isSameType = oldFiber && child.type === oldFiber.type;

    let newFiber;
    if (isSameType) {
      newFiber = {
        dom: oldFiber.dom,
        child: null,
        sibling: null,
        parent: fiber,
        type: child.type,
        props: child.props,
        effectTag: 'UPDATE',
        alternate: oldFiber,
      };
    } else {
      newFiber = {
        dom: null,
        child: null,
        sibling: null,
        parent: fiber,
        type: child.type,
        props: child.props,
        effectTag: 'PLACEMENT',
      };
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (i === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
  });
}

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)];
  initChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber));
    updateProps(dom, fiber.props);
  }
  initChildren(fiber, fiber.props.children);
}

function performWorkOfUnit(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
}

function commitRoot() {
  commitWork(root.child);
  currentRoot = root;
  root = null;
}

function commitWork(fiber) {
  if (!fiber) return;

  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom) {
    fiberParent.dom.append(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE') {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

let root = null;
let currentRoot = null;
let nextWorkOfUnit = null;
function workLoop(deadline) {
  let shouldYield = false;

  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextWorkOfUnit && root) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);

function update() {
  nextWorkOfUnit = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,
  };

  root = nextWorkOfUnit;
}

const React = {
  render,
  createElement,
  update,
};

export default React;
