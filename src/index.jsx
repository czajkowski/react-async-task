import React, { Component } from 'react';
import PropTypes from 'prop-types';

const isFunction = fn => typeof fn === 'function';
const { Consumer, Provider } = React.createContext();

const createTask = (task) => {
    class AsyncTask extends Component {
        static propTypes = {
            children: PropTypes.node,
        };

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

    AsyncTask.Pending = ({ children }) => {};
    AsyncTask.Loading = ({ children }) => {};
    AsyncTask.Resolved = ({ children }) => {};
    AsyncTask.Rejected = ({ children }) => {};

    return AsyncTask;
};

export default createTask;
