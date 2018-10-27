import React from 'react';
import { render, cleanup, waitForElement } from 'react-testing-library';
import createTask, { Status } from '.';

const createAsyncTestFunction = () => {
    let resolve;
    let reject;

    return {
        fn: jest.fn(() => new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        })),
        resolve: (...args) => {
            if (resolve) {
                resolve(...args);
            }
        },
        reject: (...args) => {
            if (reject) {
                reject(...args);
            }
        },
    };
};

describe('Async Task', () => {
    let Task;
    let taskFunction;
    let resolveTask;
    let rejectTask;
    let childrenSpy;

    beforeEach(() => {
        childrenSpy = jest.fn(a => a);

        ({
            fn: taskFunction,
            resolve: resolveTask,
            reject: rejectTask,
        } = createAsyncTestFunction());

        Task = createTask(taskFunction);
    });

    afterEach(cleanup);

    it('should invoke task function with component props', () => {
        const data = {
            prop1: 1234,
            prop2: 'test',
            prop3: new Date(),
        };

        render(<Task data={data} />);

        expect(taskFunction).toHaveBeenCalledWith(data);
    });

    it('should call task function multiple times when component props change', async () => {
        const { rerender, getByText } = render(<Task data={1} />);
        rerender(<Task data={2} />);
        rerender(<Task data={3} />);
        rerender(<Task data={4}>{({ status }) => status}</Task>);

        resolveTask();

        expect(taskFunction).toHaveBeenCalledWith(1);
        expect(taskFunction).toHaveBeenCalledWith(2);
        expect(taskFunction).toHaveBeenCalledWith(3);
        expect(taskFunction).toHaveBeenCalledWith(4);

        await waitForElement(() => getByText(Status.Resolved));
    });

    describe('passing function as children', () => {
        it('should invoke function when task is pending', async () => {
            const { getByText } = render(<Task>{({ status }) => childrenSpy(status)}</Task>);

            expect(childrenSpy).toHaveBeenCalledTimes(1);

            await waitForElement(() => getByText(Status.Pending));
        });

        it('should invoke function when task is resolved', async () => {
            const { getByText } = render(<Task>{({ status }) => childrenSpy(status)}</Task>);

            resolveTask();

            expect(childrenSpy).toHaveBeenCalledTimes(1);

            await waitForElement(() => getByText(Status.Resolved));
        });

        it('should invoke function when task is Rejected', async () => {
            const { getByText } = render(<Task>{({ status }) => childrenSpy(status)}</Task>);

            rejectTask();

            expect(childrenSpy).toHaveBeenCalledTimes(1);

            await waitForElement(() => getByText(Status.Rejected));
        });

        it('should invoke function each time task is finished or task status changes', async () => {
            const log = [];
            const childrenFunction = (state) => {
                log.push(state);
                return state.data || state.error;
            };

            const { rerender, getByText } = render(<Task data="1">{childrenFunction}</Task>);

            resolveTask('First success');

            await waitForElement(() => getByText('First success'));

            rerender(<Task data="2">{childrenFunction}</Task>);

            resolveTask('Second success');

            await waitForElement(() => getByText('Second success'));

            rerender(<Task data="3">{childrenFunction}</Task>);

            rejectTask('Third failure');

            await waitForElement(() => getByText('Third failure'));

            rerender(<Task data="4">{childrenFunction}</Task>);

            rejectTask('Fourth failure');

            await waitForElement(() => getByText('Fourth failure'));

            rerender(<Task data="5">{childrenFunction}</Task>);

            resolveTask('Final success');

            await waitForElement(() => getByText('Final success')).then(() => {
                expect(log).toEqual([
                    { status: Status.Pending, data: null, error: null },
                    { status: Status.Resolved, data: 'First success', error: null },
                    { status: Status.Pending, data: null, error: null },
                    { status: Status.Resolved, data: 'Second success', error: null },
                    { status: Status.Pending, data: null, error: null },
                    { status: Status.Rejected, data: null, error: 'Third failure' },
                    { status: Status.Pending, data: null, error: null },
                    { status: Status.Rejected, data: null, error: 'Fourth failure' },
                    { status: Status.Pending, data: null, error: null },
                    { status: Status.Resolved, data: 'Final success', error: null },
                ]);
            });
        });
    });

    describe('using status components', () => {
        it('should render component when task is pending', async () => {
            const { getByText } = render((
                <Task>
                    <Task.Pending>
                        {Status.Pending}
                    </Task.Pending>
                </Task>
            ));

            await waitForElement(() => getByText(Status.Pending));
        });

        it('should render component when task is resolved', async () => {
            const { getByText } = render((
                <Task>
                    <Task.Resolved>
                        {data => `${Status.Resolved}: ${data}`}
                    </Task.Resolved>
                </Task>
            ));

            resolveTask('We did it!');

            await waitForElement(() => getByText(`${Status.Resolved}: We did it!`));
        });

        it('should render component when task is rejected', async () => {
            const { getByText } = render((
                <Task>
                    <Task.Rejected>
                        {error => `${Status.Rejected}: ${error}`}
                    </Task.Rejected>
                </Task>
            ));

            rejectTask('A... not this time!');

            await waitForElement(() => getByText(`${Status.Rejected}: A... not this time!`));
        });

        it('should render component each time task is finished or task status changes', async () => {
            const log = [];
            const testMarkup = testData => (
                <Task data={testData}>
                    <Task.Pending>
                        {() => {
                            log.push({ status: Status.Pending });
                            return Status.Pending;
                        }}
                    </Task.Pending>
                    <Task.Resolved>
                        {(data) => {
                            log.push({ status: Status.Resolved, data });
                            return data;
                        }}
                    </Task.Resolved>
                    <Task.Rejected>
                        {(error) => {
                            log.push({ status: Status.Rejected, error });
                            return error;
                        }}
                    </Task.Rejected>
                </Task>
            );


            const { rerender, getByText } = render(testMarkup(1));

            resolveTask('First success');

            await waitForElement(() => getByText('First success'));

            rerender(testMarkup(2));

            resolveTask('Second success');

            await waitForElement(() => getByText('Second success'));

            rerender(testMarkup(3));

            rejectTask('Third failure');

            await waitForElement(() => getByText('Third failure'));

            rerender(testMarkup(4));

            rejectTask('Fourth failure');

            await waitForElement(() => getByText('Fourth failure'));

            rerender(testMarkup(5));

            resolveTask('Final success');

            await waitForElement(() => getByText('Final success')).then(() => {
                expect(log).toEqual([
                    { status: Status.Pending },
                    { status: Status.Resolved, data: 'First success' },
                    { status: Status.Pending },
                    { status: Status.Resolved, data: 'Second success' },
                    { status: Status.Pending },
                    { status: Status.Rejected, error: 'Third failure' },
                    { status: Status.Pending },
                    { status: Status.Rejected, error: 'Fourth failure' },
                    { status: Status.Pending },
                    { status: Status.Resolved, data: 'Final success' },
                ]);
            });
        });
    });
});
