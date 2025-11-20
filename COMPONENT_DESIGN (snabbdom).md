This repository relies on snabbdom (hopefully supporting other libraries too)
in order to drive the lifecycle of its events.

This means that the core Datasheet component returns a snabbdom vnode. Because
of the virtual dom, however, it's still possible to achieve strong performance
even with a "controlled component" style.

The desired API of the Datasheet is that it feels a lot like an html component.
In virtual dom libraries, you can specify the exact state of a component through
props, and the virtual dom will declaratively update the component state to 
match, usually with minimal churn of html elements.

This is well supported here -- you simply provide two arguments, `state` and 
`on`, with the current state of the Datasheet in the first param and any event
listeners you need in the second param.     