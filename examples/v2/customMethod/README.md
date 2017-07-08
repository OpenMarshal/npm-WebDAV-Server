# Custom method

This is an example to show how to make a custom method.

This example focus on the `TRACE` method, to send to a remote user all actions to a resource or its children.
It uses the headers `Trace-Depth`, `Trace-Separator` and `Trace-Method` to customize the answer and the observed resources.

The `ts` file and the `js` file are the same thing. The `js` file displays the example in JavaScript while the `ts` file displays the example in TypeScript.

Note : The methods which can be added are limited to [the supported methods](https://nodejs.org/api/http.html#http_http_methods) in the `http` module.
