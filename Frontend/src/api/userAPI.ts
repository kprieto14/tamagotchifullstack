import axios from 'axios';
import type { AuthToken, NewUserParams, User } from '../types';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function userApi() {
    const withAuth = (token?: AuthToken) => token ? { Authorization: `Bearer ${token}` } : {}

    return {
        createNewUser: async (newUserData: NewUserParams, token?: AuthToken): Promise<User> => {            
            const createUser = await axios.post(`${baseURL}/user`, newUserData, {
                headers: withAuth(token),
            })

            if (createUser.status === 201) {
                return createUser.data;
            }

            throw new Error('Failed to create user');
        },
    }
}

export default userApi()