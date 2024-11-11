import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { AppDispatch, RootState } from '../app/store';
import { addTodo, fetchTodoApp, toggleTodo, deleteTodo } from './todoSlice';

const Todo = () => {
    const dispatch: AppDispatch = useDispatch();
    const todos = useSelector((state: RootState) => state.todos.todoApp);
    const loading = useSelector((state: RootState) => state.todos.isloading);

    const [newTodo, setNewTodo] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchTodoApp());
    }, [dispatch]);

    const handleAddTodo = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newTodo.trim()) {
            setErrorMessage('The task cannot be empty!');
            return;
        }

        setErrorMessage('');
        dispatch(addTodo(newTodo));
        setNewTodo('');
    };

    const handleToggleTodo = (id: string) => {
        dispatch(toggleTodo(id));
    };

    const handleDeleteTodo = async (id: string) => {
        setDeletingId(id);
        try {
            await dispatch(deleteTodo(id));
        } catch (error) {
            console.error('Failed to delete todo:', error);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="container">
            <h1>TODO List</h1>

            <form onSubmit={handleAddTodo} className="mb-3">
                <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Enter new task"
                    className="form-control"
                />
                <button
                    type="submit"
                    className="btn btn-primary mt-2"
                    disabled={loading || !newTodo.trim()}
                >
                    {loading ? 'Adding...' : 'Add Task'}
                </button>
            </form>

            {errorMessage && (
                <div className="alert alert-danger mt-2" role="alert">
                    {errorMessage}
                </div>
            )}

            {loading ? (
                <p>Loading tasks...</p>
            ) : (
                <>
                    {todos.length === 0 ? (
                        <p>No tasks available. Please add a new task.</p>
                    ) : (
                        <ul className="list-group">
                            {todos.map((todo) => (
                                <li
                                    key={todo.id}
                                    className="list-group-item d-flex justify-content-between align-items-center"
                                >
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={todo.status}
                                            onChange={() => handleToggleTodo(todo.id)}
                                        />
                                        <label className="form-check-label">
                                            {todo.title}
                                        </label>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteTodo(todo.id)}
                                        className="btn btn-danger btn-sm"
                                        disabled={deletingId === todo.id || !todo.status}
                                    >
                                        {deletingId === todo.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
};

export default Todo;
