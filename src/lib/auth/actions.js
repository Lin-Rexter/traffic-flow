'use server'

import { signIn } from '@/auth'

export async function authenticate(_currentState, formData) {
    try {
        await signIn('credentials', formData)
    } catch (error) {
        if (error) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.'
                default:
                    return 'Something went wrong.'
            }
        }
        throw error
    }
}

export async function serverAction() {
    const session = await getSession()
    const userRole = session?.user?.role

    // Check if user is authorized to perform the action
    if (userRole !== 'admin') {
        throw new Error('Unauthorized access: User does not have admin privileges.')
    }
}