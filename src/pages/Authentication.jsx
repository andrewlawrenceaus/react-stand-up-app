import { json, redirect } from "react-router-dom";
import AuthForm from "../components/auth/AuthForm";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebase";

function AuthenticationPage() {
    return <AuthForm />
}

export async function action({ request }) {
    const searchParams = new URL(request.url).searchParams;
    const mode = searchParams.get('mode') || 'login';

    if (mode !== 'login' && mode !== 'signup') {
        throw json({ message: 'Unsupported mode.' }, { status: 422 });
    }

    const data = await request.formData();
    const authData = {
        email: data.get('email'),
        password: data.get('password')
    };

    if (mode === 'signup') {
        try {
            await createUserWithEmailAndPassword(auth, authData.email, authData.password);
        } catch (error) {
            throw json({ message: error.message }, { status: 500 })
        }
    }

    if (mode === 'login') {
        try {
            await signInWithEmailAndPassword(auth, authData.email, authData.password);
        } catch (error) {
            throw json({ message: error.message }, { status: 500 })
        }
    }
    return redirect('/');
}

export default AuthenticationPage;