import React, { Component } from 'react';
import PropTypes from 'prop-types';

const isFunction = fn => typeof fn === 'function';
const { Consumer, Provider } = React.createContext();

const STATUS = {
    Loading: 'loading',
    Resolved: 'resolved',
    Rejected: 'rejected',
};

const createTask = (task) => {
    let id = 0;

    class AsyncTask extends Component {
        static propTypes = {
            children: PropTypes.node,
        };

        mounted = false;

        state = {
            data: null,
            error: null,
            status: STATUS.Loading,
        };

        componentDidMount() {
            this.mounted = true;
            this.runTask();
        }

        componentWillUnmount() {
            this.mounted = false;
        }

        onResolved = taskId => (data) => {
            if (this.mounted && id === taskId) {
                this.setState({
                    data,
                    status: STATUS.Resolved,
                });
            }
        }

        onRejected = taskId => (error) => {
            if (this.mounted && id === taskId) {
                this.setState({
                    error,
                    status: STATUS.Rejected,
                });
            }
        }

        runTask() {
            id += 1;

            Promise
                .resolve()
                .then(() => task(this.props))
                .then(this.onResolve(id))
                .catch(this.onReject(id));
        }

        render() {
            const { children } = this.props;

            if (isFunction(children)) {
                return <Provider value={this.state}>{children(this.state)}</Provider>;
            }

            if (children) {
                return <Provider value={this.state}>{children}</Provider>;
            }

            return null;
        }
    }

    AsyncTask.Loading = ({ children }) => (
        <Consumer>
            {({ status }) => {
                if (status === STATUS.Loading) {
                    return isFunction(children) ? children() : children;
                }
                return null;
            }}
        </Consumer>
    );
    AsyncTask.Loading.propTypes = {
        children: PropTypes.node,
    };


    AsyncTask.Resolved = ({ children }) => (
        <Consumer>
            {({ status, data }) => {
                if (status === STATUS.Resolved) {
                    return isFunction(children) ? children(data) : children;
                }
                return null;
            }}
        </Consumer>
    );
    AsyncTask.Resolved.propTypes = {
        children: PropTypes.node,
    };

    AsyncTask.Rejected = ({ children }) => (
        <Consumer>
            {({ status, error }) => {
                if (status === STATUS.Rejected) {
                    return isFunction(children) ? children(error) : children;
                }
                return null;
            }}
        </Consumer>
    );
    AsyncTask.Rejected.propTypes = {
        children: PropTypes.node,
    };

    return AsyncTask;
};

export default createTask;
