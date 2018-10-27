import React, { Component } from 'react';
import PropTypes from 'prop-types';

const childrenPropTypes = PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
]);

const isFunction = fn => typeof fn === 'function';

const renderChildren = (children, ...rest) => {
    if (isFunction(children)) {
        return children(...rest);
    }

    return children;
};

const { Consumer, Provider } = React.createContext();

export const Status = {
    Pending: 'pending',
    Resolved: 'resolved',
    Rejected: 'rejected',
};

const createTask = (task) => {
    let id = 0;

    class AsyncTask extends Component {
        static propTypes = {
            children: childrenPropTypes,
            data: PropTypes.any,
        };

        mounted = false;

        state = {
            data: null,
            error: null,
            status: Status.Pending,
        };

        componentDidMount() {
            this.mounted = true;

            const { data } = this.props;

            this.runTask(data);
        }

        shouldComponentUpdate({ data: newData }, { status: newStatus }) {
            const { data } = this.props;
            const { status } = this.state;

            if (status !== newStatus) {
                return true;
            }

            if (data !== newData) {
                this.runTask(newData);
            }

            return false;
        }

        componentWillUnmount() {
            this.mounted = false;
        }

        onResolved = taskId => (data) => {
            if (this.mounted && id === taskId) {
                this.setState({
                    data,
                    status: Status.Resolved,
                });
            }
        }

        onRejected = taskId => (error) => {
            if (this.mounted && id === taskId) {
                this.setState({
                    error,
                    status: Status.Rejected,
                });
            }
        }

        runTask(data) {
            id += 1;

            const { status } = this.state;
            if (status !== Status.Pending) {
                this.setState({
                    error: null,
                    data: null,
                    status: Status.Pending,
                });
            }

            Promise.resolve(task(data))
                .then(this.onResolved(id))
                .catch(this.onRejected(id));
        }

        render() {
            const { children } = this.props;

            if (children) {
                return (
                    <Provider value={this.state}>
                        {renderChildren(children, this.state)}
                    </Provider>
                );
            }

            return null;
        }
    }

    AsyncTask.Pending = ({ children }) => (
        <Consumer>
            {({ status }) => {
                if (status === Status.Pending) {
                    return renderChildren(children);
                }
                return null;
            }}
        </Consumer>
    );
    AsyncTask.Pending.propTypes = {
        children: childrenPropTypes,
    };

    AsyncTask.Resolved = ({ children }) => (
        <Consumer>
            {({ status, data }) => {
                if (status === Status.Resolved) {
                    return renderChildren(children, data);
                }
                return null;
            }}
        </Consumer>
    );
    AsyncTask.Resolved.propTypes = {
        children: childrenPropTypes,
    };

    AsyncTask.Rejected = ({ children }) => (
        <Consumer>
            {({ status, error }) => {
                if (status === Status.Rejected) {
                    return renderChildren(children, error);
                }
                return null;
            }}
        </Consumer>
    );
    AsyncTask.Rejected.propTypes = {
        children: childrenPropTypes,
    };

    return AsyncTask;
};

export default createTask;
