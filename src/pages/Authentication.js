import { json, redirect } from "react-router-dom";
import AuthForm from "../components/auth/AuthForm";

function AuthenticationPage() {
    return <AuthForm />
}

export async function action({ request }){
    const searchParams = new URL(request.url).searchParams;
    const mode = searchParams.get('mode') || 'login';

    if (mode!=='login' && mode !== 'signup'){
        throw json({message: 'Unsupported mode.'}, {status: 422});
    }

    const data = await request.formData();
    const authData = {
        email: data.get('email'),
        password: data.get('password')
    };

    console.log(authData);
    return redirect('/');
}

export default AuthenticationPage;