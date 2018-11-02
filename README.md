# React Async Task &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/czajkowski/react-async-task/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/react-async-task.svg?style=flat)](https://www.npmjs.com/package/react-async-task)

A React component for handling asynchronous tasks.

This is based on [React Async](https://github.com/ghengeveld/react-async). Go check it out if you need something more refined.

## Usage

### Using status components

```javasctipt
import React, { Component } from "react";
import ReactDOM from "react-dom";
import createTask from "react-async-task";

const task = ({ time, outcome, message }) =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      const outcomeFunction = {
        resolve,
        reject
      }[outcome];

      outcomeFunction && outcomeFunction(message);
    }, time)
  );

const AsyncTask = createTask(task);

class App extends Component {
  state = {
    time: 2000,
    outcome: "resolve",
    message: "Initial success"
  };

  resolveTask = () => {
    this.setState({
      outcome: "resolve",
      message: "We did it!"
    });
  };

  rejectTask = () => {
    this.setState({
      outcome: "reject",
      message: "Something went wront!"
    });
  };

  render() {
    return (
      <div>
        <AsyncTask data={this.state}>
          <AsyncTask.Pending>
            <div>Status: pending</div>
          </AsyncTask.Pending>
          <AsyncTask.Resolved>
            {data => (
              <div>
                <div>Status: resolved</div>
                <div>{`Message: ${data}`}</div>
              </div>
            )}
          </AsyncTask.Resolved>
          <AsyncTask.Rejected>
            {error => (
              <div>
                <div>Status: rejected</div>
                <div>{`Error: ${error}`}</div>
              </div>
            )}
          </AsyncTask.Rejected>
        </AsyncTask>
        <button onClick={this.resolveTask}>Resolve task</button>
        <button onClick={this.rejectTask}>Reject task</button>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

### Using a function passed as a child

```javascript
import React, { Component } from "react";
import ReactDOM from "react-dom";
import createTask from "react-async-task";

const task = ({ time, outcome, message }) =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      const outcomeFunction = {
        resolve,
        reject
      }[outcome];

      outcomeFunction && outcomeFunction(message);
    }, time)
  );

const AsyncTask = createTask(task);

class App extends Component {
  state = {
    time: 2000,
    outcome: "resolve",
    message: "Initial success"
  };

  resolveTask = () => {
    this.setState({
      outcome: "resolve",
      message: "We did it!"
    });
  };

  rejectTask = () => {
    this.setState({
      outcome: "reject",
      message: "Something went wront!"
    });
  };

  render() {
    return (
      <div>
        <AsyncTask data={this.state}>
          {({ data, error, status }) => (
            <div>
              <div>{`Status: ${status}`}</div>
              {data && <div>{`Message: ${data}`}</div>}
              {error && <div>{`Error: ${error}`}</div>}
            </div>
          )}
        </AsyncTask>
        <button onClick={this.resolveTask}>Resolve task</button>
        <button onClick={this.rejectTask}>Reject task</button>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```