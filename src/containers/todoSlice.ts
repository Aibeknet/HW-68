import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosAPI from '../axiosApi';

interface Todo {
    id: string;
    title: string;
    status: boolean;
}

interface TodoState {
    todoApp: Todo[];
    isloading: boolean;
    error: boolean;
}

const initialState: TodoState = {
    todoApp: [],
    isloading: false,
    error: false,
};

export const fetchTodoApp = createAsyncThunk('todos/fetchTodoApp', async () => {
    const response = await axiosAPI.get('/todos.json');

    if (response.data && Object.keys(response.data).length > 0) {
        return Object.entries(response.data).map(([id, todo]: [string, unknown]) => {
            const typedTodo = todo as Todo;
            return {
                id,
                title: typedTodo.title,
                status: typedTodo.status,
            };
        });
    }
    return [];
});

export const addTodo = createAsyncThunk(
    'todos/addTodo',
    async (title: string, { dispatch }) => {
        const response = await axiosAPI.post('/todos.json', {
            title,
            status: false,
        });
        const newTodo = { id: response.data.name, title, status: false };
        dispatch(fetchTodoApp());
        return newTodo;
    }
);

export const toggleTodo = createAsyncThunk(
    'todos/toggleTodo',
    async (id: string) => {
        const response = await axiosAPI.get(`/todos/${id}.json`);
        const todo = response.data;
        if (todo) {
            await axiosAPI.patch(`/todos/${id}.json`, { status: !todo.status });
            return { id, status: !todo.status };
        }
        throw new Error('Todo not found');
    }
);

export const deleteTodo = createAsyncThunk(
    'todos/deleteTodo',
    async (id: string) => {
        await axiosAPI.delete(`/todos/${id}.json`);
        return id;
    }
);

const todoSlice = createSlice({
    extraReducers: (builder) => {
        builder
            .addCase(fetchTodoApp.pending, (state) => {
                state.isloading = true;
                state.error = false;
            })
            .addCase(fetchTodoApp.fulfilled, (state, action: PayloadAction<Todo[]>) => {
                state.isloading = false;
                state.todoApp = action.payload;
            })
            .addCase(fetchTodoApp.rejected, (state) => {
                state.isloading = false;
                state.error = true;
            })
            .addCase(addTodo.fulfilled, (state, action: PayloadAction<Todo>) => {
                state.todoApp.push(action.payload);
            })
            .addCase(toggleTodo.fulfilled, (state, action: PayloadAction<{ id: string; status: boolean }>) => {
                const index = state.todoApp.findIndex((todo) => todo.id === action.payload.id);
                if (index !== -1) {
                    state.todoApp[index].status = action.payload.status;
                }
            })
            .addCase(deleteTodo.fulfilled, (state, action: PayloadAction<string>) => {
                state.todoApp = state.todoApp.filter((todo) => todo.id !== action.payload);
            });
    },
    initialState,
    name: 'todos',
    reducers: {},
});

export const todoReducer = todoSlice.reducer;
